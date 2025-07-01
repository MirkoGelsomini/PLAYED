// Definizione delle rotte per gli utenti
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// CRUD
router.post('/', userController.createUser); // Crea utente
router.get('/', userController.getAllUsers); // Lista utenti
router.get('/:id', userController.getUserById); // Ottieni utente per ID
router.put('/:id', userController.updateUser); // Aggiorna utente
router.delete('/:id', userController.deleteUser); // Elimina utente

module.exports = router; 