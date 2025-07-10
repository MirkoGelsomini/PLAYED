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

// Rotta per ottenere tutti i giochi (inclusi quiz e memory generati dinamicamente)
router.get('/', (req, res) => {
  try {
    const questions = getQuestions();
    const memoryGames = generateMemoryGames(questions);
    const quizGames = generateQuizGames(questions);
    const matchingGames = generateMatchingGames(questions);
    
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

// Rotta per ottenere un gioco specifico
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const questions = getQuestions();
    const memoryGames = generateMemoryGames(questions);
    const quizGames = generateQuizGames(questions);
    const matchingGames = generateMatchingGames(questions);
    
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