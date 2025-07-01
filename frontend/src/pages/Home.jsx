import React, { useEffect, useState } from 'react';
import { fetchGames, fetchQuestions } from '../core/api';
import { Link } from 'react-router-dom';

const Home = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchGames().then(data => {
      setGames(data);
      setLoading(false);
    });
    fetchQuestions().then(setQuestions);
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Giochi disponibili</h1>
      {loading ? (
        <p>Caricamento giochi...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {games.length === 0 ? (
            <li>Nessun gioco disponibile.</li>
          ) : (
            games.map((game, idx) => (
              <li key={idx} style={{ margin: '0.5em 0' }}>
                <Link to={`/game/${game.id}`} style={{ textDecoration: 'none', color: '#4A90E2', fontWeight: 'bold' }}>
                  {game.name || 'Gioco senza nome'}
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
      <h2>Domande didattiche disponibili: {questions.length}</h2>
    </div>
  );
};

export default Home; 