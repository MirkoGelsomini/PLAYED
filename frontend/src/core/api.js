// Funzioni di utilità per chiamate API al backend
export const fetchGames = async () => {
  const res = await fetch('/api/games');
  return res.json();
};

export const fetchQuestions = async () => {
  const res = await fetch('/api/questions');
  return res.json();
};

// Aggiungi altre funzioni per utenti, progressi, ecc. 