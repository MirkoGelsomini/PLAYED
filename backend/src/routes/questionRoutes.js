const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../utils/authMiddleware');

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

// Rotta per ottenere tutte le domande (senza filtro)
router.get('/', (req, res) => {
  const questionsPath = path.join(__dirname, '../data/questions.json');
  fs.readFile(questionsPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Errore lettura domande' });
    res.json(JSON.parse(data));
  });
});

// Rotta per ottenere domande filtrate per età
router.get('/filtered', authenticateToken, (req, res) => {
  try {
    const user = req.user;
    if (!user || user.age === undefined || user.age === null) {
      return res.status(401).json({ error: 'Utente non autenticato o età non disponibile' });
    }
    
    const minDifficulty = req.query.minDifficulty ? parseInt(req.query.minDifficulty) : 1;
    const maxDifficulty = req.query.maxDifficulty ? parseInt(req.query.maxDifficulty) : 10;
    const gameType = req.query.gameType; // opzionale: filtra per tipo di gioco
    
    const questionsPath = path.join(__dirname, '../data/questions.json');
    const data = fs.readFileSync(questionsPath, 'utf8');
    const questions = JSON.parse(data);
    
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

module.exports = router; 