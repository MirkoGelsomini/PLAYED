const Progress = require('../models/Progress');
const User = require('../models/user');
const TrophyService = require('./trophyService');
const { suggestQuestions } = require('../utils/recommendationEngine');

class ProgressService {
  // Salva il progresso di una partita
  static async saveProgress(userId, gameData) {
    try {
      // Genera un sessionId unico
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

      // Calcola livello secondo la nuova regola: 1% dei punti totali, arrotondato verso il basso, minimo 1
      const { calculateLevel } = require('../../../shared/constraints');
      const newLevel = calculateLevel(user.totalPoints);
      if (newLevel !== user.level) {
        user.level = newLevel;
        const { LEVEL_CONSTRAINTS } = require('../../../shared/constraints');
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
      
      // Se non esiste una sessione, creane una nuova
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
      
      // Gestisci la domanda in base alla correttezza della risposta
      if (isCorrect) {
        // Aggiungi la domanda alle risposte corrette se non è già presente
        if (!progress.answeredQuestions.includes(questionId)) {
          progress.answeredQuestions.push(questionId);
          
          // Aggiorna i punti dell'utente solo se la risposta è corretta e nuova
          const user = await User.findById(userId);
          if (user) {
            // Calcola punti basati sulla difficoltà della domanda
            const pointsToAdd = questionDifficulty; // 5 punti per livello di difficoltà
            user.totalPoints = (user.totalPoints || 0) + pointsToAdd;
            
            // Aggiorna ultima data di gioco
            user.lastPlayedDate = new Date();
            
            // Calcola nuovo livello
            const { calculateLevel } = require('../../../shared/constraints');
            const newLevel = calculateLevel(user.totalPoints);
            if (newLevel !== user.level) {
              user.level = newLevel;
              const { LEVEL_CONSTRAINTS } = require('../../../shared/constraints');
              user.experienceToNextLevel = (newLevel + 1) * LEVEL_CONSTRAINTS.EXPERIENCE.DEFAULT_TO_NEXT_LEVEL;
            }
            
            await user.save();
            
            // Aggiorna progresso obiettivi
            await TrophyService.updateObjectiveProgress(userId, progress.game, pointsToAdd, true);
          }
        }
        // Rimuovi dalla lista delle sbagliate se era presente
        progress.wrongAnsweredQuestions = progress.wrongAnsweredQuestions.filter(id => id !== questionId);
      } else {
        // Aggiungi la domanda alle risposte sbagliate se non è già presente
        if (!progress.wrongAnsweredQuestions.includes(questionId)) {
          progress.wrongAnsweredQuestions.push(questionId);
        }
        // Rimuovi dalla lista delle corrette se era presente (per permettere di riprovare)
        progress.answeredQuestions = progress.answeredQuestions.filter(id => id !== questionId);
      }
      
      // Aggiorna la progressione a livelli solo se la risposta è corretta
      if (isCorrect && typeof questionDifficulty === 'number') {
        const level = questionDifficulty;
        if (!progress.correctAnswersPerLevel) progress.correctAnswersPerLevel = {};
        
        // Aggiorna il conteggio delle corrette per il livello
        const prev = progress.correctAnswersPerLevel[level] || 0;
        progress.correctAnswersPerLevel[level] = prev + 1;
        
        // Sblocca il livello successivo se raggiunta la soglia
        const { GAME_CONSTRAINTS } = require('../../../shared/constraints');
        const threshold = GAME_CONSTRAINTS.LEVEL_UNLOCK.MIN_CORRECT_ANSWERS;
        if ((prev + 1) >= threshold && progress.maxUnlockedLevel <= level) {
          progress.maxUnlockedLevel = level + 1;
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
    const fs = require('fs');
    const path = require('path');
    try {
      // Recupera l'utente per ottenere l'età
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Utente non trovato');
      }

      // Recupera tutte le sessioni dell'utente per quel gioco
      const progresses = await Progress.find({ user: userId, game: gameType });
      const answered = new Set();
      let maxUnlockedLevel = 1;
      let correctAnswersPerLevel = {};
      
      progresses.forEach(p => {
        // Considera solo le domande risposte correttamente
        (p.answeredQuestions || []).forEach(qid => answered.add(qid.toString()));
        
        // Le domande sbagliate non vengono considerate come risposte
        // così possono essere suggerite di nuovo
        
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
      
      // Carica tutte le domande dal file
      const questionsPath = path.join(__dirname, '../data/questions.json');
      const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
      
      // Filtra per tipo di gioco, livello sbloccato E età dell'utente
      const filtered = questions.filter(q => {
        // Controlla tipo di gioco e livello
        const gameAndLevelMatch = q.type === gameType && q.difficulty <= maxUnlockedLevel;
        
        // Controlla età se la domanda ha un ageRange
        let ageMatch = true;
        if (q.ageRange && Array.isArray(q.ageRange) && q.ageRange.length === 2) {
          const [minAge, maxAge] = q.ageRange;
          ageMatch = user.age >= minAge && user.age <= maxAge;
        }
        
        return gameAndLevelMatch && ageMatch;
      });
      
      const answeredQuestions = filtered.filter(q => answered.has(q.id.toString()));
      const unansweredQuestions = filtered.filter(q => !answered.has(q.id.toString()));
      
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