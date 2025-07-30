// Sistema centralizzato per la gestione degli errori - Backend

// Classi di errore personalizzate
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Autenticazione richiesta') {
    super(message, 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Accesso negato') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Risorsa') {
    super(`${resource} non trovato`, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflitto di dati') {
    super(message, 409);
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Errore del database') {
    super(message, 500, false);
  }
}

// Utility per gestire errori MongoDB
const handleMongoError = (error) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return new ConflictError(`${field} già esistente`);
  }
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map(err => err.message).join(', ');
    return new ValidationError(message);
  }
  if (error.name === 'CastError') {
    return new ValidationError('ID non valido');
  }
  return new DatabaseError(error.message);
};

// Utility per gestire errori JWT
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Token non valido');
  }
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token scaduto');
  }
  return new AuthenticationError('Errore di autenticazione');
};

// Middleware per la gestione automatica degli errori
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Converti errori MongoDB in AppError
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    error = handleMongoError(err);
  }

  // Converti errori JWT in AppError
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  }

  // Converti errori di validazione Joi
  if (err.isJoi) {
    error = new ValidationError(err.details[0].message);
  }

  // Se non è un AppError, convertilo
  if (!(error instanceof AppError)) {
    error = new AppError(error.message || 'Errore interno del server', 500, false);
  }

  // Log dell'errore in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Errore:', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
      user: req.user?.id
    });
  }

  // Invia risposta di errore
  res.status(error.statusCode).json({
    success: false,
    error: {
      message: error.message,
      statusCode: error.statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  });
};

// Middleware per gestire errori 404
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError('Route');
  next(error);
};

// Utility per creare errori rapidamente
const createError = {
  validation: (message) => new ValidationError(message),
  auth: (message) => new AuthenticationError(message),
  forbidden: (message) => new AuthorizationError(message),
  notFound: (resource) => new NotFoundError(resource),
  conflict: (message) => new ConflictError(message),
  database: (message) => new DatabaseError(message),
  custom: (message, statusCode) => new AppError(message, statusCode)
};

// Utility per controlli rapidi
const assert = {
  exists: (value, message = 'Valore richiesto') => {
    if (!value) throw createError.validation(message);
  },
  authenticated: (user, message = 'Autenticazione richiesta') => {
    if (!user) throw createError.auth(message);
  },
  authorized: (condition, message = 'Accesso negato') => {
    if (!condition) throw createError.forbidden(message);
  },
  found: (resource, message = 'Risorsa non trovata') => {
    if (!resource) throw createError.notFound(message);
  }
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  errorHandler,
  notFoundHandler,
  createError,
  assert,
  handleMongoError,
  handleJWTError
}; 