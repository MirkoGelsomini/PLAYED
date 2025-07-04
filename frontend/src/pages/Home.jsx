import React, { useEffect, useState } from 'react';
import { fetchGames, fetchQuestions } from '../core/api';
import { Link } from 'react-router-dom';
import GameBadge from '../components/GameBadge';
import '../styles/main.css';

const heroStyle = {
  background: 'linear-gradient(90deg, #83B3E9 0%, #F7C873 100%)',
  color: '#fff',
  padding: '2.5rem 1rem 2rem 1rem',
  borderRadius: '18px',
  margin: '2rem auto 2.5rem auto',
  maxWidth: '900px',
  boxShadow: '0 4px 24px 0 rgba(74,144,226,0.10)',
};

const gamesSectionStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '2rem',
  justifyContent: 'center',
  margin: '2rem 0',
};

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
    <div>
      <section style={heroStyle}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 800 }}>Benvenuto su Played!</h1>
        <p style={{ fontSize: '1.3rem', maxWidth: 600, margin: '0 auto' }}>
          Scopri giochi didattici, metti alla prova la tua memoria e le tue abilità, e segui i tuoi progressi. Scegli un gioco qui sotto per iniziare a divertirti!
        </p>
      </section>
      <h2 style={{ textAlign: 'center', margin: '2rem 0 1rem 0', fontWeight: 700 }}>Giochi disponibili</h2>
      {loading ? (
        <p style={{ textAlign: 'center' }}>Caricamento giochi...</p>
      ) : (
        <div style={gamesSectionStyle}>
          {games.length === 0 ? (
            <div style={{ color: '#888', fontSize: '1.2rem' }}>Nessun gioco disponibile.</div>
          ) : (
            games.map((game, idx) => (
              <GameBadge
                key={game.id || idx}
                name={game.name || 'Gioco senza nome'}
                description={game.description || 'Descrizione non disponibile.'}
                to={`/game/${game.id}`}
                icon={game.icon || undefined}
                soon={game.soon}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Home; 