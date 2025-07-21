const ProgressService = require('../services/progressService');

// Salva il progresso di una partita
exports.saveProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameType, game, score, level, completed, timeSpent, mistakes } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Utente non autenticato' 
      });
    }

    const gameData = {
      game: gameType || req.body.game, 
      score: parseInt(score) || 0,
      level: parseInt(level) || 1,
      completed: Boolean(completed),
      timeSpent: parseInt(timeSpent) || 0,
      mistakes: parseInt(mistakes) || 0
    };

    const result = await ProgressService.saveProgress(userId, gameData);

    res.status(200).json({
      success: true,
      progress: result.progress,
      newTrophies: result.newTrophies,
      message: 'Progresso salvato con successo'
    });
  } catch (error) {
    console.error('Errore nel salvataggio progresso:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Errore nel salvataggio del progresso' 
    });
  }
};

// Recupera tutti i progressi dell'utente
exports.getProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, gameType } = req.query;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Utente non autenticato' 
      });
    }

    let progress;
    if (gameType) {
      progress = await ProgressService.getProgressByGameType(userId, gameType);
    } else {
      progress = await ProgressService.getUserProgress(userId, parseInt(limit));
    }

    res.status(200).json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Errore nel recupero progresso:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Errore nel recupero del progresso' 
    });
  }
};

// Ottieni statistiche aggregate dell'utente
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Utente non autenticato' 
      });
    }

    const stats = await ProgressService.getAggregatedStats(userId);

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Errore nel recupero statistiche:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Errore nel recupero delle statistiche' 
    });
  }
};

// Ottieni leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { type = 'points', limit = 10 } = req.query;

    const leaderboard = await ProgressService.getLeaderboard(type, parseInt(limit));

    res.status(200).json({
      success: true,
      leaderboard,
      type
    });
  } catch (error) {
    console.error('Errore nel recupero leaderboard:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Errore nel recupero della classifica' 
    });
  }
};

// Ottieni trend di miglioramento
exports.getImprovementTrend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Utente non autenticato' 
      });
    }

    const trend = await ProgressService.getImprovementTrend(userId, parseInt(days));

    res.status(200).json({
      success: true,
      trend
    });
  } catch (error) {
    console.error('Errore nel recupero trend:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Errore nel recupero del trend di miglioramento' 
    });
  }
}; 

// Aggiorna le domande risposte per una sessione
exports.answerQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId, questionId } = req.body;
    if (!userId || !sessionId || !questionId) {
      return res.status(400).json({ success: false, message: 'Dati mancanti' });
    }
    const progress = await ProgressService.updateAnsweredQuestions(userId, sessionId, questionId);
    if (!progress) {
      return res.status(404).json({ success: false, message: 'Progresso non trovato' });
    }
    res.status(200).json({ success: true, progress });
  } catch (error) {
    console.error('Errore nell\'aggiornamento delle domande risposte:', error);
    res.status(500).json({ success: false, message: 'Errore nell\'aggiornamento delle domande risposte' });
  }
};

// Restituisce domande fatte/non fatte e suggerimenti per un gioco
exports.getQuestionProgressAndSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameType } = req.query;
    if (!userId || !gameType) {
      return res.status(400).json({ success: false, message: 'Dati mancanti' });
    }
    const result = await ProgressService.getQuestionProgressAndSuggestions(userId, gameType);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Errore nel recupero stato domande e suggerimenti:', error);
    res.status(500).json({ success: false, message: 'Errore nel recupero stato domande e suggerimenti' });
  }
}; 