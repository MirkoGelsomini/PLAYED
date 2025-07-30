/**
 * File centralizzato per tutti i constraint del sistema
 * Questo file può essere importato sia dal backend che dal frontend
 */

// ============================================================================
// VALIDAZIONE UTENTE
// ============================================================================

const USER_CONSTRAINTS = {
  // Validazione nome
  NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    REQUIRED: true
  },

  // Validazione email
  EMAIL: {
    REQUIRED: true,
    PATTERN: /^[^@\s]+@[^@\s]+\.[^@\s]+$/
  },

  // Validazione password
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
    REQUIRED: true,
    // Regole per la forza della password
    STRENGTH_RULES: {
      MIN_LENGTH: 6,
      UPPERCASE_BONUS: 1,
      LOWERCASE_BONUS: 1,
      NUMBER_BONUS: 1,
      SPECIAL_CHAR_BONUS: 1,
      LENGTH_BONUS_THRESHOLD: 10
    }
  },

  // Validazione ruolo
  ROLE: {
    VALID_VALUES: ['allievo', 'docente'],
    REQUIRED: true
  },

  // Validazione età (solo per allievi)
  AGE: {
    MIN: 3,
    MAX: 100,
    REQUIRED_FOR_ROLE: 'allievo'
  },

  // Validazione avatar
  AVATAR: {
    REQUIRED: false,
    ALLOW_EMPTY: true
  },

  // Validazione campi scuola (per allievi)
  SCHOOL_LEVEL: {
    REQUIRED_FOR_ROLE: 'allievo'
  },

  CLASS: {
    REQUIRED_FOR_ROLE: 'allievo'
  },

  // Validazione campi docente
  SUBJECTS: {
    REQUIRED_FOR_ROLE: 'docente',
    MIN_ITEMS: 1
  },

  SCHOOL: {
    REQUIRED_FOR_ROLE: 'docente'
  },

  TEACHING_LEVEL: {
    REQUIRED_FOR_ROLE: 'docente'
  }
};

// ============================================================================
// SISTEMA DI LIVELLI E ESPERIENZA
// ============================================================================

const LEVEL_CONSTRAINTS = {
  // Calcolo livello: 1% dei punti totali, arrotondato verso il basso, minimo 1
  LEVEL_CALCULATION: {
    PERCENTAGE: 0.01,
    MIN_LEVEL: 1
  },

  // Esperienza per il prossimo livello
  EXPERIENCE: {
    DEFAULT_TO_NEXT_LEVEL: 100
  }
};

// ============================================================================
// SISTEMA DI GIOCHI E DIFFICOLTÀ
// ============================================================================

const GAME_CONSTRAINTS = {
  // Difficoltà dei giochi
  DIFFICULTY: {
    MIN: 1,
    MAX: 10,
    DEFAULT: 1
  },

  // Sblocco livelli
  LEVEL_UNLOCK: {
    THRESHOLD_PERCENTAGE: 0.8, // 80% di correttezza per sbloccare il livello successivo
    MIN_CORRECT_ANSWERS: 5, // Minimo 5 risposte corrette per considerare il livello
    MAX_UNLOCKED_LEVEL: 10
  },

  // Filtro domande per età
  AGE_FILTER: {
    MIN_DIFFICULTY: 1,
    MAX_DIFFICULTY: 10
  }
};

// ============================================================================
// SISTEMA DI TROFEI
// ============================================================================

const TROPHY_CONSTRAINTS = {
  // Rarità dei trofei
  RARITY: {
    VALUES: ['common', 'rare', 'epic', 'legendary', 'mythic'],
    POINTS: {
      common: 50,
      rare: 100,
      epic: 250,
      legendary: 500,
      mythic: 1000
    }
  },

  // Categorie trofei
  CATEGORIES: {
    VALUES: ['achievement', 'milestone', 'special', 'seasonal', 'challenge', 'level']
  },

  // Livelli per trofei basati su livello
  LEVEL_TROPHIES: [
    { level: 5, name: "Principiante", points: 50 },
    { level: 10, name: "Apprendista", points: 100 },
    { level: 20, name: "Esperto", points: 250 },
    { level: 35, name: "Maestro", points: 500 },
    { level: 50, name: "Gran Maestro", points: 1000 },
    { level: 75, name: "Leggenda", points: 2000 },
    { level: 100, name: "Immortale", points: 5000 }
  ]
};

// ============================================================================
// SISTEMA DI OBIETTIVI
// ============================================================================

