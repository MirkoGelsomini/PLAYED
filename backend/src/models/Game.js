// Modello dati per i giochi

const {
  memoryCategoryNames,
  quizCategoryNames,
  quizTimeLimits,
  matchingCategoryNames
} = require('../config/gamesConfig');

// Funzione per generare dinamicamente i giochi Memory dalle domande
const generateMemoryGames = (questions) => {
  if (!questions || !Array.isArray(questions)) return [];
  
  // Raggruppa le domande per categoria
  const questionsByCategory = questions
    .filter(q => q.type === 'memory')
    .reduce((acc, question) => {
      if (!acc[question.category]) {
        acc[question.category] = [];
      }
      acc[question.category].push(question);
      return acc;
    }, {});

  // Genera un gioco memory per ogni categoria
  const memoryGames = Object.entries(questionsByCategory).map(([category, categoryQuestions], index) => {
    return {
      id: `memory_${category}`,
      name: `Memory ${memoryCategoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1)}`,
      description: `Gioco di memoria per imparare i ${memoryCategoryNames[category] || category}.`,
      type: 'memory',
      category: category,
      questionId: categoryQuestions[0].id, // Usa la prima domanda come riferimento
      config: {
        pairs: categoryQuestions[0].pairs.length,
        timer: false,
        theme: category,
      },
      assets: [
        { id: 1, image: `${category}.png`, label: memoryCategoryNames[category] || category }
      ],
      questionCount: categoryQuestions.length
    };
  });

  return memoryGames;
};

// Funzione per generare dinamicamente i quiz dalle domande
const generateQuizGames = (questions) => {
  if (!questions || !Array.isArray(questions)) return [];
  
  // Raggruppa le domande per categoria
  const questionsByCategory = questions
    .filter(q => q.type === 'quiz')
    .reduce((acc, question) => {
      if (!acc[question.category]) {
        acc[question.category] = [];
      }
      acc[question.category].push(question);
      return acc;
    }, {});

  // Genera un quiz per ogni categoria
  const quizGames = Object.entries(questionsByCategory).map(([category, categoryQuestions], index) => {
    return {
      id: `quiz_${category}`,
      name: `Quiz di ${quizCategoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1)}`,
      description: `Metti alla prova le tue conoscenze di ${quizCategoryNames[category] || category} con domande interattive.`,
      type: 'quiz',
      category: category,
      questionIds: categoryQuestions.map(q => q.id), // Array di ID delle domande
      config: {
        timeLimit: quizTimeLimits[category] || 30,
        showTimer: true,
        theme: category,
        shuffleOptions: true,
      },
      assets: [
        { id: 1, image: `${category}.png`, label: quizCategoryNames[category] || category }
      ],
      questionCount: categoryQuestions.length
    };
  });

  return quizGames;
};

// Funzione per generare dinamicamente i giochi Matching dalle domande
const generateMatchingGames = (questions) => {
  if (!questions || !Array.isArray(questions)) return [];
  // Raggruppa le domande per categoria
  const questionsByCategory = questions
    .filter(q => q.type === 'matching')
    .reduce((acc, question) => {
      if (!acc[question.category]) {
        acc[question.category] = [];
      }
      acc[question.category].push(question);
      return acc;
    }, {});

  // Genera un gioco matching per ogni categoria
  const matchingGames = Object.entries(questionsByCategory).map(([category, categoryQuestions], index) => {
    return {
      id: `matching_${category}`,
      name: `Matching ${matchingCategoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1)}`,
      description: `Gioco di abbinamento per imparare i ${matchingCategoryNames[category] || category}.`,
      type: 'matching',
      category: category,
      questionId: categoryQuestions[0].id, // Usa la prima domanda come riferimento
      config: {
        pairs: categoryQuestions[0].pairs.length,
        theme: category,
      },
      assets: [
        { id: 1, image: `${category}.png`, label: matchingCategoryNames[category] || category }
      ],
      questionCount: categoryQuestions.length
    };
  });
  return matchingGames;
};

// Memory generico per la selezione
const memorySelectionGame = {
  id: 'memory_selection',
  name: 'MEMORY',
  description: 'Scegli la categoria e metti alla prova la tua memoria con giochi di abbinamento.',
  type: 'memory_selection',
  category: 'memory',
  config: {
    theme: 'memory',
  },
  assets: [
    { id: 1, image: 'memory.png', label: 'Memory' }
  ],
};

// Quiz generico per la selezione
const quizSelectionGame = {
  id: 'quiz_selection',
  name: 'QUIZ',
  description: 'Scegli la categoria e metti alla prova le tue conoscenze con domande interattive.',
  type: 'quiz_selection',
  category: 'quiz',
  config: {
    theme: 'quiz',
  },
  assets: [
    { id: 1, image: 'quiz.png', label: 'Quiz' }
  ],
};

// Matching generico per la selezione
const matchingSelectionGame = {
  id: 'matching_selection',
  name: 'MATCHING',
  description: 'Scegli la categoria e metti alla prova le tue abilità di abbinamento.',
  type: 'matching_selection',
  category: 'matching',
  config: {
    theme: 'matching',
  },
  assets: [
    { id: 1, image: 'matching.png', label: 'Matching' }
  ],
};

// In futuro: esporta una classe o schema per DB
module.exports = { 
  generateMemoryGames,
  generateQuizGames,
  generateMatchingGames,
  memorySelectionGame,
  quizSelectionGame,
  matchingSelectionGame
}; 