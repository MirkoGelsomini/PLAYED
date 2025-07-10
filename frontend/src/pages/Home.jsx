import React, { useEffect, useState } from 'react';
import { fetchGames, fetchQuestions } from '../core/api';
import { Link } from 'react-router-dom';
import GameBadge from '../components/GameBadge';
import '../styles/main.css';
import RotatingText from '../components/RotatingText'


const heroStyle = {
  background: 'linear-gradient(90deg, #83B3E9 0%, #F7C873 100%)',
  color: '#fff',
  padding: '2.5rem 1rem 2rem 1rem',
  borderRadius: '18px',
  margin: '2rem auto 2.5rem auto',
  maxWidth: '700px',
  maxHeight: '100px',
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
      // Mostra solo i badge generici di selezione
      const filteredGames = data.filter(game => 
        game.type === 'memory_selection' || game.type === 'quiz_selection' || game.type === 'matching_selection'
      );
      setGames(filteredGames);
      setLoading(false);
    });
    fetchQuestions().then(setQuestions);
  }, []);

  return (
    <div>
      
      <section style={heroStyle}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 800 }}>        
          <RotatingText
          texts={['Benvenuto su Played!', 'Scopri giochi didattici', 'Metti alla prova la tua memoria', 'Divertiti imparando!']}
          mainClassName="px-3 py-2 bg-gradient-to-r from-amber-300 via-orange-400 to-pink-400 text-gray-800 overflow-hidden rounded-lg shadow-md border border-orange-200"
          staggerFrom={"first"}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          staggerDuration={0.05}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          rotationInterval={4000}
        /></h1>
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
                type={game.type}
                category={game.category}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Home; 