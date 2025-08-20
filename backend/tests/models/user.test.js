const User = require('../../src/models/User');
const { calculateLevel } = require('../../../shared/constraints');

describe('User Model', () => {
  describe('Validation', () => {
    it('dovrebbe creare un utente allievo valido', async () => {
      const userData = {
        name: 'Mario Rossi',
        email: 'mario@example.com',
        password: 'password123',
        role: 'allievo',
        schoolLevel: 'prim',
        class: '3'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe('Mario Rossi');
      expect(savedUser.role).toBe('allievo');
      expect(savedUser.totalPoints).toBe(0);
      expect(savedUser.level).toBe(1);
    });

    it('dovrebbe creare un utente docente valido', async () => {
      const userData = {
        name: 'Prof. Bianchi',
        email: 'prof.bianchi@school.com',
        password: 'password123',
        role: 'docente',
        subjects: ['Matematica', 'Scienze'],
        school: 'Istituto Comprensivo Test',
        teachingLevel: 'Scuola primaria'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe('Prof. Bianchi');
      expect(savedUser.role).toBe('docente');
      expect(savedUser.subjects).toEqual(['Matematica', 'Scienze']);
    });

    it('dovrebbe richiedere campi obbligatori', async () => {
      const user = new User({});

      await expect(user.save()).rejects.toThrow();
    });

    it('dovrebbe validare email univoche', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'allievo',
        schoolLevel: 'prim',
        class: '1'
      };

      const user1 = new User(userData);
      await user1.save();

      const user2 = new User(userData);
      await expect(user2.save()).rejects.toThrow();
    });

    it('dovrebbe validare i valori enum per role', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'invalid_role',
        schoolLevel: 'prim',
        class: '1'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('dovrebbe validare i valori enum per schoolLevel', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'allievo',
        schoolLevel: 'invalid_level',
        class: '1'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('Default Values', () => {
    it('dovrebbe impostare valori di default corretti', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'allievo',
        schoolLevel: 'prim',
        class: '1'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.totalPoints).toBe(0);
      expect(savedUser.gamesCompleted).toBe(0);
      expect(savedUser.dailyStreak).toBe(0);
      expect(savedUser.trophyCount).toBe(0);
      expect(savedUser.level).toBe(1);
      expect(savedUser.experience).toBe(0);
      expect(savedUser.experienceToNextLevel).toBe(100);
      expect(savedUser.avatar).toBe('');
    });
  });

  describe('Timestamps', () => {
    it('dovrebbe aggiungere automaticamente createdAt e updatedAt', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'allievo',
        schoolLevel: 'prim',
        class: '1'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
      expect(savedUser.createdAt).toBeInstanceOf(Date);
      expect(savedUser.updatedAt).toBeInstanceOf(Date);
    });

    it('dovrebbe aggiornare updatedAt quando si modifica l\'utente', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'allievo',
        schoolLevel: 'prim',
        class: '1'
      };

      const user = new User(userData);
      const savedUser = await user.save();
      const originalUpdatedAt = savedUser.updatedAt;

      // Aspetta un momento per assicurarsi che il timestamp sia diverso
      await new Promise(resolve => setTimeout(resolve, 10));

      savedUser.totalPoints = 100;
      const updatedUser = await savedUser.save();

      expect(updatedUser.updatedAt).not.toEqual(originalUpdatedAt);
      expect(updatedUser.updatedAt > originalUpdatedAt).toBe(true);
    });
  });

  describe('Data Integrity', () => {
    it('dovrebbe mantenere la coerenza dei dati numerici', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'allievo',
        schoolLevel: 'prim',
        class: '1',
        totalPoints: 1500,
        gamesCompleted: 25,
        dailyStreak: 7,
        level: calculateLevel(1500)
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.totalPoints).toBe(1500);
      expect(savedUser.gamesCompleted).toBe(25);
      expect(savedUser.dailyStreak).toBe(7);
      expect(savedUser.level).toBe(calculateLevel(1500));
    });

    it('dovrebbe gestire correttamente le date', async () => {
      const testDate = new Date('2024-01-15T10:30:00Z');
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'allievo',
        schoolLevel: 'prim',
        class: '1',
        lastPlayedDate: testDate
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.lastPlayedDate).toEqual(testDate);
    });
  });

  describe('Complex Scenarios', () => {
    it('dovrebbe gestire utenti con molti dati', async () => {
      const userData = {
        name: 'Super User',
        email: 'superuser@example.com',
        password: 'password123',
        role: 'allievo',
        schoolLevel: 'sec2',
        class: '5',
        avatar: 'lion.png',
        totalPoints: 10000,
        gamesCompleted: 500,
        dailyStreak: 100,
        lastPlayedDate: new Date(),
        trophyCount: 50,
        level: calculateLevel(10000),
        experience: 5000,
        experienceToNextLevel: 200
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.totalPoints).toBe(10000);
      expect(savedUser.level).toBe(calculateLevel(10000)); // Dovrebbe essere 100
      expect(savedUser.gamesCompleted).toBe(500);
      expect(savedUser.dailyStreak).toBe(100);
      expect(savedUser.trophyCount).toBe(50);
    });

    it('dovrebbe gestire la conversione di tipi per campi numerici', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'allievo',
        schoolLevel: 'prim',
        class: '1',
        totalPoints: '150', // String che dovrebbe essere convertita in numero
        gamesCompleted: '10'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(typeof savedUser.totalPoints).toBe('number');
      expect(typeof savedUser.gamesCompleted).toBe('number');
      expect(savedUser.totalPoints).toBe(150);
      expect(savedUser.gamesCompleted).toBe(10);
    });
  });
});
