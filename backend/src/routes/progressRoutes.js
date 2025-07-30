// Definizione delle rotte per i progressi
const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const auth = require('../utils/authMiddleware');

// Salva il progresso di una partita
router.post('/', auth.authenticateToken, progressController.saveProgress);

// Recupera tutti i progressi dell'utente
router.get('/', auth.authenticateToken, progressController.getProgress);

// Ottieni statistiche aggregate dell'utente
router.get('/stats', auth.authenticateToken, progressController.getStats);

// Ottieni leaderboard
router.get('/leaderboard', auth.authenticateToken, progressController.getLeaderboard);

// Aggiorna le domande risposte per una sessione
router.post('/answer', auth.authenticateToken, progressController.answerQuestion);

// Sblocca manualmente un livello per un gioco
router.post('/unlock-level', auth.authenticateToken, progressController.unlockLevel);

// Restituisce domande fatte/non fatte e suggerimenti per un gioco
router.get('/questions', auth.authenticateToken, progressController.getQuestionProgressAndSuggestions);
router.get('/detailed', auth.authenticateToken, progressController.getDetailedProgress);

module.exports = router; 