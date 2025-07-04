const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  // Prima cerca il token nel cookie
  const token = req.cookies && req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Token mancante' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token non valido' });
    req.user = user;
    next();
  });
}

module.exports = {
  authenticateToken,
}; 