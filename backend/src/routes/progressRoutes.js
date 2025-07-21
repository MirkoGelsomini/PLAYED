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

// Ottieni trend di miglioramento
router.get('/trend', auth.authenticateToken, progressController.getImprovementTrend);

// Aggiorna le domande risposte per una sessione
router.post('/answer', auth.authenticateToken, progressController.answerQuestion);

// Restituisce domande fatte/non fatte e suggerimenti per un gioco
router.get('/questions', auth.authenticateToken, progressController.getQuestionProgressAndSuggestions);

module.exports = router; 