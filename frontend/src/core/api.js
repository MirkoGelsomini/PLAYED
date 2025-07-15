// Funzioni di utilità per chiamate API al backend
export const fetchGames = async () => {
  const res = await fetch('/api/games', {
    credentials: 'include'
  });
  return res.json();
};

export const fetchQuestions = async () => {
  const res = await fetch('/api/questions');
  return res.json();
};

export const deleteUser = async (id, token) => {
  const res = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Errore durante l\'eliminazione dell\'utente');
  return res.json();
};

// API per trofei e obiettivi
export const fetchUserTrophies = async () => {
  const res = await fetch('/api/trophy/trophies', {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Errore nel recupero trofei');
  return res.json();
};

export const fetchUserObjectives = async () => {
  const res = await fetch('/api/trophy/objectives', {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Errore nel recupero obiettivi');
  return res.json();
};

export const fetchUserStats = async () => {
  const res = await fetch('/api/trophy/stats', {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Errore nel recupero statistiche');
  return res.json();
};

export const checkTrophies = async () => {
  const res = await fetch('/api/trophy/check-trophies', {
    method: 'POST',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Errore nel controllo trofei');
  return res.json();
};

export const updateObjectiveProgress = async (gameType, score, completed) => {
  const res = await fetch('/api/trophy/update-progress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ gameType, score, completed })
  });
  if (!res.ok) throw new Error('Errore nell\'aggiornamento progresso');
  return res.json();
};

export const fetchLeaderboard = async (type = 'points', limit = 10) => {
  const res = await fetch(`/api/trophy/leaderboard?type=${type}&limit=${limit}`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Errore nel recupero leaderboard');
  return res.json();
};

// API per progresso
export const saveProgress = async (gameData) => {
  const res = await fetch('/api/progress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(gameData)
  });
  if (!res.ok) throw new Error('Errore nel salvataggio progresso');
  return res.json();
};

export const fetchUserProgress = async (limit = 50, gameType = null) => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit);
  if (gameType) params.append('gameType', gameType);
  
  const res = await fetch(`/api/progress?${params}`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Errore nel recupero progresso');
  return res.json();
};

export const fetchProgressStats = async () => {
  const res = await fetch('/api/progress/stats', {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Errore nel recupero statistiche progresso');
  return res.json();
};

export const fetchProgressLeaderboard = async (type = 'points', limit = 10) => {
  const res = await fetch(`/api/progress/leaderboard?type=${type}&limit=${limit}`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Errore nel recupero leaderboard progresso');
  return res.json();
};

export const fetchImprovementTrend = async (days = 30) => {
  const res = await fetch(`/api/progress/trend?days=${days}`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Errore nel recupero trend miglioramento');
  return res.json();
};
