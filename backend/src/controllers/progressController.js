const Progress = require('../models/Progress');

// Salva o aggiorna i progressi di una sessione di gioco
exports.saveProgress = async (req, res) => {
  try {
    const { game, sessionId, score, level, completed, details } = req.body;
    const user = req.user.id;
    if (!user) {
      return res.status(401).json({ error: 'Utente non autenticato' });
    }

    // Cerca se esiste già un progresso per questa sessione
    let progress = await Progress.findOne({ user, game, sessionId });
    if (progress) {
      // Aggiorna
      progress.score = score;
      progress.level = level;
      progress.completed = completed;
      progress.details = details;
      progress.date = new Date();
      await progress.save();
    } else {
      // Crea nuovo
      progress = new Progress({ user, game, sessionId, score, level, completed, details });
      await progress.save();
    }
    res.status(200).json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Recupera tutti i progressi dell'utente (con filtri opzionali)
exports.getProgress = async (req, res) => {
  try {
    const user = req.user.id; 
    const { game } = req.query;
    const filter = { user };
    if (game) filter.game = game;
    const progresses = await Progress.find(filter).sort({ date: -1 });
    res.status(200).json(progresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 