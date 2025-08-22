const Progress = require('../models/Progress');
const User = require('../models/User');
const TrophyService = require('./trophyService');
const { suggestQuestions } = require('../utils/recommendationEngine');
const { calculateLevel, LEVEL_CONSTRAINTS, GAME_CONSTRAINTS } = require('../../../shared/constraints');
const questionService = require('./questionService');



/**
 * Servizio per gestire i progressi degli utenti
 */

class ProgressService {

  // Salva il progresso di una partita
  static async saveProgress(userId, gameData) {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const progress = new Progress({
        user: userId, 
        game: gameData.game, 
        sessionId: sessionId, 
        score: gameData.score || 0,
        level: gameData.level || 1,
        completed: gameData.completed || false,
        date: new Date(),
        details: {
          timeSpent: gameData.timeSpent || 0,
          mistakes: gameData.mistakes || 0
        }
      });

      await progress.save();
      // Aggiorna statistiche utente
      await this.updateUserStats(userId, gameData);

      // Controlla e assegna trofei
      const newTrophies = await TrophyService.checkAndAwardTrophies(userId);

      // Aggiorna progresso obiettivi
      await TrophyService.updateObjectiveProgress(
        userId, 
        gameData.game, 
        gameData.score || 0, 
        gameData.completed || false
      );

      return { progress, newTrophies };
    } catch (error) {
      console.error('Errore nel salvataggio progresso:', error);
      throw error;
    }
  }

  // Aggiorna le statistiche dell'utente
  static async updateUserStats(userId, gameData) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      // Aggiorna punti totali
      user.totalPoints = (user.totalPoints || 0) + (gameData.score || 0);

      // Aggiorna partite completate
      if (gameData.completed) {
        user.gamesCompleted = (user.gamesCompleted || 0) + 1;
      }

      // Calcola e aggiorna streak giornaliero
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (user.lastPlayedDate) {
        const lastPlayed = new Date(user.lastPlayedDate);
        lastPlayed.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastPlayed.getTime() === yesterday.getTime()) {
          user.dailyStreak = (user.dailyStreak || 0) + 1;
        } else if (lastPlayed.getTime() < yesterday.getTime()) {
          user.dailyStreak = 1;
        }
      } else {
        user.dailyStreak = 1;
      }

      user.lastPlayedDate = new Date();

      const newLevel = calculateLevel(user.totalPoints);
      if (newLevel !== user.level) {
        user.level = newLevel;
        user.experienceToNextLevel = (newLevel + 1) * LEVEL_CONSTRAINTS.EXPERIENCE.DEFAULT_TO_NEXT_LEVEL;
        // Controlla se ci sono nuovi trofei da sbloccare
        await TrophyService.checkAndAwardTrophies(userId);
      }

      await user.save();
    } catch (error) {
      console.error('Errore nell\'aggiornamento statistiche utente:', error);
    }
  }

  // Ottieni progresso dell'utente
  static async getUserProgress(userId, limit = 50) {
    try {
      const progress = await Progress.find({ user: userId })
        .sort({ date: -1 })
        .limit(limit);

      return progress;
    } catch (error) {
      console.error('Errore nel recupero progresso:', error);
      throw error;
    }
  }

  // Ottieni statistiche aggregate
  static async getAggregatedStats(userId) {
    try {
      const progress = await Progress.find({ user: userId });
      
      const stats = {
        totalGames: progress.length,
        completedGames: progress.filter(p => p.completed).length,
        totalScore: progress.reduce((sum, p) => sum + (p.score || 0), 0),
        averageScore: 0,
        bestScore: Math.max(...progress.map(p => p.score || 0), 0),
        gameTypes: {},
        recentPerformance: [],
        weeklyStats: {},
        monthlyStats: {}
      };

      if (stats.completedGames > 0) {
        stats.averageScore = Math.round(stats.totalScore / stats.completedGames);
      }

      // Statistiche per tipo di gioco
      progress.forEach(p => {
        if (!stats.gameTypes[p.game]) {
          stats.gameTypes[p.game] = {
            count: 0,
            totalScore: 0,
            bestScore: 0
          };
        }
        stats.gameTypes[p.game].count++;
        stats.gameTypes[p.game].totalScore += p.score || 0;
        stats.gameTypes[p.game].bestScore = Math.max(
          stats.gameTypes[p.game].bestScore, 
          p.score || 0
        );
      });

      // Performance recente (ultimi 10 giochi)
      const recentGames = progress.slice(0, 10);
      stats.recentPerformance = recentGames.map(p => ({
        game: p.game,
        score: p.score || 0,
        completed: p.completed,
        date: p.date
      }));

      // Statistiche settimanali
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklyGames = progress.filter(p => new Date(p.date) >= weekAgo);
      
      stats.weeklyStats = {
        games: weeklyGames.length,
        totalScore: weeklyGames.reduce((sum, p) => sum + (p.score || 0), 0),
        averageScore: weeklyGames.length > 0 
          ? Math.round(weeklyGames.reduce((sum, p) => sum + (p.score || 0), 0) / weeklyGames.length)
          : 0
      };

      // Statistiche mensili
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const monthlyGames = progress.filter(p => new Date(p.date) >= monthAgo);
      
      stats.monthlyStats = {
        games: monthlyGames.length,
        totalScore: monthlyGames.reduce((sum, p) => sum + (p.score || 0), 0),
        averageScore: monthlyGames.length > 0
          ? Math.round(monthlyGames.reduce((sum, p) => sum + (p.score || 0), 0) / monthlyGames.length)
          : 0
      };

      return stats;
    } catch (error) {
      console.error('Errore nel calcolo statistiche aggregate:', error);
      throw error;
    }
  }

  // Ottieni leaderboard
  static async getLeaderboard(type = 'points', limit = 10) {
    try {
      let sortField = 'totalPoints';
      switch (type) {
        case 'games':
          sortField = 'gamesCompleted';
          break;
        case 'streak':
          sortField = 'dailyStreak';
          break;
        case 'trophies':
          sortField = 'trophyCount';
          break;
      }

      const users = await User.find({})
        .sort({ [sortField]: -1 })
        .limit(limit)
        .select('name username totalPoints gamesCompleted dailyStreak trophyCount avatar');

      return users;
    } catch (error) {
      console.error('Errore nel recupero leaderboard:', error);
      throw error;
    }
  }

  // Ottieni progresso per tipo di gioco
  static async getProgressByGameType(userId, gameType) {
    try {
      const progress = await Progress.find({ 
        user: userId, 
        game: gameType 
      }).sort({ date: -1 });

      return progress;
    } catch (error) {
      console.error('Errore nel recupero progresso per tipo:', error);
      throw error;
    }
  }

  // Ottieni progresso per sessionId specifico
  static async getProgressBySessionId(userId, sessionId) {
    try {
      const progress = await Progress.find({ 
        user: userId, 
        sessionId: sessionId 
      }).sort({ date: -1 });

      return progress;
    } catch (error) {
      console.error('Errore nel recupero progresso per sessionId:', error);
      throw error;
    }
  }

  // Aggiorna le domande risposte per una sessione e la progressione a livelli
  static async updateAnsweredQuestions(userId, sessionId, questionId, isCorrect, questionDifficulty) {
    try {
      let progress = await Progress.findOne({ user: userId, sessionId });
      
      if (!progress) {
        // Determina il tipo di gioco dal sessionId
        let gameType = 'quiz'; // default
        if (sessionId.includes('-matching-')) {
          gameType = 'matching';
        } else if (sessionId.includes('-memory-')) {
          gameType = 'memory';
        } else if (sessionId.includes('-sorting-')) {
          gameType = 'sorting';
        }
        
        progress = new Progress({
          user: userId,
          game: gameType,
          sessionId: sessionId,
          score: 0,
          level: 1,
          completed: false,
          date: new Date(),
          answeredQuestions: [],
          wrongAnsweredQuestions: [],
          maxUnlockedLevel: 1,
          correctAnswersPerLevel: {}
        });
      }
      
      if (!progress.answeredQuestions) progress.answeredQuestions = [];
      if (!progress.wrongAnsweredQuestions) progress.wrongAnsweredQuestions = [];
      
      // Normalizza questionId per gestire sia ObjectId che stringhe
      const normalizedQuestionId = questionId.toString();
      
      // Gestisci la domanda in base alla correttezza della risposta
      if (isCorrect) {
        // Aggiungi la domanda alle risposte corrette se non è già presente
        const isAlreadyAnswered = progress.answeredQuestions.some(id => id.toString() === normalizedQuestionId);
        if (!isAlreadyAnswered) {
          progress.answeredQuestions.push(normalizedQuestionId);
          
          // Aggiorna i punti dell'utente solo se la risposta è corretta e nuova
          const user = await User.findById(userId);
          if (user) {
            // Calcola punti basati sulla difficoltà della domanda
            const pointsToAdd = questionDifficulty; // punti per livello di difficoltà
            user.totalPoints = (user.totalPoints || 0) + pointsToAdd;
            
            // Aggiorna ultima data di gioco
            user.lastPlayedDate = new Date();
            
            // Calcola nuovo livello
            const newLevel = calculateLevel(user.totalPoints);
            if (newLevel !== user.level) {
              user.level = newLevel;
              user.experienceToNextLevel = (newLevel + 1) * LEVEL_CONSTRAINTS.EXPERIENCE.DEFAULT_TO_NEXT_LEVEL;
            }
            
            await user.save();
            // Dopo un possibile cambio livello, assegna eventuali nuovi trofei
            await TrophyService.checkAndAwardTrophies(userId);
            
            // Aggiorna progresso obiettivi
            await TrophyService.updateObjectiveProgress(userId, progress.game, pointsToAdd, true);
          }
          // Aggiungi punteggio alla sessione/risposta per riflettere l'attività nelle statistiche
          progress.score = (progress.score || 0) + (typeof questionDifficulty === 'number' ? questionDifficulty : 0);
        }
        // Rimuovi dalla lista delle sbagliate se era presente
        progress.wrongAnsweredQuestions = progress.wrongAnsweredQuestions.filter(id => id.toString() !== normalizedQuestionId);
      } else {
        // Aggiungi la domanda alle risposte sbagliate se non è già presente
        const isAlreadyWrong = progress.wrongAnsweredQuestions.some(id => id.toString() === normalizedQuestionId);
        if (!isAlreadyWrong) {
          progress.wrongAnsweredQuestions.push(normalizedQuestionId);
        }
        // Rimuovi dalla lista delle corrette se era presente (per permettere di riprovare)
        progress.answeredQuestions = progress.answeredQuestions.filter(id => id.toString() !== normalizedQuestionId);
      }
      
      // Aggiorna la progressione a livelli solo se la risposta è corretta
      if (isCorrect && typeof questionDifficulty === 'number') {
        const level = questionDifficulty;
        if (!progress.correctAnswersPerLevel) progress.correctAnswersPerLevel = {};
        
        // Aggiorna il conteggio delle corrette per il livello
        const prev = progress.correctAnswersPerLevel[level] || 0;
        progress.correctAnswersPerLevel[level] = prev + 1;
        
        // Sblocca il livello successivo se raggiunta la soglia
        const threshold = GAME_CONSTRAINTS.LEVEL_UNLOCK.MIN_CORRECT_ANSWERS;
        if ((prev + 1) >= threshold && progress.maxUnlockedLevel <= level) {
          progress.maxUnlockedLevel = level + 1;
        }
      }
      
      // Marca il gioco come completato per i tipi che lo richiedono
      if (isCorrect) {
        if (progress.game === 'matching' || progress.game === 'memory' || progress.game === 'sorting') {
          // Per i giochi matching/memory/sorting, marca come completato quando si risponde correttamente
          progress.completed = true;
        } else if (progress.game === 'quiz') {
          // Per i quiz, marca come completato quando si risponde a una domanda (ogni domanda è una sessione)
          progress.completed = true;
        }
      }
      
      await progress.save();
      
      // Converti il Map in oggetto normale per la risposta
      const progressResponse = progress.toObject();
      if (progressResponse.correctAnswersPerLevel instanceof Map) {
        progressResponse.correctAnswersPerLevel = Object.fromEntries(progressResponse.correctAnswersPerLevel);
      }
      
      return progressResponse;
    } catch (error) {
      console.error("Errore nell'aggiornamento delle domande risposte:", error);
      throw error;
    }
  }

  // Restituisce domande fatte/non fatte e suggerimenti SOLO per il livello sbloccato
  static async getQuestionProgressAndSuggestions(userId, gameType) {
    try {
      // Recupera l'utente per ottenere school level e classe
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Utente non trovato');
      }

      // I docenti non hanno schoolLevel e class, quindi restituiamo dati vuoti per loro
      if (user.role === 'docente') {
        return {
          answeredQuestions: [],
          unansweredQuestions: [],
          maxUnlockedLevel: 1,
          correctAnswersPerLevel: {},
          suggestions: []
        };
      }

      if (!user.schoolLevel || !user.class) {
        throw new Error('Dati scolastici dell\'utente non disponibili');
      }

      // Recupera tutte le sessioni dell'utente per quel gioco
      const progresses = await Progress.find({ user: userId, game: gameType });
      const answered = new Set();
      let maxUnlockedLevel = 1;
      let correctAnswersPerLevel = {};
      
      progresses.forEach(p => {
        // Considera solo le domande risposte correttamente
        (p.answeredQuestions || []).forEach(qid => answered.add(qid.toString()));
        
        if (p.maxUnlockedLevel && p.maxUnlockedLevel > maxUnlockedLevel) {
          maxUnlockedLevel = p.maxUnlockedLevel;
        }
        // Aggrega le risposte corrette per livello
        if (p.correctAnswersPerLevel) {
          // Gestisci sia Map che oggetto normale
          const correctAnswers = p.correctAnswersPerLevel instanceof Map 
            ? Object.fromEntries(p.correctAnswersPerLevel)
            : p.correctAnswersPerLevel;
            
          Object.keys(correctAnswers).forEach(level => {
            const levelNum = parseInt(level);
            correctAnswersPerLevel[levelNum] = (correctAnswersPerLevel[levelNum] || 0) + correctAnswers[level];
          });
        }
      });
      
      // Recupera le domande dal database filtrate per school level e classe
      const questions = await questionService.getQuestionsBySchoolLevel(
        user.schoolLevel,
        user.class,
        gameType, // tipo di gioco
        null, // categoria (null = tutte)
        1, // minDifficulty
        maxUnlockedLevel // maxDifficulty = livello sbloccato
      );
      
      // Filtra per tipo di gioco e livello sbloccato
      const filtered = questions.filter(q => {
        return q.type === gameType && q.difficulty <= maxUnlockedLevel;
      });
      
      // Usa toString() per normalizzare gli ID per il confronto
      const answeredQuestions = filtered.filter(q => answered.has(q._id.toString()));
      const unansweredQuestions = filtered.filter(q => !answered.has(q._id.toString()));
      
      // Usa recommendationEngine per suggerimenti
      let maxDiff = 1;
      if (answeredQuestions.length > 0) {
        maxDiff = Math.max(...answeredQuestions.map(q => q.difficulty || 1));
      }
      const suggestions = suggestQuestions(filtered, answered, maxDiff);
      
      return {
        answeredQuestions,
        unansweredQuestions,
        suggestions,
        maxUnlockedLevel,
        correctAnswersPerLevel
      };
    } catch (error) {
      console.error('Errore nel recupero stato domande e suggerimenti:', error);
      throw error;
    }
  }
}

module.exports = ProgressService; 