const OBJECTIVE_CONSTRAINTS = {
  // Tipi di obiettivi
  TYPES: {
    VALUES: ['daily', 'weekly', 'monthly', 'special']
  },

  // Categorie obiettivi
  CATEGORIES: {
    VALUES: ['games', 'score', 'streak', 'variety', 'social']
  },

  // Difficoltà obiettivi
  DIFFICULTY: {
    VALUES: ['easy', 'medium', 'hard', 'expert'],
    DEFAULT: 'medium'
  },

  // Tipi di ricompensa
  REWARD_TYPES: {
    VALUES: ['points', 'trophy', 'badge', 'bonus']
  }
};

// ============================================================================
// SISTEMA DI PUNTEGGIO
// ============================================================================

const SCORE_CONSTRAINTS = {
  // Punteggio massimo per partita
  MAX_SCORE_PER_GAME: 100,

  // Punteggio minimo per considerare una partita valida
  MIN_SCORE_VALID: 0,

  // Bonus per streak
  STREAK_BONUS: {
    MULTIPLIER: 1.1,
    MAX_MULTIPLIER: 2.0
  }
};

// ============================================================================
// SISTEMA DI SESSIONI
// ============================================================================

const SESSION_CONSTRAINTS = {
  // Durata token JWT
  JWT_EXPIRY: {
    HOURS: 4,
    MILLISECONDS: 4 * 60 * 60 * 1000
  },

  // Cookie settings
  COOKIE: {
    HTTP_ONLY: true,
    SECURE: process.env.NODE_ENV === 'production',
    SAME_SITE: 'strict'
  }
};

// ============================================================================
// CONFIGURAZIONI GIOCHI
// ============================================================================

const GAME_CONFIGS = {
  // Categorie Memory
  MEMORY_CATEGORIES: {
    'animali': 'Animali',
    'colori': 'Colori',
    'numeri': 'Numeri',
    'frutta': 'Frutta',
    'forme': 'Forme Geometriche',
    'professioni': 'Professioni',
    'mezzi': 'Mezzi di Trasporto',
    'emozioni': 'Emozioni'
  },

  // Categorie Quiz
  QUIZ_CATEGORIES: {
    'scienze': 'Scienze',
    'geografia': 'Geografia',
    'storia': 'Storia',
    'matematica': 'Matematica',
    'lingua': 'Lingua Italiana',
    'arte': 'Arte',
    'musica': 'Musica',
    'sport': 'Sport'
  },

  // Limiti di tempo per Quiz (in secondi)
  QUIZ_TIME_LIMITS: {
    'scienze': 30,
    'geografia': 25,
    'storia': 35,
    'matematica': 20,
    'lingua': 30,
    'arte': 25,
    'musica': 30,
    'sport': 20
  },

  // Categorie Matching
  MATCHING_CATEGORIES: {
    'lingua': 'Lingua Italiana',
    'animali': 'Animali',
    'strumenti': 'Strumenti e Mestieri',
    'colori': 'Colori'
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Valida la forza di una password
 * @param {string} password - Password da validare
 * @returns {string} - 'Debole', 'Media', 'Forte'
 */
function validatePasswordStrength(password) {
  if (!password) return '';
  if (password.length < USER_CONSTRAINTS.PASSWORD.STRENGTH_RULES.MIN_LENGTH) return 'Debole';
  
  let score = 0;
  const rules = USER_CONSTRAINTS.PASSWORD.STRENGTH_RULES;
  
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= rules.LENGTH_BONUS_THRESHOLD) score++;
  
  if (score <= 2) return 'Debole';
  if (score === 3) return 'Media';
  if (score >= 4) return 'Forte';
  return '';
}

/**
 * Calcola il livello basato sui punti totali
 * @param {number} totalPoints - Punti totali dell'utente
 * @returns {number} - Livello calcolato
 */
function calculateLevel(totalPoints) {
  const { PERCENTAGE, MIN_LEVEL } = LEVEL_CONSTRAINTS.LEVEL_CALCULATION;
  return Math.max(MIN_LEVEL, Math.floor(totalPoints * PERCENTAGE));
}

/**
 * Valida un'email
 * @param {string} email - Email da validare
 * @returns {boolean} - True se valida
 */
function validateEmail(email) {
  return USER_CONSTRAINTS.EMAIL.PATTERN.test(email);
}

/**
 * Ottiene il limite di tempo per una categoria di quiz
 * @param {string} category - Categoria del quiz
 * @returns {number} - Limite di tempo in secondi
 */
function getQuizTimeLimit(category) {
  return GAME_CONFIGS.QUIZ_TIME_LIMITS[category] || 30;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  USER_CONSTRAINTS,
  LEVEL_CONSTRAINTS,
  GAME_CONSTRAINTS,
  TROPHY_CONSTRAINTS,
  OBJECTIVE_CONSTRAINTS,
  SCORE_CONSTRAINTS,
  SESSION_CONSTRAINTS,
  GAME_CONFIGS,
  validatePasswordStrength,
  calculateLevel,
  validateEmail,
  getQuizTimeLimit
}; 