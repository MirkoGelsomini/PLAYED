const Progress = require('../../src/models/Progress');
const User = require('../../src/models/User');

describe('Progress Model', () => {
  let testUser;

  beforeEach(async () => {
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'allievo',
      schoolLevel: 'prim',
      class: '3'
    });
    await testUser.save();
  });

  describe('Validation', () => {
    it('dovrebbe creare un progresso valido', async () => {
      const progressData = {
        user: testUser._id,
        game: 'quiz',
        sessionId: 'session_123',
        score: 85,
        level: 2,
        completed: true,
        details: {
          timeSpent: 120,
          mistakes: 3
        }
      };

      const progress = new Progress(progressData);
      const savedProgress = await progress.save();

      expect(savedProgress._id).toBeDefined();
      expect(savedProgress.user.toString()).toBe(testUser._id.toString());
      expect(savedProgress.game).toBe('quiz');
      expect(savedProgress.score).toBe(85);
      expect(savedProgress.completed).toBe(true);
    });

    it('dovrebbe richiedere campi obbligatori', async () => {
      const progress = new Progress({});
      await expect(progress.save()).rejects.toThrow();
    });

    it('dovrebbe richiedere user ID', async () => {
      const progressData = {
        game: 'quiz',
        sessionId: 'session_123',
        score: 85,
        level: 2
      };

      const progress = new Progress(progressData);
      await expect(progress.save()).rejects.toThrow();
    });

    it('dovrebbe richiedere game', async () => {
      const progressData = {
        user: testUser._id,
        sessionId: 'session_123',
        score: 85,
        level: 2
      };

      const progress = new Progress(progressData);
      await expect(progress.save()).rejects.toThrow();
    });

    it('dovrebbe richiedere sessionId', async () => {
      const progressData = {
        user: testUser._id,
        game: 'quiz',
        score: 85,
        level: 2
      };

      const progress = new Progress(progressData);
      await expect(progress.save()).rejects.toThrow();
    });
  });

  describe('Default Values', () => {
    it('dovrebbe impostare valori di default corretti', async () => {
      const progressData = {
        user: testUser._id,
        game: 'memory',
        sessionId: 'session_456',
        score: 50,
        level: 1
      };

      const progress = new Progress(progressData);
      const savedProgress = await progress.save();

      expect(savedProgress.completed).toBe(false);
      expect(savedProgress.date).toBeDefined();
      expect(savedProgress.date).toBeInstanceOf(Date);
      expect(savedProgress.maxUnlockedLevel).toBe(1);
      expect(savedProgress.correctAnswersPerLevel).toEqual({});
    });
  });

  describe('Arrays and Complex Fields', () => {
    it('dovrebbe gestire correttamente answeredQuestions array', async () => {
      const progressData = {
        user: testUser._id,
        game: 'quiz',
        sessionId: 'session_789',
        score: 100,
        level: 3,
        answeredQuestions: ['q1', 'q2', 'q3', 'q4', 'q5']
      };

      const progress = new Progress(progressData);
      const savedProgress = await progress.save();

      expect(savedProgress.answeredQuestions).toEqual(['q1', 'q2', 'q3', 'q4', 'q5']);
      expect(savedProgress.answeredQuestions).toHaveLength(5);
    });

    it('dovrebbe gestire correttamente wrongAnsweredQuestions array', async () => {
      const progressData = {
        user: testUser._id,
        game: 'quiz',
        sessionId: 'session_wrong',
        score: 60,
        level: 2,
        wrongAnsweredQuestions: ['q6', 'q7', 'q8']
      };

      const progress = new Progress(progressData);
      const savedProgress = await progress.save();

      expect(savedProgress.wrongAnsweredQuestions).toEqual(['q6', 'q7', 'q8']);
      expect(savedProgress.wrongAnsweredQuestions).toHaveLength(3);
    });

    it('dovrebbe gestire correctAnswersPerLevel come oggetto Mixed', async () => {
      const progressData = {
        user: testUser._id,
        game: 'quiz',
        sessionId: 'session_levels',
        score: 90,
        level: 3,
        correctAnswersPerLevel: {
          '1': 5,
          '2': 3,
          '3': 2
        }
      };

      const progress = new Progress(progressData);
      const savedProgress = await progress.save();

      expect(savedProgress.correctAnswersPerLevel).toEqual({
        '1': 5,
        '2': 3,
        '3': 2
      });
    });

    it('dovrebbe gestire details come Schema.Types.Mixed', async () => {
      const progressData = {
        user: testUser._id,
        game: 'memory',
        sessionId: 'session_details',
        score: 75,
        level: 2,
        details: {
          timeSpent: 180,
          mistakes: 4,
          hintsUsed: 2,
          customData: {
            difficulty: 'medium',
            category: 'animals'
          }
        }
      };

      const progress = new Progress(progressData);
      const savedProgress = await progress.save();

      expect(savedProgress.details.timeSpent).toBe(180);
      expect(savedProgress.details.mistakes).toBe(4);
      expect(savedProgress.details.hintsUsed).toBe(2);
      expect(savedProgress.details.customData.difficulty).toBe('medium');
    });
  });

  describe('Data Types and Conversion', () => {
    it('dovrebbe convertire stringhe numeriche in numeri', async () => {
      const progressData = {
        user: testUser._id,
        game: 'sorting',
        sessionId: 'session_convert',
        score: '95', // String
        level: '4', // String
        maxUnlockedLevel: '3' // String
      };

      const progress = new Progress(progressData);
      const savedProgress = await progress.save();

      expect(typeof savedProgress.score).toBe('number');
      expect(typeof savedProgress.level).toBe('number');
      expect(typeof savedProgress.maxUnlockedLevel).toBe('number');
      expect(savedProgress.score).toBe(95);
      expect(savedProgress.level).toBe(4);
      expect(savedProgress.maxUnlockedLevel).toBe(3);
    });

    it('dovrebbe gestire valori booleani per completed', async () => {
      const progressData1 = {
        user: testUser._id,
        game: 'matching',
        sessionId: 'session_bool1',
        score: 80,
        level: 2,
        completed: true
      };

      const progressData2 = {
        user: testUser._id,
        game: 'matching',
        sessionId: 'session_bool2',
        score: 65,
        level: 2,
        completed: false
      };

      const progress1 = new Progress(progressData1);
      const progress2 = new Progress(progressData2);
      
      const savedProgress1 = await progress1.save();
      const savedProgress2 = await progress2.save();

      expect(savedProgress1.completed).toBe(true);
      expect(savedProgress2.completed).toBe(false);
    });
  });

  describe('Relationships', () => {
    it('dovrebbe mantenere il riferimento all\'utente', async () => {
      const progressData = {
        user: testUser._id,
        game: 'quiz',
        sessionId: 'session_ref',
        score: 70,
        level: 1
      };

      const progress = new Progress(progressData);
      const savedProgress = await progress.save();

      // Popola il riferimento all'utente
      const populatedProgress = await Progress.findById(savedProgress._id).populate('user');
      
      expect(populatedProgress.user._id.toString()).toBe(testUser._id.toString());
      expect(populatedProgress.user.name).toBe('Test User');
      expect(populatedProgress.user.email).toBe('test@example.com');
    });
  });

  describe('Queries and Indexes', () => {
    beforeEach(async () => {
      // Crea diversi progressi per i test
      const progresses = [
        {
          user: testUser._id,
          game: 'quiz',
          sessionId: 'session_1',
          score: 90,
          level: 1,
          completed: true,
          date: new Date('2024-01-01')
        },
        {
          user: testUser._id,
          game: 'memory',
          sessionId: 'session_2',
          score: 75,
          level: 2,
          completed: true,
          date: new Date('2024-01-02')
        },
        {
          user: testUser._id,
          game: 'quiz',
          sessionId: 'session_3',
          score: 85,
          level: 1,
          completed: false,
          date: new Date('2024-01-03')
        }
      ];

      await Progress.insertMany(progresses);
    });

    it('dovrebbe trovare progressi per utente', async () => {
      const userProgresses = await Progress.find({ user: testUser._id });
      expect(userProgresses).toHaveLength(3);
    });

    it('dovrebbe trovare progressi per tipo di gioco', async () => {
      const quizProgresses = await Progress.find({ 
        user: testUser._id, 
        game: 'quiz' 
      });
      expect(quizProgresses).toHaveLength(2);
    });

    it('dovrebbe trovare progressi completati', async () => {
      const completedProgresses = await Progress.find({ 
        user: testUser._id, 
        completed: true 
      });
      expect(completedProgresses).toHaveLength(2);
    });

    it('dovrebbe ordinare per data', async () => {
      const progresses = await Progress.find({ user: testUser._id })
        .sort({ date: -1 });
      
      expect(progresses[0].sessionId).toBe('session_3'); // Più recente
      expect(progresses[2].sessionId).toBe('session_1'); // Più vecchio
    });

    it('dovrebbe trovare progresso per sessionId', async () => {
      const progress = await Progress.findOne({ 
        user: testUser._id, 
        sessionId: 'session_2' 
      });
      
      expect(progress).toBeDefined();
      expect(progress.game).toBe('memory');
      expect(progress.score).toBe(75);
    });
  });

  describe('Edge Cases', () => {
    it('dovrebbe gestire score zero', async () => {
      const progressData = {
        user: testUser._id,
        game: 'quiz',
        sessionId: 'session_zero',
        score: 0,
        level: 1
      };

      const progress = new Progress(progressData);
      const savedProgress = await progress.save();

      expect(savedProgress.score).toBe(0);
    });

    it('dovrebbe gestire array vuoti', async () => {
      const progressData = {
        user: testUser._id,
        game: 'quiz',
        sessionId: 'session_empty',
        score: 50,
        level: 1,
        answeredQuestions: [],
        wrongAnsweredQuestions: []
      };

      const progress = new Progress(progressData);
      const savedProgress = await progress.save();

      expect(savedProgress.answeredQuestions).toEqual([]);
      expect(savedProgress.wrongAnsweredQuestions).toEqual([]);
    });

    it('dovrebbe gestire details null o undefined', async () => {
      const progressData = {
        user: testUser._id,
        game: 'quiz',
        sessionId: 'session_null_details',
        score: 50,
        level: 1,
        details: null
      };

      const progress = new Progress(progressData);
      const savedProgress = await progress.save();

      expect(savedProgress.details).toBeNull();
    });
  });
});
