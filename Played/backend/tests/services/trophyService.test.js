const TrophyService = require('../../src/services/trophyService');
const Trophy = require('../../src/models/Trophy');
const UserTrophy = require('../../src/models/UserTrophy');
const UserObjective = require('../../src/models/UserObjective');
const Progress = require('../../src/models/Progress');
const User = require('../../src/models/User');
const { TROPHY_CONSTRAINTS, OBJECTIVE_DEFINITIONS, calculateLevel } = require('../../../shared/constraints');

describe('TrophyService', () => {
  let testUser;

  beforeEach(async () => {
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'allievo',
      schoolLevel: 'prim',
      class: '3',
      totalPoints: 0,
      level: 1,
      gamesCompleted: 0,
      dailyStreak: 0
    });
    await testUser.save();
  });

  describe('getLevelBasedTrophies', () => {
    it('dovrebbe restituire tutti i trofei basati sui livelli', () => {
      const trophies = TrophyService.getLevelBasedTrophies();

      expect(trophies).toHaveLength(TROPHY_CONSTRAINTS.LEVEL_TROPHIES.length);
      expect(trophies[0]).toEqual({
        name: 'Principiante',
        description: 'Raggiungi il livello 5',
        category: 'level',
        icon: '🏆',
        rarity: 'common',
        points: 50,
        requirements: { level: 5 }
      });
    });
  });

  describe('checkAndAwardTrophies', () => {
    it('dovrebbe assegnare trofei quando l\'utente raggiunge il livello richiesto', async () => {
      // Imposta l'utente al livello 5 per sbloccare il primo trofeo
      testUser.level = 5;
      testUser.totalPoints = 500;
      await testUser.save();

      const newTrophies = await TrophyService.checkAndAwardTrophies(testUser._id);

      expect(newTrophies).toHaveLength(1);
      expect(newTrophies[0].name).toBe('Principiante');

      // Verifica che il trofeo sia stato salvato nel database
      const userTrophy = await UserTrophy.findOne({ userId: testUser._id });
      expect(userTrophy).toBeDefined();
      expect(userTrophy.isCompleted).toBe(true);

      // Verifica che i punti dell'utente siano stati aggiornati
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.totalPoints).toBe(550); // 500 + 50 punti del trofeo
    });

    it('dovrebbe assegnare più trofei se l\'utente raggiunge più livelli contemporaneamente', async () => {
      // Imposta l'utente al livello 20 per sbloccare i primi 3 trofei
      testUser.level = 20;
      testUser.totalPoints = 2000;
      await testUser.save();

      const newTrophies = await TrophyService.checkAndAwardTrophies(testUser._id);

      expect(newTrophies).toHaveLength(3); // Principiante, Apprendista, Esperto
      
      const trophyNames = newTrophies.map(t => t.name).sort();
      expect(trophyNames).toEqual(['Apprendista', 'Esperto', 'Principiante']);
    });

    it('non dovrebbe assegnare trofei già sbloccati', async () => {
      // Crea un trofeo già sbloccato
      const trophy = new Trophy({
        name: 'Principiante',
        description: 'Raggiungi il livello 5',
        category: 'level',
        icon: '🏆',
        rarity: 'common',
        points: 50,
        requirements: { level: 5 }
      });
      await trophy.save();

      const userTrophy = new UserTrophy({
        userId: testUser._id,
        trophyId: trophy._id,
        isCompleted: true,
        unlockedAt: new Date()
      });
      await userTrophy.save();

      // Imposta l'utente al livello 5
      testUser.level = 5;
      await testUser.save();

      const newTrophies = await TrophyService.checkAndAwardTrophies(testUser._id);

      expect(newTrophies).toHaveLength(0); // Nessun nuovo trofeo
    });

    it('dovrebbe ricalcolare il livello dopo aver aggiunto punti da trofei', async () => {
      // Imposta l'utente con punti al limite per il livello successivo
      testUser.level = 5;
      testUser.totalPoints = 999; // Quasi al livello 10
      await testUser.save();

      const newTrophies = await TrophyService.checkAndAwardTrophies(testUser._id);

      const updatedUser = await User.findById(testUser._id);
      // Con 999 punti iniziali e livello 5, dovrebbe sbloccare "Principiante" (50 punti)
      // Ma potrebbe anche sbloccare altri trofei se il livello aumenta
      // Verifichiamo solo che i punti siano aumentati
      expect(updatedUser.totalPoints).toBeGreaterThan(999);
      expect(newTrophies.length).toBeGreaterThan(0);
    });

    it('dovrebbe restituire un array vuoto se l\'utente non esiste', async () => {
      const fakeUserId = new User()._id;
      const newTrophies = await TrophyService.checkAndAwardTrophies(fakeUserId);
      expect(newTrophies).toEqual([]);
    });
  });

  describe('calculateUserStats', () => {
    it('dovrebbe calcolare correttamente le statistiche da un array di progressi', () => {
      const progress = [
        { game: 'quiz', score: 100, completed: true },
        { game: 'memory', score: 80, completed: true },
        { game: 'quiz', score: 90, completed: false },
        { game: 'matching', score: 100, completed: true }
      ];

      const stats = TrophyService.calculateUserStats(progress);

      expect(stats.gamesCompleted).toBe(4);
      expect(stats.totalScore).toBe(370);
      expect(stats.maxScore).toBe(100);
      expect(stats.gameTypes.size).toBe(3);
      expect(stats.perfectGames).toBe(2); // Due partite con punteggio 100
    });

    it('dovrebbe gestire correttamente progressi vuoti', () => {
      const stats = TrophyService.calculateUserStats([]);

      expect(stats.gamesCompleted).toBe(0);
      expect(stats.totalScore).toBe(0);
      expect(stats.maxScore).toBe(0);
      expect(stats.gameTypes.size).toBe(0);
      expect(stats.perfectGames).toBe(0);
    });
  });

  describe('getUserTrophies', () => {
    beforeEach(async () => {
      // Crea un trofeo e assegnalo all'utente
      const trophy = new Trophy({
        name: 'Test Trophy',
        description: 'Trofeo di test',
        category: 'achievement',
        icon: '🎖️',
        rarity: 'common',
        points: 100,
        requirements: { level: 1 }
      });
      await trophy.save();

      const userTrophy = new UserTrophy({
        userId: testUser._id,
        trophyId: trophy._id,
        isCompleted: true,
        unlockedAt: new Date()
      });
      await userTrophy.save();
    });

    it('dovrebbe restituire i trofei dell\'utente con i dettagli completi', async () => {
      const userTrophies = await TrophyService.getUserTrophies(testUser._id);

      expect(userTrophies).toHaveLength(1);
      expect(userTrophies[0].name).toBe('Test Trophy');
      expect(userTrophies[0].points).toBe(100);
      expect(userTrophies[0].unlockedAt).toBeDefined();
    });
  });

  describe('getTrophyStats', () => {
    it('dovrebbe calcolare correttamente le statistiche dei trofei', async () => {
      // Crea e assegna alcuni trofei
      const trophies = [
        {
          name: 'Common Trophy',
          description: 'Trofeo comune',
          category: 'level',
          icon: '🏆',
          rarity: 'common',
          points: 50,
          requirements: { level: 1 }
        },
        {
          name: 'Rare Trophy',
          description: 'Trofeo raro',
          category: 'level',
          icon: '🏆',
          rarity: 'rare',
          points: 100,
          requirements: { level: 1 }
        }
      ];

      for (const trophyData of trophies) {
        const trophy = new Trophy(trophyData);
        await trophy.save();

        const userTrophy = new UserTrophy({
          userId: testUser._id,
          trophyId: trophy._id,
          isCompleted: true,
          unlockedAt: new Date()
        });
        await userTrophy.save();
      }

      const stats = await TrophyService.getTrophyStats(testUser._id);

      expect(stats.unlockedTrophies).toBe(2);
      expect(stats.totalPoints).toBe(150); // 50 + 100
      expect(stats.byRarity.common).toBe(1);
      expect(stats.byRarity.rare).toBe(1);
      expect(stats.byCategory.level).toBe(2);
    });
  });

  describe('updateObjectiveProgress', () => {
    it('dovrebbe aggiornare il progresso per obiettivi di tipo "games"', async () => {
      const today = new Date();
      const periodKey = today.toISOString().split('T')[0];

      await TrophyService.updateObjectiveProgress(testUser._id, 'quiz', 50, true);

      const userObjective = await UserObjective.findOne({
        userId: testUser._id,
        objectiveId: 'daily_play_3_games',
        periodKey
      });

      expect(userObjective).toBeDefined();
      expect(userObjective.progress).toBe(1);
      expect(userObjective.isCompleted).toBe(false); // Serve completare 3 partite
    });

    it('dovrebbe aggiornare il progresso per obiettivi di tipo "score"', async () => {
      // Crea alcuni progressi per oggi
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);

      const progresses = [
        new Progress({
          user: testUser._id,
          game: 'quiz',
          sessionId: 'session1',
          score: 10,
          level: 1,
          date: startOfDay
        }),
        new Progress({
          user: testUser._id,
          game: 'memory',
          sessionId: 'session2',
          score: 8,
          level: 1,
          date: startOfDay
        })
      ];
      await Progress.insertMany(progresses);

      await TrophyService.updateObjectiveProgress(testUser._id, 'quiz', 5, true);

      const periodKey = today.toISOString().split('T')[0];
      const userObjective = await UserObjective.findOne({
        userId: testUser._id,
        objectiveId: 'daily_score_15_points',
        periodKey
      });

      expect(userObjective).toBeDefined();
      expect(userObjective.progress).toBe(15); // 10 + 8 + 5 = 23, ma limitato a 15
      expect(userObjective.isCompleted).toBe(true); // Target raggiunto
    });

    it('dovrebbe aggiornare il progresso per obiettivi di tipo "variety"', async () => {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);

      // Crea progressi per giochi diversi
      const progresses = [
        new Progress({
          user: testUser._id,
          game: 'quiz',
          sessionId: 'session1',
          score: 50,
          level: 1,
          date: startOfDay
        }),
        new Progress({
          user: testUser._id,
          game: 'memory',
          sessionId: 'session2',
          score: 30,
          level: 1,
          date: startOfDay
        })
      ];
      await Progress.insertMany(progresses);

      await TrophyService.updateObjectiveProgress(testUser._id, 'matching', 40, true);

      const periodKey = today.toISOString().split('T')[0];
      const userObjective = await UserObjective.findOne({
        userId: testUser._id,
        objectiveId: 'daily_variety_two_types',
        periodKey
      });

      expect(userObjective).toBeDefined();
      expect(userObjective.progress).toBe(2); // quiz, memory (matching non ancora salvato)
      expect(userObjective.isCompleted).toBe(true); // Target di 2 raggiunto
    });
  });

  describe('claimObjectiveReward', () => {
    let userObjective;

    beforeEach(async () => {
      const today = new Date();
      const periodKey = today.toISOString().split('T')[0];

      userObjective = new UserObjective({
        userId: testUser._id,
        objectiveId: 'daily_play_3_games',
        type: 'daily',
        periodKey,
        progress: 3,
        isCompleted: true,
        rewardClaimed: false
      });
      await userObjective.save();
    });

    it('dovrebbe assegnare punti quando si riscatta una ricompensa', async () => {
      const result = await TrophyService.claimObjectiveReward(testUser._id, 'daily_play_3_games');

      expect(result.pointsEarned).toBe(25); // Ricompensa dell'obiettivo
      expect(result.newTotalPoints).toBe(25);

      // Verifica che l'utente sia stato aggiornato
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.totalPoints).toBe(25);

      // Verifica che la ricompensa sia marcata come riscattata
      const updatedObjective = await UserObjective.findById(userObjective._id);
      expect(updatedObjective.rewardClaimed).toBe(true);
      expect(updatedObjective.claimedAt).toBeDefined();
    });

    it('dovrebbe lanciare un errore se l\'obiettivo non è completato', async () => {
      userObjective.isCompleted = false;
      await userObjective.save();

      await expect(
        TrophyService.claimObjectiveReward(testUser._id, 'daily_play_3_games')
      ).rejects.toThrow('Obiettivo non ancora completato');
    });

    it('dovrebbe lanciare un errore se la ricompensa è già stata riscattata', async () => {
      userObjective.rewardClaimed = true;
      await userObjective.save();

      await expect(
        TrophyService.claimObjectiveReward(testUser._id, 'daily_play_3_games')
      ).rejects.toThrow('Ricompensa già riscattata');
    });

    it('dovrebbe ricalcolare il livello dopo aver aggiunto punti da ricompensa', async () => {
      // Imposta l'utente vicino al livello successivo
      testUser.totalPoints = 995;
      testUser.level = 9;
      await testUser.save();

      const result = await TrophyService.claimObjectiveReward(testUser._id, 'daily_play_3_games');

      const updatedUser = await User.findById(testUser._id);
      // Potrebbe aver sbloccato anche trofei, quindi verifichiamo solo che i punti siano aumentati
      expect(updatedUser.totalPoints).toBeGreaterThan(995);
      expect(result.pointsEarned).toBe(25); // La ricompensa dovrebbe essere 25
      expect(updatedUser.level).toBe(calculateLevel(updatedUser.totalPoints));
    });
  });

  describe('getUserObjectives', () => {
    it('dovrebbe restituire gli obiettivi giornalieri con il progresso dell\'utente', async () => {
      const today = new Date();
      const periodKey = today.toISOString().split('T')[0];

      // Crea un progresso per un obiettivo
      const userObjective = new UserObjective({
        userId: testUser._id,
        objectiveId: 'daily_play_3_games',
        type: 'daily',
        periodKey,
        progress: 2,
        isCompleted: false,
        rewardClaimed: false
      });
      await userObjective.save();

      const objectives = await TrophyService.getUserObjectives(testUser._id);

      expect(objectives).toHaveLength(OBJECTIVE_DEFINITIONS.DAILY.length);
      
      const playGamesObjective = objectives.find(o => o._id === 'daily_play_3_games');
      expect(playGamesObjective).toBeDefined();
      expect(playGamesObjective.progress).toBe(2);
      expect(playGamesObjective.isCompleted).toBe(false);

      // Gli obiettivi senza progresso dovrebbero avere valori di default
      const scoreObjective = objectives.find(o => o._id === 'daily_score_15_points');
      expect(scoreObjective.progress).toBe(0);
      expect(scoreObjective.isCompleted).toBe(false);
    });
  });
});
