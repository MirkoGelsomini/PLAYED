const Trophy = require('../models/Trophy');
const UserTrophy = require('../models/UserTrophy');
const Objective = require('../models/Objective');
const UserObjective = require('../models/UserObjective');
const Progress = require('../models/Progress');
const User = require('../models/user');
const { levelBasedTrophies, dailyObjectives } = require('../config/trophyConfig');

class TrophyService {
  // Trofei basati sui livelli dell'utente
  static getLevelBasedTrophies() {
    return levelBasedTrophies;
  }

  // Controlla e assegna trofei per un utente
  static async checkAndAwardTrophies(userId) {
    const user = await User.findById(userId);
    
    if (!user) return [];

    // Ottieni i trofei basati sui livelli
    const levelTrophies = this.getLevelBasedTrophies();
    
    // Ottieni i trofei già sbloccati dall'utente
    const userTrophies = await UserTrophy.find({ userId }).populate('trophyId');
    const unlockedTrophyNames = userTrophies.map(ut => ut.trophyId.name);

    const newlyUnlocked = [];

    for (const trophyData of levelTrophies) {
      // Verifica se il trofeo è già stato sbloccato
      if (unlockedTrophyNames.includes(trophyData.name)) continue;

      // Verifica se l'utente ha raggiunto il livello richiesto
      if (user.level >= trophyData.requirements.level) {
        // Crea o trova il trofeo nel database
        let trophy = await Trophy.findOne({ name: trophyData.name });
        if (!trophy) {
          trophy = new Trophy(trophyData);
          await trophy.save();
        }

        // Assegna il trofeo all'utente
        const userTrophy = new UserTrophy({
          userId,
          trophyId: trophy._id,
          isCompleted: true,
          unlockedAt: new Date()
        });
        await userTrophy.save();

        // Aggiorna i punti dell'utente
        user.totalPoints = (user.totalPoints || 0) + trophy.points;
        await user.save();

        newlyUnlocked.push(trophy);
      }
    }

    return newlyUnlocked;
  }

  // Calcola le statistiche dell'utente
  static calculateUserStats(progress) {
    const stats = {
      gamesCompleted: 0,
      totalScore: 0,
      maxScore: 0,
      gameTypes: new Set(),
      perfectGames: 0,
      dailyStreak: 0,
      scoresByGameType: {}
    };

    for (const p of progress) {
      if (p.completed) {
        stats.gamesCompleted++;
        stats.totalScore += p.score || 0;
        stats.maxScore = Math.max(stats.maxScore, p.score || 0);
        stats.gameTypes.add(p.game);
        
        if (p.score >= 100) stats.perfectGames++;
        
        if (!stats.scoresByGameType[p.game]) {
          stats.scoresByGameType[p.game] = [];
        }
        stats.scoresByGameType[p.game].push(p.score || 0);
      }
    }

    return stats;
  }

  // Controlla se un trofeo è stato sbloccato (per compatibilità)
  static checkTrophyRequirements(trophy, stats) {
    const req = trophy.requirements;

    // Per i trofei basati sui livelli
    if (req.level && stats.level < req.level) return false;
    
    // Per i trofei legacy (se esistono ancora)
    if (req.gamesCompleted && stats.gamesCompleted < req.gamesCompleted) return false;
    if (req.maxScore && stats.maxScore < req.maxScore) return false;
    if (req.totalScore && stats.totalScore < req.totalScore) return false;
    if (req.gameTypes === "all" && stats.gameTypes.size < 3) return false;
    if (req.perfectStreak && stats.perfectGames < req.perfectStreak) return false;
    if (req.scorePerGameType) {
      for (const gameType in stats.scoresByGameType) {
        const maxScore = Math.max(...stats.scoresByGameType[gameType]);
        if (maxScore < req.scorePerGameType) return false;
      }
    }

    return true;
  }

  // Ottieni tutti i trofei di un utente
  static async getUserTrophies(userId) {
    const userTrophies = await UserTrophy.find({ userId })
      .populate('trophyId')
      .sort({ unlockedAt: -1 });

    return userTrophies.map(ut => ({
      ...ut.trophyId.toObject(),
      unlockedAt: ut.unlockedAt,
      progress: ut.progress
    }));
  }

  // Ottieni statistiche trofei
  static async getTrophyStats(userId) {
    const userTrophies = await this.getUserTrophies(userId);
    const levelTrophies = this.getLevelBasedTrophies();

    const stats = {
      totalTrophies: levelTrophies.length,
      unlockedTrophies: userTrophies.length,
      completionRate: Math.round((userTrophies.length / levelTrophies.length) * 100),
      totalPoints: userTrophies.reduce((sum, t) => sum + t.points, 0),
      byRarity: {
        common: userTrophies.filter(t => t.rarity === 'common').length,
        rare: userTrophies.filter(t => t.rarity === 'rare').length,
        epic: userTrophies.filter(t => t.rarity === 'epic').length,
        legendary: userTrophies.filter(t => t.rarity === 'legendary').length,
        mythic: userTrophies.filter(t => t.rarity === 'mythic').length
      },
      byCategory: {
        level: userTrophies.filter(t => t.category === 'level').length
      }
    };

    return stats;
  }



  // Ottieni obiettivi attivi per un utente
  static async getUserObjectives(userId) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Crea obiettivi giornalieri se non esistono
    await this.createDailyObjectives(today, tomorrow);

