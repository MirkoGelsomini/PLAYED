const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
  const questionsPath = path.join(__dirname, '../data/questions.json');
  fs.readFile(questionsPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Errore lettura domande' });
    res.json(JSON.parse(data));
  });
});

module.exports = router; 