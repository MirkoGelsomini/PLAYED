// Definizione delle rotte per i progressi
const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const auth = require('../utils/authMiddleware');

// Salva o aggiorna i progressi di una sessione di gioco
router.post('/', auth.authenticateToken, progressController.saveProgress);

// Recupera tutti i progressi dell'utente
router.get('/', auth.authenticateToken, progressController.getProgress);

module.exports = router; 