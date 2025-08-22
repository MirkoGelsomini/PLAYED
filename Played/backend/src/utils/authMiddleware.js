const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware per autenticare gli utenti
 */

function authenticateToken(req, res, next) {
  // Cerca il token nel cookie o nell'header Authorization
  let token = req.cookies && req.cookies.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ error: 'Token mancante' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Errore nella verifica del token:', err.message);
      return res.status(401).json({ error: 'Token non valido' });
    }
    
    // Assicurati che l'ID sia sempre una stringa valida
    if (user && user.id) {
      user.id = user.id.toString();
    }
    
    req.user = user;
    next();
  });
}

module.exports = {
  authenticateToken,
}; 