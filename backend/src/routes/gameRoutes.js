// Definizione delle rotte per i giochi
const express = require('express');
const router = express.Router();
const { memoryGameExample } = require('../models/Game');

// Rotta di esempio
router.get('/', (req, res) => {
  res.json([
    memoryGameExample
  ]);
});

module.exports = router; 