// Funzioni di utilità per chiamate API al backend
export const fetchGames = async () => {
  const res = await fetch('/api/games');
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

// Aggiungi altre funzioni per utenti, progressi, ecc. 