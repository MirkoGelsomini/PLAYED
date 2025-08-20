const Trophy = require('../../src/models/Trophy');

describe('Trophy Model', () => {
  describe('Validation', () => {
    it('dovrebbe creare un trofeo valido', async () => {
      const trophyData = {
        name: 'Primo Passo',
        description: 'Completa il tuo primo gioco',
        category: 'achievement',
        icon: '🏆',
        rarity: 'common',
        points: 50,
        requirements: {
          gamesCompleted: 1
        }
      };

      const trophy = new Trophy(trophyData);
      const savedTrophy = await trophy.save();

      expect(savedTrophy._id).toBeDefined();
      expect(savedTrophy.name).toBe('Primo Passo');
      expect(savedTrophy.category).toBe('achievement');
      expect(savedTrophy.rarity).toBe('common');
      expect(savedTrophy.points).toBe(50);
    });

    it('dovrebbe richiedere campi obbligatori', async () => {
      const trophy = new Trophy({});
      await expect(trophy.save()).rejects.toThrow();
    });

    it('dovrebbe richiedere name univoco', async () => {
      const trophyData = {
        name: 'Trofeo Duplicato',
        description: 'Descrizione test',
        category: 'achievement',
        icon: '🏆',
        rarity: 'common',
        points: 25,
        requirements: { level: 1 }
      };

      const trophy1 = new Trophy(trophyData);
      await trophy1.save();

      const trophy2 = new Trophy(trophyData);
      await expect(trophy2.save()).rejects.toThrow();
    });

    it('dovrebbe validare enum per category', async () => {
      const trophyData = {
        name: 'Trofeo Test',
        description: 'Descrizione test',
        category: 'invalid_category',
        icon: '🏆',
        rarity: 'common',
        points: 25,
        requirements: { level: 1 }
      };

      const trophy = new Trophy(trophyData);
      await expect(trophy.save()).rejects.toThrow();
    });

    it('dovrebbe validare enum per rarity', async () => {
      const trophyData = {
        name: 'Trofeo Test',
        description: 'Descrizione test',
        category: 'achievement',
        icon: '🏆',
        rarity: 'invalid_rarity',
        points: 25,
        requirements: { level: 1 }
      };

      const trophy = new Trophy(trophyData);
      await expect(trophy.save()).rejects.toThrow();
    });
  });

  describe('Valid Enum Values', () => {
    it('dovrebbe accettare tutte le categorie valide', async () => {
      const validCategories = ['achievement', 'milestone', 'special', 'seasonal', 'challenge', 'level'];
      
      for (const category of validCategories) {
        const trophyData = {
          name: `Trofeo ${category}`,
          description: `Trofeo di categoria ${category}`,
          category: category,
          icon: '🏆',
          rarity: 'common',
          points: 25,
          requirements: { level: 1 }
        };

        const trophy = new Trophy(trophyData);
        const savedTrophy = await trophy.save();
        
        expect(savedTrophy.category).toBe(category);
      }
    });

    it('dovrebbe accettare tutte le rarità valide', async () => {
      const validRarities = ['common', 'rare', 'epic', 'legendary', 'mythic'];
      
      for (const rarity of validRarities) {
        const trophyData = {
          name: `Trofeo ${rarity}`,
          description: `Trofeo di rarità ${rarity}`,
          category: 'achievement',
          icon: '🏆',
          rarity: rarity,
          points: 25,
          requirements: { level: 1 }
        };

        const trophy = new Trophy(trophyData);
        const savedTrophy = await trophy.save();
        
        expect(savedTrophy.rarity).toBe(rarity);
      }
    });
  });

  describe('Default Values', () => {
    it('dovrebbe impostare valori di default corretti', async () => {
      const trophyData = {
        name: 'Trofeo Default',
        description: 'Test valori default',
        category: 'achievement',
        icon: '🏆',
        rarity: 'common',
        requirements: { level: 1 }
      };

      const trophy = new Trophy(trophyData);
      const savedTrophy = await trophy.save();

      expect(savedTrophy.points).toBe(0); // Default value
      expect(savedTrophy.unlockedAt).toBeNull(); // Default value
      expect(savedTrophy.isActive).toBe(true); // Default value
    });
  });

  describe('Requirements Field', () => {
    it('dovrebbe gestire requirements semplici', async () => {
      const trophyData = {
        name: 'Livello 10',
        description: 'Raggiungi il livello 10',
        category: 'level',
        icon: '🏆',
        rarity: 'rare',
        points: 100,
        requirements: {
          level: 10
        }
      };

      const trophy = new Trophy(trophyData);
      const savedTrophy = await trophy.save();

      expect(savedTrophy.requirements.level).toBe(10);
    });

    it('dovrebbe gestire requirements complessi', async () => {
      const trophyData = {
        name: 'Maestro Completo',
        description: 'Completa tutti i requisiti',
        category: 'challenge',
        icon: '👑',
        rarity: 'legendary',
        points: 500,
        requirements: {
          level: 50,
          gamesCompleted: 100,
          totalScore: 10000,
          gameTypes: ['quiz', 'memory', 'matching', 'sorting'],
          perfectGames: 10
        }
      };

      const trophy = new Trophy(trophyData);
      const savedTrophy = await trophy.save();

      expect(savedTrophy.requirements.level).toBe(50);
      expect(savedTrophy.requirements.gamesCompleted).toBe(100);
      expect(savedTrophy.requirements.totalScore).toBe(10000);
      expect(savedTrophy.requirements.gameTypes).toEqual(['quiz', 'memory', 'matching', 'sorting']);
      expect(savedTrophy.requirements.perfectGames).toBe(10);
    });

    it('dovrebbe gestire requirements con oggetti annidati', async () => {
      const trophyData = {
        name: 'Specialista Quiz',
        description: 'Eccellenza nei quiz',
        category: 'special',
        icon: '🧠',
        rarity: 'epic',
        points: 250,
        requirements: {
          gameSpecific: {
            quiz: {
              minScore: 90,
              completedGames: 50
            }
          },
          timeConstraints: {
            within: '30 days'
          }
        }
      };

      const trophy = new Trophy(trophyData);
      const savedTrophy = await trophy.save();

      expect(savedTrophy.requirements.gameSpecific.quiz.minScore).toBe(90);
      expect(savedTrophy.requirements.gameSpecific.quiz.completedGames).toBe(50);
      expect(savedTrophy.requirements.timeConstraints.within).toBe('30 days');
    });
  });

  describe('Data Types', () => {
    it('dovrebbe convertire stringhe numeriche in numeri per points', async () => {
      const trophyData = {
        name: 'Trofeo Conversione',
        description: 'Test conversione tipi',
        category: 'achievement',
        icon: '🏆',
        rarity: 'common',
        points: '150', // String
        requirements: { level: 1 }
      };

      const trophy = new Trophy(trophyData);
      const savedTrophy = await trophy.save();

      expect(typeof savedTrophy.points).toBe('number');
      expect(savedTrophy.points).toBe(150);
    });

    it('dovrebbe gestire date per unlockedAt', async () => {
      const unlockDate = new Date('2024-01-15T10:30:00Z');
      const trophyData = {
        name: 'Trofeo Data',
        description: 'Test gestione date',
        category: 'achievement',
        icon: '🏆',
        rarity: 'common',
        points: 50,
        requirements: { level: 1 },
        unlockedAt: unlockDate
      };

      const trophy = new Trophy(trophyData);
      const savedTrophy = await trophy.save();

      expect(savedTrophy.unlockedAt).toEqual(unlockDate);
      expect(savedTrophy.unlockedAt).toBeInstanceOf(Date);
    });

    it('dovrebbe gestire valori booleani per isActive', async () => {
      const trophyData1 = {
        name: 'Trofeo Attivo',
        description: 'Trofeo attivo',
        category: 'achievement',
        icon: '🏆',
        rarity: 'common',
        points: 50,
        requirements: { level: 1 },
        isActive: true
      };

      const trophyData2 = {
        name: 'Trofeo Inattivo',
        description: 'Trofeo inattivo',
        category: 'achievement',
        icon: '🏆',
        rarity: 'common',
        points: 50,
        requirements: { level: 1 },
        isActive: false
      };

      const trophy1 = new Trophy(trophyData1);
      const trophy2 = new Trophy(trophyData2);
      
      const savedTrophy1 = await trophy1.save();
      const savedTrophy2 = await trophy2.save();

      expect(savedTrophy1.isActive).toBe(true);
      expect(savedTrophy2.isActive).toBe(false);
    });
  });

  describe('Queries and Operations', () => {
    beforeEach(async () => {
      const trophies = [
        {
          name: 'Principiante',
          description: 'Primo livello',
          category: 'level',
          icon: '🏆',
          rarity: 'common',
          points: 50,
          requirements: { level: 1 },
          isActive: true
        },
        {
          name: 'Esperto',
          description: 'Livello avanzato',
          category: 'level',
          icon: '🏆',
          rarity: 'rare',
          points: 200,
          requirements: { level: 20 },
          isActive: true
        },
        {
          name: 'Trofeo Stagionale',
          description: 'Evento speciale',
          category: 'seasonal',
          icon: '🎃',
          rarity: 'epic',
          points: 300,
          requirements: { event: 'halloween' },
          isActive: false
        }
      ];

      await Trophy.insertMany(trophies);
    });

    it('dovrebbe trovare trofei per categoria', async () => {
      const levelTrophies = await Trophy.find({ category: 'level' });
      expect(levelTrophies).toHaveLength(2);
    });

    it('dovrebbe trovare trofei per rarità', async () => {
      const rareTrophies = await Trophy.find({ rarity: 'rare' });
      expect(rareTrophies).toHaveLength(1);
      expect(rareTrophies[0].name).toBe('Esperto');
    });

    it('dovrebbe trovare trofei attivi', async () => {
      const activeTrophies = await Trophy.find({ isActive: true });
      expect(activeTrophies).toHaveLength(2);
    });

    it('dovrebbe ordinare trofei per punti', async () => {
      const trophies = await Trophy.find({}).sort({ points: -1 });
      expect(trophies[0].points).toBe(300); // Più alto
      expect(trophies[2].points).toBe(50);  // Più basso
    });

    it('dovrebbe trovare trofeo per nome', async () => {
      const trophy = await Trophy.findOne({ name: 'Principiante' });
      expect(trophy).toBeDefined();
      expect(trophy.category).toBe('level');
      expect(trophy.points).toBe(50);
    });
  });

  describe('Complex Requirements Scenarios', () => {
    it('dovrebbe gestire trofei basati su statistiche multiple', async () => {
      const trophyData = {
        name: 'Tuttofare',
        description: 'Eccellenza in tutti i giochi',
        category: 'challenge',
        icon: '🌟',
        rarity: 'mythic',
        points: 1000,
        requirements: {
          totalScore: 50000,
          gamesCompleted: 500,
          gameTypes: {
            quiz: { minGames: 100, avgScore: 80 },
            memory: { minGames: 100, avgScore: 75 },
            matching: { minGames: 100, avgScore: 85 },
            sorting: { minGames: 100, avgScore: 70 }
          },
          achievements: {
            perfectGames: 50,
            dailyStreak: 30,
            weeklyGoals: 12
          }
        }
      };

      const trophy = new Trophy(trophyData);
      const savedTrophy = await trophy.save();

      expect(savedTrophy.requirements.totalScore).toBe(50000);
      expect(savedTrophy.requirements.gameTypes.quiz.minGames).toBe(100);
      expect(savedTrophy.requirements.achievements.perfectGames).toBe(50);
    });

    it('dovrebbe gestire trofei con condizioni temporali', async () => {
      const trophyData = {
        name: 'Velocista',
        description: 'Completa 10 giochi in un giorno',
        category: 'challenge',
        icon: '⚡',
        rarity: 'epic',
        points: 400,
        requirements: {
          gamesInTimeframe: {
            count: 10,
            timeframe: 'day',
            unit: 'games'
          },
          conditions: {
            minScore: 50,
            allCompleted: true
          }
        }
      };

      const trophy = new Trophy(trophyData);
      const savedTrophy = await trophy.save();

      expect(savedTrophy.requirements.gamesInTimeframe.count).toBe(10);
      expect(savedTrophy.requirements.gamesInTimeframe.timeframe).toBe('day');
      expect(savedTrophy.requirements.conditions.minScore).toBe(50);
    });
  });

  describe('Edge Cases', () => {
    it('dovrebbe gestire points a zero', async () => {
      const trophyData = {
        name: 'Trofeo Gratuito',
        description: 'Nessun punto assegnato',
        category: 'special',
        icon: '🎁',
        rarity: 'common',
        points: 0,
        requirements: { participation: true }
      };

      const trophy = new Trophy(trophyData);
      const savedTrophy = await trophy.save();

      expect(savedTrophy.points).toBe(0);
    });

    it('dovrebbe gestire requirements vuoti', async () => {
      const trophyData = {
        name: 'Trofeo Semplice',
        description: 'Nessun requisito specifico',
        category: 'special',
        icon: '🏆',
        rarity: 'common',
        points: 10,
        requirements: {}
      };

      const trophy = new Trophy(trophyData);
      const savedTrophy = await trophy.save();

      expect(savedTrophy.requirements).toEqual({});
    });

    it('dovrebbe gestire nomi con caratteri speciali', async () => {
      const trophyData = {
        name: 'Trofeo "Speciale" & Unico!',
        description: 'Nome con caratteri speciali: àèìòù',
        category: 'special',
        icon: '🏆',
        rarity: 'common',
        points: 25,
        requirements: { level: 1 }
      };

      const trophy = new Trophy(trophyData);
      const savedTrophy = await trophy.save();

      expect(savedTrophy.name).toBe('Trofeo "Speciale" & Unico!');
      expect(savedTrophy.description).toBe('Nome con caratteri speciali: àèìòù');
    });
  });
});
