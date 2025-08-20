const ProgressService = require('../../src/services/progressService');
const TrophyService = require('../../src/services/trophyService');
const Progress = require('../../src/models/Progress');
const User = require('../../src/models/User');
const { calculateLevel } = require('../../../shared/constraints');

// Mock del TrophyService per evitare dipendenze circolari nei test
jest.mock('../../src/services/trophyService', () => ({
  checkAndAwardTrophies: jest.fn().mockResolvedValue([]),
  updateObjectiveProgress: jest.fn().mockResolvedValue()
}));

describe('ProgressService', () => {
  let testUser;

  beforeEach(async () => {
    // Crea un utente di test
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

  describe('saveProgress', () => {
    it('dovrebbe salvare correttamente il progresso e aggiornare i punti utente', async () => {
      const gameData = {
        game: 'quiz',
        score: 50,
        level: 1,
        completed: true,
        timeSpent: 120,
        mistakes: 2
      };

      const result = await ProgressService.saveProgress(testUser._id, gameData);

      expect(result.progress).toBeDefined();
      expect(result.progress.score).toBe(50);
      expect(result.progress.game).toBe('quiz');
      expect(result.progress.completed).toBe(true);

      // Verifica che l'utente sia stato aggiornato
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.totalPoints).toBe(50);
      expect(updatedUser.gamesCompleted).toBe(1);
    });

    it('dovrebbe generare un sessionId unico', async () => {
      const gameData = { game: 'memory', score: 30 };

      const result1 = await ProgressService.saveProgress(testUser._id, gameData);
      const result2 = await ProgressService.saveProgress(testUser._id, gameData);

      expect(result1.progress.sessionId).toBeDefined();
      expect(result2.progress.sessionId).toBeDefined();
      expect(result1.progress.sessionId).not.toBe(result2.progress.sessionId);
    });

    it('dovrebbe chiamare TrophyService per controllare nuovi trofei', async () => {
      const gameData = { game: 'quiz', score: 100, completed: true };

      await ProgressService.saveProgress(testUser._id, gameData);

      expect(TrophyService.checkAndAwardTrophies).toHaveBeenCalledWith(testUser._id);
      expect(TrophyService.updateObjectiveProgress).toHaveBeenCalledWith(
        testUser._id, 
        'quiz', 
        100, 
        true
      );
    });
  });

  describe('updateUserStats', () => {
    it('dovrebbe aggiornare correttamente i punti totali', async () => {
      const gameData = { score: 75, completed: true };

      await ProgressService.updateUserStats(testUser._id, gameData);

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.totalPoints).toBe(75);
      expect(updatedUser.gamesCompleted).toBe(1);
    });

    it('dovrebbe calcolare correttamente il daily streak', async () => {
      // Prima partita
      await ProgressService.updateUserStats(testUser._id, { score: 10 });
      
      let updatedUser = await User.findById(testUser._id);
      expect(updatedUser.dailyStreak).toBe(1);

      // Simula una partita il giorno dopo
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      updatedUser.lastPlayedDate = yesterday;
      await updatedUser.save();

      await ProgressService.updateUserStats(testUser._id, { score: 20 });
      
      updatedUser = await User.findById(testUser._id);
      expect(updatedUser.dailyStreak).toBe(2);
    });

    it('dovrebbe resettare il daily streak se si salta un giorno', async () => {
      // Imposta la data di ultimo gioco a 3 giorni fa
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      testUser.lastPlayedDate = threeDaysAgo;
      testUser.dailyStreak = 5;
      await testUser.save();

      await ProgressService.updateUserStats(testUser._id, { score: 10 });

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.dailyStreak).toBe(1);
    });

    it('dovrebbe aggiornare il livello quando i punti cambiano', async () => {
      // Imposta punti sufficienti per il livello 10 (1000 punti = livello 10)
      const gameData = { score: 1000, completed: true };

      await ProgressService.updateUserStats(testUser._id, gameData);

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.totalPoints).toBe(1000);
      expect(updatedUser.level).toBe(calculateLevel(1000)); // Dovrebbe essere 10
    });
  });

  describe('updateAnsweredQuestions', () => {
    it('dovrebbe aggiungere punti solo per risposte corrette', async () => {
      const sessionId = 'test-session-123';
      const questionId = 'question123';
      const questionDifficulty = 3;

      // Risposta corretta
      await ProgressService.updateAnsweredQuestions(
        testUser._id, 
        sessionId, 
        questionId, 
        true, 
        questionDifficulty
      );

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.totalPoints).toBe(3); // Punti = difficoltà della domanda

      // Risposta sbagliata - non dovrebbe aggiungere punti
      await ProgressService.updateAnsweredQuestions(
        testUser._id, 
        sessionId, 
        'question456', 
        false, 
        questionDifficulty
      );

      const finalUser = await User.findById(testUser._id);
      expect(finalUser.totalPoints).toBe(3); // Punti rimangono gli stessi
    });

    it('dovrebbe gestire correttamente le risposte e i livelli', async () => {
      const sessionId = 'test-session-unlock';
      const questionDifficulty = 1;

      // Risponde correttamente a 5 domande di livello 1 diverse
      for (let i = 0; i < 5; i++) {
        await ProgressService.updateAnsweredQuestions(
          testUser._id, 
          sessionId, 
          `unique-question-${i}-${Date.now()}`, // ID veramente unici
          true, 
          questionDifficulty
        );
      }

      const progress = await Progress.findOne({ sessionId });
      
      // Verifica che abbia registrato le domande risposte correttamente
      expect(progress.answeredQuestions).toHaveLength(5);
      
      // Verifica che abbia tracciato almeno alcune risposte corrette per il livello
      expect(progress.correctAnswersPerLevel['1']).toBeGreaterThan(0);
      
      // Verifica che l'utente abbia guadagnato punti (5 domande * 1 punto = 5 punti)
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.totalPoints).toBe(5);
    });

    it('non dovrebbe aggiungere punti per la stessa domanda risposta più volte', async () => {
      const sessionId = 'test-session-duplicate';
      const questionId = 'duplicate-question';
      const questionDifficulty = 2;

      // Prima risposta corretta
      await ProgressService.updateAnsweredQuestions(
        testUser._id, 
        sessionId, 
        questionId, 
        true, 
        questionDifficulty
      );

      let updatedUser = await User.findById(testUser._id);
      expect(updatedUser.totalPoints).toBe(2);

      // Seconda risposta corretta alla stessa domanda
      await ProgressService.updateAnsweredQuestions(
        testUser._id, 
        sessionId, 
        questionId, 
        true, 
        questionDifficulty
      );

      updatedUser = await User.findById(testUser._id);
      expect(updatedUser.totalPoints).toBe(2); // Punti non dovrebbero cambiare
    });
  });

  describe('getAggregatedStats', () => {
    beforeEach(async () => {
      // Crea alcuni progressi di test
      const progresses = [
        new Progress({
          user: testUser._id,
          game: 'quiz',
          sessionId: 'session1',
          score: 80,
          level: 1,
          completed: true,
          date: new Date()
        }),
        new Progress({
          user: testUser._id,
          game: 'memory',
          sessionId: 'session2',
          score: 60,
          level: 2,
          completed: true,
          date: new Date()
        }),
        new Progress({
          user: testUser._id,
          game: 'quiz',
          sessionId: 'session3',
          score: 90,
          level: 1,
          completed: false,
          date: new Date()
        })
      ];

      await Progress.insertMany(progresses);
    });

    it('dovrebbe calcolare correttamente le statistiche aggregate', async () => {
      const stats = await ProgressService.getAggregatedStats(testUser._id);

      expect(stats.totalGames).toBe(3);
      expect(stats.completedGames).toBe(2);
      expect(stats.totalScore).toBe(230); // 80 + 60 + 90
      expect(stats.averageScore).toBe(115); // 230 / 2 (totalScore / completedGames)
      expect(stats.bestScore).toBe(90);
    });

    it('dovrebbe raggruppare le statistiche per tipo di gioco', async () => {
      const stats = await ProgressService.getAggregatedStats(testUser._id);

      expect(stats.gameTypes).toBeDefined();
      expect(stats.gameTypes.quiz).toEqual({
        count: 2,
        totalScore: 170, // 80 + 90
        bestScore: 90
      });
      expect(stats.gameTypes.memory).toEqual({
        count: 1,
        totalScore: 60,
        bestScore: 60
      });
    });
  });

  describe('getLeaderboard', () => {
    beforeEach(async () => {
      // Crea altri utenti per la leaderboard
      const users = [
        new User({
          name: 'User 2',
          email: 'user2@example.com',
          password: 'password123',
          role: 'allievo',
          schoolLevel: 'prim',
          class: '3',
          totalPoints: 500,
          gamesCompleted: 10
        }),
        new User({
          name: 'User 3',
          email: 'user3@example.com',
          password: 'password123',
          role: 'allievo',
          schoolLevel: 'sec1',
          class: '1',
          totalPoints: 1000,
          gamesCompleted: 5
        })
      ];

      await User.insertMany(users);
    });

    it('dovrebbe restituire la leaderboard ordinata per punti', async () => {
      const leaderboard = await ProgressService.getLeaderboard('points', 3);

      expect(leaderboard).toHaveLength(3);
      expect(leaderboard[0].totalPoints).toBe(1000);
      expect(leaderboard[1].totalPoints).toBe(500);
      expect(leaderboard[2].totalPoints).toBe(0);
    });

    it('dovrebbe restituire la leaderboard ordinata per partite completate', async () => {
      const leaderboard = await ProgressService.getLeaderboard('games', 3);

      expect(leaderboard).toHaveLength(3);
      expect(leaderboard[0].gamesCompleted).toBe(10);
      expect(leaderboard[1].gamesCompleted).toBe(5);
      expect(leaderboard[2].gamesCompleted).toBe(0);
    });
  });
});
