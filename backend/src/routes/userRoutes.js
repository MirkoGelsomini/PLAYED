// Definizione delle rotte per gli utenti
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../utils/authMiddleware');

// CRUD
router.post('/', userController.createUser); // Crea utente
router.get('/', authenticateToken, userController.getAllUsers); // Lista utenti
router.get('/:id', authenticateToken, userController.getUserById); // Ottieni utente per ID
router.put('/:id', authenticateToken, userController.updateUser); // Aggiorna utente
router.delete('/:id', authenticateToken, userController.deleteUser); // Elimina utente

// Login
router.post('/auth/login', userController.login);

// Logout
router.post('/auth/logout', userController.logout);

// Ottieni i dati dell'utente autenticato
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router; 