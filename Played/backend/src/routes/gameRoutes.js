const express = require('express');
const router = express.Router();
const { 
  generateMemoryGames,
  generateQuizGames,
  generateMatchingGames,
  memorySelectionGame,
  quizSelectionGame,
  matchingSelectionGame,
  sortingSelectionGame
} = require('../models/Game');
const { authenticateToken } = require('../utils/authMiddleware');
const questionService = require('../services/questionService');

/**
 * Rotte per i giochi
 */

// Rotta per ottenere tutti i giochi (inclusi quiz e memory generati dinamicamente)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.schoolLevel || !user.class) {
      return res.status(401).json({ error: 'Utente non autenticato o dati scolastici non disponibili' });
    }
    
    // Permetti di specificare difficoltà tramite query param
    const minDifficulty = req.query.minDifficulty ? parseInt(req.query.minDifficulty) : 1;
    const maxDifficulty = req.query.maxDifficulty ? parseInt(req.query.maxDifficulty) : 10;
    
    // Recupera le domande dal database
    const questions = await questionService.getQuestionsBySchoolLevel(
      user.schoolLevel,
      user.class,
      null, // tipo (null = tutti)
      null, // categoria (null = tutte)
      minDifficulty,
      maxDifficulty
    );
    
    const memoryGames = generateMemoryGames(questions);
    const quizGames = generateQuizGames(questions);
    const matchingGames = generateMatchingGames(questions);
    const allGames = [
      memorySelectionGame,
      quizSelectionGame,
      matchingSelectionGame,
      sortingSelectionGame,
      ...memoryGames,
      ...quizGames,
      ...matchingGames
    ];
    res.json(allGames);
  } catch (error) {
    console.error('Errore nella generazione dei giochi:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Rotta per ottenere domande filtrate per school level e classe
router.get('/questions/filtered', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.schoolLevel || !user.class) {
      return res.status(401).json({ error: 'Utente non autenticato o dati scolastici non disponibili' });
    }
    
    const minDifficulty = req.query.minDifficulty ? parseInt(req.query.minDifficulty) : 1;
    const maxDifficulty = req.query.maxDifficulty ? parseInt(req.query.maxDifficulty) : 10;
    const gameType = req.query.gameType; // opzionale: filtra per tipo di gioco
    
    // Recupera le domande dal database
    const questions = await questionService.getQuestionsBySchoolLevel(
      user.schoolLevel,
      user.class,
      gameType, // tipo di gioco
      null, // categoria (null = tutte)
      minDifficulty,
      maxDifficulty
    );
    
    res.json(questions);
  } catch (error) {
    console.error('Errore nel recupero delle domande filtrate:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Nota: la rotta "/:id" è stata rimossa perché non utilizzata e conteneva riferimenti a funzioni non definite

module.exports = router; 