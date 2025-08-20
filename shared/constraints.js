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

  // Validazione school level (solo per allievi)
  SCHOOL_LEVEL: {
    VALID_VALUES: ['prim', 'sec1', 'sec2'],
    REQUIRED_FOR_ROLE: 'allievo'
  },

  // Validazione avatar
  AVATAR: {
    REQUIRED: false,
    ALLOW_EMPTY: true
  },

  // Validazione classe (per allievi)
  CLASS: {
    REQUIRED_FOR_ROLE: 'allievo',
    VALID_VALUES: {
      'prim': ['1', '2', '3', '4', '5'],
      'sec1': ['1', '2', '3'],
      'sec2': ['1', '2', '3', '4', '5']
    }
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

  // Filtro domande per school level e classe
  SCHOOL_FILTER: {
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
// DEFINIZIONI OBIETTIVI STATICI
// ============================================================================

// Gli obiettivi non sono persistiti: vengono definiti staticamente qui.
// Ogni obiettivo deve avere un `id` stabile (stringa) usato per collegare i progressi utente.

const OBJECTIVE_DEFINITIONS = {
  DAILY: [
    {
      id: 'daily_play_3_games',
      title: 'Giocatore del Giorno',
      description: 'Completa 3 partite oggi',
      type: OBJECTIVE_CONSTRAINTS.TYPES.VALUES[0], // 'daily'
      category: OBJECTIVE_CONSTRAINTS.CATEGORIES.VALUES[0], // 'games'
      target: 3,
      reward: { type: OBJECTIVE_CONSTRAINTS.REWARD_TYPES.VALUES[0], value: 25 }, // points
      difficulty: OBJECTIVE_CONSTRAINTS.DIFFICULTY.VALUES[0] // easy
    },
    {
      id: 'daily_score_15_points',
      title: 'Quindici Punti',
      description: 'Fai almeno 15 punti in una partita (≈ 15 risposte corrette di difficoltà 1).',
      type: OBJECTIVE_CONSTRAINTS.TYPES.VALUES[0], // 'daily'
      category: OBJECTIVE_CONSTRAINTS.CATEGORIES.VALUES[1], // 'score'
      target: 15,
      reward: { type: OBJECTIVE_CONSTRAINTS.REWARD_TYPES.VALUES[0], value: 100 }, // points
      difficulty: OBJECTIVE_CONSTRAINTS.DIFFICULTY.VALUES[1] // medium
    },
    {
      id: 'daily_variety_two_types',
      title: 'Varietà di Giochi',
      description: 'Gioca 2 tipi diversi di giochi',
      type: OBJECTIVE_CONSTRAINTS.TYPES.VALUES[0], // 'daily'
      category: OBJECTIVE_CONSTRAINTS.CATEGORIES.VALUES[3], // 'variety'
      target: 2,
      reward: { type: OBJECTIVE_CONSTRAINTS.REWARD_TYPES.VALUES[0], value: 30 }, // points
      difficulty: OBJECTIVE_CONSTRAINTS.DIFFICULTY.VALUES[0] // easy
    }
  ]
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
    'matematica': 'Matematica',
    'italiano': 'Italiano',
    'storia': 'Storia',
    'scienze': 'Scienze',
    'geografia': 'Geografia'
  },

  // Limiti di tempo per Quiz (in secondi)
  QUIZ_TIME_LIMITS: {
    'matematica': 20,
    'italiano': 30,
    'storia': 35,
    'scienze': 30,
    'geografia': 25
  },

  // Categorie Matching
  MATCHING_CATEGORIES: {
    'italiano': 'Italiano',
    'matematica': 'Matematica',
    'storia': 'Storia',
    'scienze': 'Scienze',
    'geografia': 'Geografia'
  }
};

// ============================================================================
// VALIDAZIONE DOMANDE
// ============================================================================

const QUESTION_CONSTRAINTS = {
  // Tipi di domande validi
  TYPES: {
    VALID_VALUES: ['quiz', 'sorting', 'matching', 'memory'],
    REQUIRED: true
  },

  // Categorie di domande valide
  CATEGORIES: {
    VALID_VALUES: ['matematica', 'italiano', 'storia', 'scienze', 'geografia'],
    REQUIRED: true
  },

  // Validazione school level per domande
  SCHOOL_LEVEL: {
    VALID_VALUES: ['prim', 'sec1', 'sec2'],
    REQUIRED: true
  },

  // Validazione classe per domande
  CLASS: {
    REQUIRED: true,
    VALID_VALUES: {
      'prim': [1, 2, 3, 4, 5],
      'sec1': [1, 2, 3],
      'sec2': [1, 2, 3, 4, 5]
    }
  },

  // Validazione difficoltà
  DIFFICULTY: {
    MIN: 1,
    MAX: 10,
    REQUIRED: true
  },

  // Validazione contenuto domanda
  QUESTION_TEXT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 1000,
    REQUIRED: true
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

/**
 * Converte un codice school level in nome leggibile
 * @param {string} schoolLevel - Codice school level (prim, sec1, sec2)
 * @returns {string} - Nome leggibile
 */
function getSchoolLevelDisplayName(schoolLevel) {
  const displayNames = {
    'prim': 'Scuola primaria',
    'sec1': 'Scuola secondaria di primo grado',
    'sec2': 'Scuola secondaria di secondo grado'
  };
  return displayNames[schoolLevel] || schoolLevel;
}

/**
 * Converte un nome leggibile in codice school level
 * @param {string} displayName - Nome leggibile
 * @returns {string} - Codice school level
 */
function getSchoolLevelCode(displayName) {
  const codeMap = {
    'Scuola primaria': 'prim',
    'Scuola secondaria di primo grado': 'sec1',
    'Scuola secondaria di secondo grado': 'sec2'
  };
  return codeMap[displayName] || displayName;
}

/**
 * Valida il tipo di una domanda
 * @param {string} type - Tipo della domanda
 * @returns {boolean} - True se valido
 */
function validateQuestionType(type) {
  return QUESTION_CONSTRAINTS.TYPES.VALID_VALUES.includes(type);
}

/**
 * Valida la categoria di una domanda
 * @param {string} category - Categoria della domanda
 * @returns {boolean} - True se valido
 */
function validateQuestionCategory(category) {
  return QUESTION_CONSTRAINTS.CATEGORIES.VALID_VALUES.includes(category);
}

/**
 * Valida il school level di una domanda
 * @param {string} schoolLevel - School level della domanda
 * @returns {boolean} - True se valido
 */
function validateQuestionSchoolLevel(schoolLevel) {
  return QUESTION_CONSTRAINTS.SCHOOL_LEVEL.VALID_VALUES.includes(schoolLevel);
}

/**
 * Valida la classe per un determinato school level
 * @param {string} schoolLevel - School level
 * @param {string|number} classLevel - Classe
 * @returns {boolean} - True se valido
 */
function validateQuestionClass(schoolLevel, classLevel) {
  const validClasses = QUESTION_CONSTRAINTS.CLASS.VALID_VALUES[schoolLevel];
  if (!validClasses) return false;
  return validClasses.includes(parseInt(classLevel));
}

/**
 * Valida la difficoltà di una domanda
 * @param {number} difficulty - Difficoltà della domanda
 * @returns {boolean} - True se valido
 */
function validateQuestionDifficulty(difficulty) {
  const diff = parseInt(difficulty);
  return diff >= QUESTION_CONSTRAINTS.DIFFICULTY.MIN && diff <= QUESTION_CONSTRAINTS.DIFFICULTY.MAX;
}

/**
 * Valida tutti i parametri di una domanda
 * @param {Object} questionData - Dati della domanda
 * @returns {Object} - Risultato della validazione con eventuali errori
 */
function validateQuestionData(questionData) {
  const errors = [];
  
  // Validazione tipo
  if (!questionData.type) {
    errors.push('Il campo type è obbligatorio');
  } else if (!validateQuestionType(questionData.type)) {
    errors.push(`Tipo non valido. Valori ammessi: ${QUESTION_CONSTRAINTS.TYPES.VALID_VALUES.join(', ')}`);
  }
  
  // Validazione categoria
  if (!questionData.category) {
    errors.push('Il campo category è obbligatorio');
  } else if (!validateQuestionCategory(questionData.category)) {
    errors.push(`Categoria non valida. Valori ammessi: ${QUESTION_CONSTRAINTS.CATEGORIES.VALID_VALUES.join(', ')}`);
  }
  
  // Validazione school level
  if (!questionData.schoolLevel) {
    errors.push('Il campo schoolLevel è obbligatorio');
  } else if (!validateQuestionSchoolLevel(questionData.schoolLevel)) {
    errors.push(`School level non valido. Valori ammessi: ${QUESTION_CONSTRAINTS.SCHOOL_LEVEL.VALID_VALUES.join(', ')}`);
  }
  
  // Validazione classe
  if (!questionData.class) {
    errors.push('Il campo class è obbligatorio');
  } else if (questionData.schoolLevel && !validateQuestionClass(questionData.schoolLevel, questionData.class)) {
    const validClasses = QUESTION_CONSTRAINTS.CLASS.VALID_VALUES[questionData.schoolLevel];
    errors.push(`Classe ${questionData.class} non valida per il livello scolastico ${questionData.schoolLevel}. Valori ammessi: ${validClasses ? validClasses.join(', ') : 'nessuno'}`);
  }
  
  // Validazione difficoltà
  if (questionData.difficulty === undefined || questionData.difficulty === null) {
    errors.push('Il campo difficulty è obbligatorio');
  } else if (!validateQuestionDifficulty(questionData.difficulty)) {
    errors.push(`Difficoltà deve essere tra ${QUESTION_CONSTRAINTS.DIFFICULTY.MIN} e ${QUESTION_CONSTRAINTS.DIFFICULTY.MAX}`);
  }
  
  // Validazione contenuto domanda
  if (!questionData.question) {
    errors.push('Il campo question è obbligatorio');
  } else if (questionData.question.length < QUESTION_CONSTRAINTS.QUESTION_TEXT.MIN_LENGTH) {
    errors.push(`La domanda deve contenere almeno ${QUESTION_CONSTRAINTS.QUESTION_TEXT.MIN_LENGTH} carattere`);
  } else if (questionData.question.length > QUESTION_CONSTRAINTS.QUESTION_TEXT.MAX_LENGTH) {
    errors.push(`La domanda non può superare ${QUESTION_CONSTRAINTS.QUESTION_TEXT.MAX_LENGTH} caratteri`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
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
  QUESTION_CONSTRAINTS,
  OBJECTIVE_DEFINITIONS,
  validatePasswordStrength,
  calculateLevel,
  validateEmail,
  getQuizTimeLimit,
  getSchoolLevelDisplayName,
  getSchoolLevelCode,
  validateQuestionType,
  validateQuestionCategory,
  validateQuestionSchoolLevel,
  validateQuestionClass,
  validateQuestionDifficulty,
  validateQuestionData
}; 