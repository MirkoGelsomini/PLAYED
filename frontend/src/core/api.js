import axios from 'axios';

// Configurazione axios per il backend
axios.defaults.baseURL = process.env.REACT_APP_API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Configurazione per inviare i cookie con le richieste
axios.defaults.withCredentials = true;

// Interceptor per gestire gli errori di risposta
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token scaduto o non valido - lascia che AuthContext gestisca il logout
      console.log('401 Unauthorized - token scaduto o non valido');
    }
    return Promise.reject(error);
  }
);

// Funzioni di utilità per chiamate API al backend
export const fetchGames = async () => {
  const response = await axios.get('/api/games');
  return response.data;
};

export const fetchQuestions = async () => {
  const response = await axios.get('/api/games/questions/filtered');
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axios.delete(`/api/users/${id}`);
  return response.data;
};

// API per trofei e obiettivi
export const fetchUserTrophies = async () => {
  const response = await axios.get('/api/trophy/trophies');
  return response.data;
};

export const fetchUserObjectives = async () => {
  const response = await axios.get('/api/trophy/objectives');
  return response.data;
};

export const fetchUserStats = async () => {
  const response = await axios.get('/api/trophy/stats');
  return response.data;
};

export const checkTrophies = async () => {
  const response = await axios.post('/api/trophy/check-trophies');
  return response.data;
};

export const updateObjectiveProgress = async (gameType, score, completed) => {
  const response = await axios.post('/api/trophy/update-progress', {
    gameType,
    score,
    completed
  });
  return response.data;
};

export const fetchLeaderboard = async (type = 'points', limit = 10) => {
  const response = await axios.get(`/api/trophy/leaderboard?type=${type}&limit=${limit}`);
  return response.data;
};

// API per progresso
export const saveProgress = async (gameData) => {
  const response = await axios.post('/api/progress', gameData);
  return response.data;
};

export const fetchUserProgress = async (limit = 50, gameType = null) => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit);
  if (gameType) params.append('gameType', gameType);
  
  const response = await axios.get(`/api/progress?${params}`);
  return response.data;
};

export const fetchProgressStats = async () => {
  const response = await axios.get('/api/progress/stats');
  return response.data;
};

export const fetchProgressLeaderboard = async (type = 'points', limit = 10) => {
  const response = await axios.get(`/api/progress/leaderboard?type=${type}&limit=${limit}`);
  return response.data;
};

// Ottieni domande fatte/non fatte e suggerimenti per un gioco
export const fetchQuestionProgressAndSuggestions = async (gameType) => {
  const params = new URLSearchParams();
  params.append('gameType', gameType);
  const response = await axios.get(`/api/progress/questions?${params.toString()}`);
  return response.data;
};

// Aggiorna le domande risposte per una sessione
export const answerQuestion = async (sessionId, questionId, isCorrect, questionDifficulty) => {
  const response = await axios.post('/api/progress/answer', {
    sessionId,
    questionId,
    isCorrect,
    questionDifficulty
  });
  return response.data;
};

export const fetchDetailedProgress = async () => {
  try {
    const response = await axios.get('/api/progress/detailed');
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero progressi dettagliati:', error);
    throw error;
  }
};