    const activeObjectives = await Objective.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gt: now }
    });

    const userObjectives = await UserObjective.find({ userId })
      .populate('objectiveId');

    const objectivesWithProgress = activeObjectives.map(obj => {
      const userObj = userObjectives.find(uo => 
        uo.objectiveId._id.toString() === obj._id.toString()
      );

      return {
        ...obj.toObject(),
        progress: userObj ? userObj.progress : 0,
        isCompleted: userObj ? userObj.isCompleted : false,
        rewardClaimed: userObj ? userObj.rewardClaimed : false
      };
    });

    return objectivesWithProgress;
  }

  // Crea obiettivi giornalieri
  static async createDailyObjectives(startDate, endDate) {
    const existingObjectives = await Objective.find({
      startDate: startDate,
      type: "daily"
    });

    if (existingObjectives.length > 0) {
      return; // Gli obiettivi per oggi esistono già
    }

    // Usa la configurazione centralizzata
    for (const baseObj of dailyObjectives) {
      const objective = {
        ...baseObj,
        startDate: startDate,
        endDate: endDate,
        isActive: true
      };
      await Objective.findOneAndUpdate(
        { title: objective.title, type: "daily", startDate: startDate },
        objective,
        { upsert: true, new: true }
      );
    }
  }

  // Aggiorna progresso obiettivi
  static async updateObjectiveProgress(userId, gameType, score, completed) {
    try {
      // Ottieni tutti gli obiettivi attivi per oggi
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const activeObjectives = await Objective.find({
        isActive: true,
        startDate: { $lte: today },
        endDate: { $gt: today }
      });

      // Ottieni o crea UserObjective per ogni obiettivo attivo
      for (const objective of activeObjectives) {
        let userObjective = await UserObjective.findOne({
          userId,
          objectiveId: objective._id
        });

        if (!userObjective) {
          userObjective = new UserObjective({
            userId,
            objectiveId: objective._id,
            progress: 0,
            isCompleted: false,
            rewardClaimed: false
          });
        }

        let shouldUpdate = false;
        let newProgress = userObjective.progress;

        switch (objective.category) {
          case 'games':
            if (completed) {
              newProgress++;
              shouldUpdate = true;
            }
            break;
          case 'score':
            if (score >= objective.target && userObjective.progress < objective.target) {
              newProgress = objective.target;
              shouldUpdate = true;
            }
            break;
          case 'variety':
            // Per la varietà, dobbiamo tracciare i tipi di giochi giocati oggi
            if (completed) {
              // Ottieni tutti i giochi completati oggi dall'utente
              const todayGames = await Progress.find({
                user: userId,
                completed: true,
                date: { $gte: today, $lt: tomorrow }
              });

              const uniqueGameTypes = new Set(todayGames.map(g => g.game));
              newProgress = uniqueGameTypes.size;
              shouldUpdate = true;
            }
            break;
        }

        if (shouldUpdate) {
          userObjective.progress = newProgress;
          userObjective.isCompleted = newProgress >= objective.target;
          if (userObjective.isCompleted && !userObjective.completedAt) {
            userObjective.completedAt = new Date();
          }
          await userObjective.save();
        }
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento progresso obiettivi:', error);
    }
  }

  // Riscatta ricompensa obiettivo
  static async claimObjectiveReward(userId, objectiveId) {
    try {
      console.log('Service - Claim reward iniziato per:', { userId, objectiveId });
      
      // Trova l'obiettivo e il progresso dell'utente
      const objective = await Objective.findById(objectiveId);
      console.log('Service - Obiettivo trovato:', objective ? 'sì' : 'no');
      
      const userObjective = await UserObjective.findOne({
        userId,
        objectiveId
      });
      console.log('Service - UserObjective trovato:', userObjective ? 'sì' : 'no');

      if (!objective) {
        throw new Error('Obiettivo non trovato');
      }

      if (!userObjective) {
        throw new Error('Progresso obiettivo non trovato');
      }

      console.log('Service - Stato obiettivo:', {
        isCompleted: userObjective.isCompleted,
        rewardClaimed: userObjective.rewardClaimed,
        progress: userObjective.progress
      });

      if (!userObjective.isCompleted) {
        throw new Error('Obiettivo non ancora completato');
      }

      if (userObjective.rewardClaimed) {
        throw new Error('Ricompensa già riscattata');
      }

      // Calcola i punti da assegnare
      const pointsEarned = objective.reward.value || 0;
      console.log('Service - Punti da assegnare:', pointsEarned);

      // Aggiorna l'utente
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Utente non trovato');
      }

      const oldPoints = user.totalPoints || 0;
      user.totalPoints = oldPoints + pointsEarned;
      await user.save();
      console.log('Service - Punti utente aggiornati:', { oldPoints, newPoints: user.totalPoints });

      // Marca la ricompensa come riscattata
      userObjective.rewardClaimed = true;
      userObjective.claimedAt = new Date();
      await userObjective.save();
      console.log('Service - Ricompensa marcata come riscattata');

      // Controlla se ci sono nuovi trofei da sbloccare
      await this.checkAndAwardTrophies(userId);
      console.log('Service - Controllo trofei completato');

      return {
        pointsEarned,
        newTotalPoints: user.totalPoints
      };
    } catch (error) {
      console.error('Errore nel riscatto ricompensa:', error);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  }
}

module.exports = TrophyService; 