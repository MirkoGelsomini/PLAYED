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
      const newLevel = Math.max(1, Math.floor(user.totalPoints * 0.01));
      if (newLevel !== user.level) {
        user.level = newLevel;
        user.experienceToNextLevel = (newLevel + 1) * 100; // opzionale, puoi adattare se serve
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

  // Aggiorna le domande risposte per una sessione
  static async updateAnsweredQuestions(userId, sessionId, questionId) {
    try {
      const progress = await Progress.findOne({ user: userId, sessionId });
      if (!progress) return null;
      if (!progress.answeredQuestions) progress.answeredQuestions = [];
      if (!progress.answeredQuestions.includes(questionId)) {
        progress.answeredQuestions.push(questionId);
        await progress.save();
      }
      return progress;
    } catch (error) {
      console.error('Errore nell\'aggiornamento delle domande risposte:', error);
      throw error;
    }
  }

  // Restituisce domande fatte/non fatte e suggerimenti
  static async getQuestionProgressAndSuggestions(userId, gameType) {
    const fs = require('fs');
    const path = require('path');
    try {
      // Recupera tutte le sessioni dell'utente per quel gioco
      const progresses = await Progress.find({ user: userId, game: gameType });
      const answered = new Set();
      progresses.forEach(p => {
        (p.answeredQuestions || []).forEach(qid => answered.add(qid.toString()));
      });
      // Carica tutte le domande dal file
      const questionsPath = path.join(__dirname, '../data/questions.json');
      const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
      // Filtra per tipo di gioco
      const filtered = questions.filter(q => q.type === gameType);
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
        suggestions
      };
    } catch (error) {
      console.error('Errore nel recupero stato domande e suggerimenti:', error);
      throw error;
    }
  }
}

module.exports = ProgressService; 