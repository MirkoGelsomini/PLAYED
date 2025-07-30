// Sistema centralizzato per la gestione degli errori - Frontend
import { useState } from 'react';

// Classi di errore personalizzate
class AppError extends Error {
  constructor(message, statusCode = 500, type = 'GENERIC') {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.timestamp = new Date();
  }
}

class NetworkError extends AppError {
  constructor(message = 'Errore di connessione') {
    super(message, 0, 'NETWORK');
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Sessione scaduta') {
    super(message, 401, 'AUTH');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Accesso negato') {
    super(message, 403, 'FORBIDDEN');
  }
}

class ValidationError extends AppError {
  constructor(message = 'Dati non validi') {
    super(message, 400, 'VALIDATION');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Risorsa non trovata') {
    super(message, 404, 'NOT_FOUND');
  }
}

class ServerError extends AppError {
  constructor(message = 'Errore del server') {
    super(message, 500, 'SERVER');
  }
}

// Utility per gestire errori di rete
const handleNetworkError = (error) => {
  if (!navigator.onLine) {
    return new NetworkError('Nessuna connessione internet');
  }
  if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
    return new NetworkError('Impossibile raggiungere il server');
  }
  return new NetworkError(error.message);
};

// Utility per gestire errori HTTP
const handleHttpError = (error) => {
  const status = error.response?.status;
  const message = error.response?.data?.error?.message || error.response?.data?.message || error.message;

  switch (status) {
    case 400:
      return new ValidationError(message);
    case 401:
      return new AuthenticationError(message);
    case 403:
      return new AuthorizationError(message);
    case 404:
      return new NotFoundError(message);
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message);
    default:
      return new AppError(message, status);
  }
};

// Gestore principale degli errori
const handleError = (error) => {
  let appError;

  // Gestisci errori di rete
  if (!error.response) {
    appError = handleNetworkError(error);
  } else {
    // Gestisci errori HTTP
    appError = handleHttpError(error);
  }

  // Log dell'errore in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Errore Frontend:', {
      message: appError.message,
      statusCode: appError.statusCode,
      type: appError.type,
      originalError: error,
      stack: appError.stack,
      timestamp: appError.timestamp
    });
  }

  return appError;
};

// Utility per gestire errori in componenti React
const useErrorHandler = () => {
  const handleComponentError = (error, setError, setLoading = null) => {
    const appError = handleError(error);
    
    // Gestisci errori di autenticazione
    if (appError instanceof AuthenticationError) {
      // Reindirizza al login dopo un breve delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }

    // Imposta l'errore nel componente
    setError(appError.message);
    
    // Ferma il loading se fornito
    if (setLoading) {
      setLoading(false);
    }

    return appError;
  };

  return { handleComponentError };
};

// Wrapper per chiamate API con gestione errori automatica
const apiCall = async (apiFunction, setError, setLoading = null) => {
  if (setLoading) setLoading(true);
  
  try {
    const result = await apiFunction();
    if (setError) setError('');
    return result;
  } catch (error) {
    const appError = handleError(error);
    if (setError) setError(appError.message);
    throw appError;
  } finally {
    if (setLoading) setLoading(false);
  }
};

// Utility per messaggi di errore user-friendly
const getUserFriendlyMessage = (error) => {
  const messages = {
    NETWORK: {
      'Nessuna connessione internet': 'Verifica la tua connessione internet e riprova',
      'Impossibile raggiungere il server': 'Il server non è raggiungibile. Riprova più tardi'
    },
    AUTH: {
      'Sessione scaduta': 'La tua sessione è scaduta. Effettua nuovamente il login',
      'Token non valido': 'Sessione non valida. Effettua nuovamente il login'
    },
    VALIDATION: {
      'Dati non validi': 'I dati inseriti non sono corretti. Controlla e riprova',
      'Email già esistente': 'Esiste già un account con questa email'
    },
    SERVER: {
      'Errore del server': 'Si è verificato un errore. Riprova più tardi'
    }
  };

  const category = messages[error.type];
  if (category && category[error.message]) {
    return category[error.message];
  }

  return error.message;
};

// Utility per controlli rapidi
const assert = {
  exists: (value, message = 'Campo richiesto') => {
    if (!value) throw new ValidationError(message);
  },
  email: (email, message = 'Email non valida') => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new ValidationError(message);
  },
  password: (password, minLength = 6, message = `Password deve essere di almeno ${minLength} caratteri`) => {
    if (!password || password.length < minLength) throw new ValidationError(message);
  },
  authenticated: (user, message = 'Autenticazione richiesta') => {
    if (!user) throw new AuthenticationError(message);
  }
};

// Hook per gestire errori in componenti funzionali
const useErrorState = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleError = (error) => {
    const appError = handleError(error);
    setError(getUserFriendlyMessage(appError));
    setLoading(false);
    return appError;
  };

  const clearError = () => setError('');

  return {
    error,
    loading,
    setError,
    setLoading,
    handleError,
    clearError
  };
};

// Utility per creare errori rapidamente
const createError = {
  network: (message) => new NetworkError(message),
  auth: (message) => new AuthenticationError(message),
  forbidden: (message) => new AuthorizationError(message),
  validation: (message) => new ValidationError(message),
  notFound: (message) => new NotFoundError(message),
  server: (message) => new ServerError(message),
  custom: (message, statusCode) => new AppError(message, statusCode)
};

export {
  AppError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ServerError,
  handleError,
  useErrorHandler,
  apiCall,
  getUserFriendlyMessage,
  assert,
  useErrorState,
  createError
}; 