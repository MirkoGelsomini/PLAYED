const TrophyService = require('../services/trophyService');
const Progress = require('../models/Progress');
const User = require('../models/user');

class TrophyController {
  // Ottieni tutti i trofei dell'utente
  static async getUserTrophies(req, res) {
    try {
      const userId = req.user.id;
      const trophies = await TrophyService.getUserTrophies(userId);
      const stats = await TrophyService.getTrophyStats(userId);
      
      res.json({
        success: true,
        trophies,
        stats
      });
    } catch (error) {
      console.error('Errore nel recupero trofei:', error);
      res.status(500).json({
        success: false,
        message: 'Errore nel recupero dei trofei',
        error: error.message
      });
    }
  }

  // Ottieni obiettivi attivi
  static async getUserObjectives(req, res) {
    try {
      const userId = req.user.id;
      const objectives = await TrophyService.getUserObjectives(userId);
      
      res.json({
        success: true,
        objectives
      });
    } catch (error) {
      console.error('Errore nel recupero obiettivi:', error);
      res.status(500).json({
        success: false,
        message: 'Errore nel recupero degli obiettivi',
        error: error.message
      });
    }
  }

  // Ottieni statistiche complete dell'utente
  static async getUserStats(req, res) {
    try {
      const userId = req.user.id;
      const progress = await Progress.find({ user: userId }).sort({ date: -1 });
      const user = await User.findById(userId);
      const stats = TrophyService.calculateUserStats(progress);
      const trophyStats = await TrophyService.getTrophyStats(userId);
      const objectives = await TrophyService.getUserObjectives(userId);
      
      // Calcola streak giornaliero
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const todayGames = progress.filter(p => {
        const gameDate = new Date(p.date);
        gameDate.setHours(0, 0, 0, 0);
        return gameDate.getTime() === today.getTime();
      });
      
      const yesterdayGames = progress.filter(p => {
        const gameDate = new Date(p.date);
        gameDate.setHours(0, 0, 0, 0);
        return gameDate.getTime() === yesterday.getTime();
      });

      const dailyStreak = yesterdayGames.length > 0 ? (user.dailyStreak || 0) + 1 : 1;
      
      // Aggiorna streak se necessario
      if (todayGames.length > 0 && user.lastPlayedDate) {
        const lastPlayed = new Date(user.lastPlayedDate);
        lastPlayed.setHours(0, 0, 0, 0);
        
        if (lastPlayed.getTime() === yesterday.getTime()) {
          user.dailyStreak = dailyStreak;
        } else if (lastPlayed.getTime() < yesterday.getTime()) {
          user.dailyStreak = 1;
        }
      }
      
      user.lastPlayedDate = new Date();
      await user.save();
      // Statistiche avanzate
      const advancedStats = {
        ...stats,
        dailyStreak: user.dailyStreak || 0,
        totalPoints: user.totalPoints || 0,
        averageScore: stats.gamesCompleted > 0 ? Math.round(stats.totalScore / stats.gamesCompleted) : 0,
        bestGameType: TrophyController.getBestGameType(stats.scoresByGameType),
        recentPerformance: TrophyController.calculateRecentPerformance(progress.slice(0, 10)),
        weeklyProgress: TrophyController.calculateWeeklyProgress(progress),
        monthlyProgress: TrophyController.calculateMonthlyProgress(progress),
        level: user.level || 1 
      };

      res.json({
        success: true,
        stats: advancedStats,
        trophyStats,
        objectives,
        recentGames: progress.slice(0, 10)
      });
    } catch (error) {
      console.error('Errore nel recupero statistiche:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Errore nel recupero delle statistiche',
        error: error.message
      });
    }
  }

  // Controlla e assegna nuovi trofei
  static async checkTrophies(req, res) {
    try {
      const userId = req.user.id;
      const newTrophies = await TrophyService.checkAndAwardTrophies(userId);
      
      res.json({
        success: true,
        newTrophies,
        count: newTrophies.length
      });
    } catch (error) {
      console.error('Errore nel controllo trofei:', error);
      res.status(500).json({
        success: false,
        message: 'Errore nel controllo dei trofei',
        error: error.message
      });
    }
  }

  // Aggiorna progresso obiettivi
  static async updateObjectiveProgress(req, res) {
    try {
      const userId = req.user.id;
      const { gameType, score, completed } = req.body;
      await TrophyService.updateObjectiveProgress(userId, gameType, score, completed);
      
      res.json({
        success: true,
        message: 'Progresso aggiornato'
      });
    } catch (error) {
      console.error('Errore nell\'aggiornamento progresso:', error);
      res.status(500).json({
        success: false,
        message: 'Errore nell\'aggiornamento del progresso',
        error: error.message
      });
    }
  }

  // Riscatta ricompensa obiettivo
  static async claimObjectiveReward(req, res) {
    try {
      const userId = req.user.id;
      const { objectiveId } = req.body;
      const result = await TrophyService.claimObjectiveReward(userId, objectiveId);
      
      res.json({
        success: true,
        message: 'Ricompensa riscattata con successo',
        pointsEarned: result.pointsEarned,
        newTotalPoints: result.newTotalPoints
      });
    } catch (error) {
      console.error('Errore nel riscatto ricompensa:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Errore nel riscatto della ricompensa',
        error: error.message
      });
    }
  }

  // Ottieni leaderboard
  static async getLeaderboard(req, res) {
    try {
      const { type = 'points', limit = 10 } = req.query;
      
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
        .limit(parseInt(limit))
        .select('name username totalPoints gamesCompleted dailyStreak trophyCount avatar');

      res.json({
        success: true,
        leaderboard: users,
        type
      });
    } catch (error) {
      console.error('Errore nel recupero leaderboard:', error);
      res.status(500).json({
        success: false,
        message: 'Errore nel recupero della classifica',
        error: error.message
      });
    }
  }

  // Metodi di utilità per statistiche avanzate
  static getBestGameType(scoresByGameType) {
    let bestType = null;
    let bestAverage = 0;

    for (const [gameType, scores] of Object.entries(scoresByGameType)) {
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      if (average > bestAverage) {
        bestAverage = average;
        bestType = gameType;
      }
    }

    return { gameType: bestType, averageScore: Math.round(bestAverage) };
  }

  static calculateRecentPerformance(progress) {
    if (progress.length === 0) return { trend: 'neutral', improvement: 0 };

    const recentScores = progress.slice(0, 5).map(p => p.score || 0);
    const olderScores = progress.slice(5, 10).map(p => p.score || 0);

    const recentAverage = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const olderAverage = olderScores.length > 0 
      ? olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length 
      : recentAverage;

    const improvement = recentAverage - olderAverage;
    let trend = 'neutral';
    
    if (improvement > 10) trend = 'improving';
    else if (improvement < -10) trend = 'declining';

    return { trend, improvement: Math.round(improvement) };
  }

  static calculateWeeklyProgress(progress) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyGames = progress.filter(p => new Date(p.date) >= weekAgo);
    const weeklyScore = weeklyGames.reduce((sum, p) => sum + (p.score || 0), 0);
    
    return {
      games: weeklyGames.length,
      totalScore: weeklyScore,
      averageScore: weeklyGames.length > 0 ? Math.round(weeklyScore / weeklyGames.length) : 0
    };
  }

  static calculateMonthlyProgress(progress) {
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const monthlyGames = progress.filter(p => new Date(p.date) >= monthAgo);
    const monthlyScore = monthlyGames.reduce((sum, p) => sum + (p.score || 0), 0);
    
    return {
      games: monthlyGames.length,
      totalScore: monthlyScore,
      averageScore: monthlyGames.length > 0 ? Math.round(monthlyScore / monthlyGames.length) : 0
    };
  }
}

module.exports = TrophyController; 