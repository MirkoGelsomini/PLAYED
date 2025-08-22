const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../utils/authMiddleware');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


/**
 * Rotte per gli utenti
 */

// Middleware per validare ObjectId
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!id || id === 'undefined' || id === 'me') {
    return res.status(400).json({ error: 'ID utente non valido' });
  }
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Formato ID non valido' });
  }
  
  next();
};

// Login
router.post('/auth/login', userController.login);

// Logout
router.post('/auth/logout', userController.logout);

// Ottieni i dati dell'utente autenticato
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Endpoint per verificare lo stato dell'autenticazione senza errore 401
router.get('/auth/status', (req, res) => {
  const token = req.cookies && req.cookies.token;
  if (!token) {
    return res.json({ isAuthenticated: false, user: null });
  }
  
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verifica che il token contenga i dati necessari
    if (!decoded.id) {
      console.error('Token non contiene ID utente');
      return res.json({ isAuthenticated: false, user: null });
    }
    
    res.json({ isAuthenticated: true, user: decoded });
  } catch (error) {
    console.error('Errore nella verifica del token:', error.message);
    res.json({ isAuthenticated: false, user: null });
  }
});


// CRUD - con validazione ObjectId
router.post('/', userController.createUser); // Crea utente
router.get('/', authenticateToken, userController.getAllUsers); // Lista utenti
router.get('/:id', authenticateToken, validateObjectId, userController.getUserById); // Ottieni utente per ID
router.put('/:id', authenticateToken, validateObjectId, userController.updateUser); // Aggiorna utente
router.delete('/:id', authenticateToken, validateObjectId, userController.deleteUser); // Elimina utente

module.exports = router; 