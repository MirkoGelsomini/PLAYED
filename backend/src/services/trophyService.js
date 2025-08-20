const Trophy = require('../models/Trophy');
const UserTrophy = require('../models/UserTrophy');
const UserObjective = require('../models/UserObjective');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { TROPHY_CONSTRAINTS, OBJECTIVE_DEFINITIONS, calculateLevel, LEVEL_CONSTRAINTS, SCORE_CONSTRAINTS } = require('../../../shared/constraints');

/**
 * Servizio per gestire i trofei degli utenti
 */

// Genera i trofei basati sui livelli dai constraint
const levelBasedTrophies = TROPHY_CONSTRAINTS.LEVEL_TROPHIES.map(trophy => ({
  name: trophy.name,
  description: `Raggiungi il livello ${trophy.level}`,
  category: "level",
  icon: "🏆",
  rarity: "common",
  points: trophy.points,
  requirements: { level: trophy.level }
}));

// Helper: chiave periodo giornaliero
function getDailyPeriodKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

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

        // Aggiorna i punti dell'utente e ricalcola il livello
        user.totalPoints = (user.totalPoints || 0) + trophy.points;
        const newLevel = calculateLevel(user.totalPoints);
        if (newLevel !== user.level) {
          user.level = newLevel;
          user.experienceToNextLevel = (newLevel + 1) * LEVEL_CONSTRAINTS.EXPERIENCE.DEFAULT_TO_NEXT_LEVEL;
          await user.save();
          // Dopo un cambio livello, potrebbero esserci altri trofei a cascata; continua il loop
        } else {
          await user.save();
        }

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
      stats.gamesCompleted++;
      stats.totalScore += p.score || 0;
      stats.maxScore = Math.max(stats.maxScore, p.score || 0);
      stats.gameTypes.add(p.game);

      if ((p.score || 0) >= SCORE_CONSTRAINTS.MAX_SCORE_PER_GAME) stats.perfectGames++;

      if (!stats.scoresByGameType[p.game]) {
        stats.scoresByGameType[p.game] = [];
      }
      stats.scoresByGameType[p.game].push(p.score || 0);
    }

    return stats;
  }

  // Controlla se un trofeo è stato sbloccato (per compatibilità)
  static checkTrophyRequirements(trophy, stats) {
    const req = trophy.requirements;

    if (req.level && stats.level < req.level) return false;
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
    const periodKey = getDailyPeriodKey(now);
    const activeObjectives = OBJECTIVE_DEFINITIONS.DAILY;

    const userObjectives = await UserObjective.find({ userId, type: 'daily', periodKey });

    return activeObjectives.map(obj => {
      const userObj = userObjectives.find(uo => uo.objectiveId === obj.id);
      return {
        _id: obj.id,
        ...obj,
        progress: userObj ? userObj.progress : 0,
        isCompleted: userObj ? userObj.isCompleted : false,
        rewardClaimed: userObj ? userObj.rewardClaimed : false
      };
    });
  }

  // Aggiorna progresso obiettivi
  static async updateObjectiveProgress(userId, gameType, score, completed) {
    try {
      // Ottieni tutti gli obiettivi attivi per oggi
      const now = new Date();
      const periodKey = getDailyPeriodKey(now);
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const activeObjectives = OBJECTIVE_DEFINITIONS.DAILY;

      // Ottieni o crea UserObjective per ogni obiettivo attivo
      for (const objective of activeObjectives) {
        let userObjective = await UserObjective.findOne({
          userId,
          objectiveId: objective.id,
          type: 'daily',
          periodKey
        });

        if (!userObjective) {
          userObjective = new UserObjective({
            userId,
            objectiveId: objective.id,
            type: 'daily',
            periodKey,
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
          case 'score': {
            const todayGames = await Progress.find({
              user: userId,
              date: { $gte: startOfDay, $lt: endOfDay }
            });
            const totalDailyScore = todayGames.reduce((sum, g) => sum + (g.score || 0), 0);
            newProgress = Math.min(objective.target, totalDailyScore);
            shouldUpdate = newProgress !== userObjective.progress;
            break;
          }
          case 'variety':
            {
              const todayGames = await Progress.find({
                user: userId,
                date: { $gte: startOfDay, $lt: endOfDay },
                completed: true
              });
              const uniqueGameTypes = new Set(todayGames.map(g => g.game));
              newProgress = uniqueGameTypes.size;
              shouldUpdate = newProgress !== userObjective.progress;
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
      // Trova definizione obiettivo
      const objective = [...OBJECTIVE_DEFINITIONS.DAILY].find(o => o.id === objectiveId);
      if (!objective) throw new Error('Obiettivo non trovato');

      const periodKey = getDailyPeriodKey(new Date());
      const userObjective = await UserObjective.findOne({
        userId,
        objectiveId,
        type: 'daily',
        periodKey
      });
      
      if (!userObjective) {
        throw new Error('Progresso obiettivo non trovato');
      }
      
      if (!userObjective.isCompleted) {
        throw new Error('Obiettivo non ancora completato');
      }
      
      if (userObjective.rewardClaimed) {
        throw new Error('Ricompensa già riscattata');
      }
      
      // Calcola i punti da assegnare
      const pointsEarned = objective.reward.value || 0;
      
      // Aggiorna l'utente
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Utente non trovato');
      }
      
      const oldPoints = user.totalPoints || 0;
      user.totalPoints = oldPoints + pointsEarned;
      // Ricalcola il livello dopo l'aumento punti da ricompensa
      const newLevel = calculateLevel(user.totalPoints);
      if (newLevel !== user.level) {
        user.level = newLevel;
        user.experienceToNextLevel = (newLevel + 1) * LEVEL_CONSTRAINTS.EXPERIENCE.DEFAULT_TO_NEXT_LEVEL;
      }
      await user.save();
      
      // Marca la ricompensa come riscattata
      userObjective.rewardClaimed = true;
      userObjective.claimedAt = new Date();
      await userObjective.save();
      
      // Controlla se sblocca nuovi trofei
      await this.checkAndAwardTrophies(userId);
      
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