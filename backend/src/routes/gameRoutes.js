// Definizione delle rotte per i giochi
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { 
  generateMemoryGames,
  generateQuizGames,
  generateMatchingGames,
  memorySelectionGame,
  quizSelectionGame,
  matchingSelectionGame
} = require('../models/Game');
const { authenticateToken } = require('../utils/authMiddleware');

// Funzione per leggere le domande dal file JSON
const getQuestions = () => {
  try {
    const questionsPath = path.join(__dirname, '../data/questions.json');
    const data = fs.readFileSync(questionsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Errore nella lettura delle domande:', error);
    return [];
  }
};

// Funzione di filtro domande per età e difficoltà
function filterQuestions(questions, userAge, minDifficulty = 1, maxDifficulty = 10) {
  return questions.filter(q => {
    // Controlla difficoltà
    const difficultyMatch = q.difficulty >= minDifficulty && q.difficulty <= maxDifficulty;
    
    // Controlla età se la domanda ha un ageRange
    let ageMatch = true;
    if (q.ageRange && Array.isArray(q.ageRange) && q.ageRange.length === 2) {
      const [minAge, maxAge] = q.ageRange;
      ageMatch = userAge >= minAge && userAge <= maxAge;
    }
    
    return difficultyMatch && ageMatch;
  });
}

// Rotta per ottenere tutti i giochi (inclusi quiz e memory generati dinamicamente)
router.get('/', authenticateToken, (req, res) => {
  try {
    const user = req.user;
    if (!user || user.age === undefined || user.age === null) {
      return res.status(401).json({ error: 'Utente non autenticato o età non disponibile' });
    }
    // Permetti di specificare difficoltà tramite query param
    const minDifficulty = req.query.minDifficulty ? parseInt(req.query.minDifficulty) : 1;
    const maxDifficulty = req.query.maxDifficulty ? parseInt(req.query.maxDifficulty) : 10;
    const questions = getQuestions();
    const filteredQuestions = filterQuestions(questions, user.age, minDifficulty, maxDifficulty);
    const memoryGames = generateMemoryGames(filteredQuestions);
    const quizGames = generateQuizGames(filteredQuestions);
    const matchingGames = generateMatchingGames(filteredQuestions);
    const allGames = [
      memorySelectionGame,
      quizSelectionGame,
      matchingSelectionGame,
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

// Rotta per ottenere domande filtrate per età
router.get('/questions/filtered', authenticateToken, (req, res) => {
  try {
    const user = req.user;
    if (!user || user.age === undefined || user.age === null) {
      return res.status(401).json({ error: 'Utente non autenticato o età non disponibile' });
    }
    
    const minDifficulty = req.query.minDifficulty ? parseInt(req.query.minDifficulty) : 1;
    const maxDifficulty = req.query.maxDifficulty ? parseInt(req.query.maxDifficulty) : 10;
    const gameType = req.query.gameType; // opzionale: filtra per tipo di gioco
    
    const questions = getQuestions();
    let filteredQuestions = filterQuestions(questions, user.age, minDifficulty, maxDifficulty);
    
    // Filtra per tipo di gioco se specificato
    if (gameType) {
      filteredQuestions = filteredQuestions.filter(q => q.type === gameType);
    }
    
    res.json(filteredQuestions);
  } catch (error) {
    console.error('Errore nel recupero delle domande filtrate:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Rotta per ottenere un gioco specifico
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const user = req.user;
    if (!user || user.age === undefined || user.age === null) {
      return res.status(401).json({ error: 'Utente non autenticato o età non disponibile' });
    }
    const minDifficulty = req.query.minDifficulty ? parseInt(req.query.minDifficulty) : 1;
    const maxDifficulty = req.query.maxDifficulty ? parseInt(req.query.maxDifficulty) : 10;
    const { id } = req.params;
    const questions = getQuestions();
    const filteredQuestions = filterQuestions(questions, user.age, minDifficulty, maxDifficulty);
    const memoryGames = generateMemoryGames(filteredQuestions);
    const quizGames = generateQuizGames(filteredQuestions);
    const matchingGames = generateMatchingGames(filteredQuestions);
    const allGames = [
      memorySelectionGame,
      quizSelectionGame,
      matchingSelectionGame,
      ...memoryGames,
      ...quizGames,
      ...matchingGames
    ];
    const game = allGames.find(g => g.id === id);
    if (!game) {
      return res.status(404).json({ error: 'Gioco non trovato' });
    }
    res.json(game);
  } catch (error) {
    console.error('Errore nel recupero del gioco:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

module.exports = router; 