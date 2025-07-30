const ProgressService = require('../services/progressService');
const Progress = require('../models/Progress');
const { createError, assert } = require('../utils/errorHandler');

// Salva il progresso di una partita
exports.saveProgress = async (req, res) => {
  const userId = req.user.id;
  const { gameType, game, score, level, completed, timeSpent, mistakes, sessionId } = req.body;
  
  assert.authenticated(userId, 'Utente non autenticato');

  const gameData = {
    game: gameType || req.body.game, 
    score: parseInt(score) || 0,
    level: parseInt(level) || 1,
    completed: Boolean(completed),
    timeSpent: parseInt(timeSpent) || 0,
    mistakes: parseInt(mistakes) || 0,
    sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };

  const result = await ProgressService.saveProgress(userId, gameData);

  res.status(200).json({
    success: true,
    progress: result.progress,
    newTrophies: result.newTrophies,
    message: 'Progresso salvato con successo'
  });
};

// Recupera tutti i progressi dell'utente
exports.getProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, gameType, sessionId } = req.query;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Utente non autenticato' 
      });
    }

    let progress;
    if (sessionId) {
      // Cerca una sessione specifica
      progress = await ProgressService.getProgressBySessionId(userId, sessionId);
    } else if (gameType) {
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

// Aggiorna le domande risposte per una sessione
exports.answerQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId, questionId, isCorrect, questionDifficulty } = req.body;
    
    if (!userId || !sessionId || !questionId) {
      return res.status(400).json({ success: false, message: 'Dati mancanti' });
    }
    
    const progress = await ProgressService.updateAnsweredQuestions(userId, sessionId, questionId, isCorrect, questionDifficulty);
    if (!progress) {
      return res.status(404).json({ success: false, message: 'Progresso non trovato' });
    }
    
    res.status(200).json({ success: true, progress });
  } catch (error) {
    console.error("Errore nell'aggiornamento delle domande risposte:", error);
    res.status(500).json({ success: false, message: "Errore nell'aggiornamento delle domande risposte" });
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
    res.status(200).json({ success: true, ...result, maxUnlockedLevel: result.maxUnlockedLevel });
  } catch (error) {
    console.error('Errore nel recupero stato domande e suggerimenti:', error);
    res.status(500).json({ success: false, message: 'Errore nel recupero stato domande e suggerimenti' });
  }
}; 

// Ottieni progressi dettagliati per la home
exports.getDetailedProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const gameTypes = ['quiz', 'memory', 'matching', 'sorting'];
    const detailedProgress = {};

    for (const gameType of gameTypes) {
      try {
        const progressData = await ProgressService.getQuestionProgressAndSuggestions(userId, gameType);
        detailedProgress[gameType] = {
          maxUnlockedLevel: progressData.maxUnlockedLevel,
          correctAnswersPerLevel: progressData.correctAnswersPerLevel,
          answeredCount: progressData.answeredQuestions.length,
          totalAvailable: progressData.answeredQuestions.length + progressData.unansweredQuestions.length,
          progressByLevel: {}
        };

        // Calcola progresso per ogni livello
        const { GAME_CONSTRAINTS } = require('../../../shared/constraints');
        for (let level = 1; level <= progressData.maxUnlockedLevel; level++) {
          const correctForLevel = progressData.correctAnswersPerLevel[level] || 0;
          const threshold = GAME_CONSTRAINTS.LEVEL_UNLOCK.MIN_CORRECT_ANSWERS; // Soglia per sbloccare il livello successivo
          
          // Per il livello corrente, mostra il progresso fino a 5
          // Per i livelli completati, mostra 5/5 (100%)
          let progress;
          let displayCorrect;
          
          if (level === progressData.maxUnlockedLevel) {
            // Livello corrente: mostra progresso reale (es. 3/5)
            displayCorrect = correctForLevel;
            progress = Math.min(100, (correctForLevel / threshold) * 100);
          } else {
            // Livelli completati: mostra 5/5 (100%)
            displayCorrect = threshold;
            progress = 100;
          }
          
          detailedProgress[gameType].progressByLevel[level] = {
            correctAnswers: displayCorrect,
            threshold: threshold,
            progress: progress,
            unlocked: level < progressData.maxUnlockedLevel,
            nextLevelUnlocked: level === progressData.maxUnlockedLevel - 1,
            isCurrentLevel: level === progressData.maxUnlockedLevel
          };
        }
      } catch (error) {
        console.error(`Errore nel recupero progressi per ${gameType}:`, error);
        detailedProgress[gameType] = {
          maxUnlockedLevel: 1,
          correctAnswersPerLevel: {},
          answeredCount: 0,
          totalAvailable: 0,
          progressByLevel: {}
        };
      }
    }

    res.json(detailedProgress);
  } catch (error) {
    console.error('Errore nel recupero progressi dettagliati:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
}; 

// Sblocca manualmente un livello per un gioco
exports.unlockLevel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameType, level } = req.body;
    
    if (!userId || !gameType || !level) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dati mancanti: userId, gameType e level sono richiesti' 
      });
    }

    // Trova tutte le sessioni dell'utente per quel gioco
    const progresses = await Progress.find({ 
      user: userId,
      game: gameType
    });

    if (progresses.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Nessun progresso trovato per questo gioco' 
      });
    }

    // Aggiorna il maxUnlockedLevel in tutte le le sessioni
    let updatedCount = 0;
    for (const progress of progresses) {
      if (progress.maxUnlockedLevel < level) {
        progress.maxUnlockedLevel = level;
        await progress.save();
        updatedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Livello ${level} sbloccato con successo per ${gameType}`,
      unlockedLevel: level,
      gameType: gameType
    });
  } catch (error) {
    console.error('Errore nello sblocco livello:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nello sblocco del livello'
    });
  }
}; 