import React, { useEffect, useState } from 'react';
import { fetchGames, fetchQuestionProgressAndSuggestions } from '../core/api';
import { Link } from 'react-router-dom';
import GameBadge from '../components/GameBadge';
import '../styles/main.css';

const MemorySelectionPage = () => {
  const [memoryGames, setMemoryGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [solvedMap, setSolvedMap] = useState({});
  const [unlockedCategories, setUnlockedCategories] = useState({});

  useEffect(() => {
    const loadMemoryGames = async () => {
      try {
        const games = await fetchGames();
        const gamesArray = Array.isArray(games) ? games : (Array.isArray(games.games) ? games.games : []);
        // Filtra solo i memory (escludendo il memory_selection)
        const memoryOnly = gamesArray.filter(game => 
          game.type === 'memory' && game.id !== 'memory_selection'
        );
        
        // Recupera domande sbloccate per categoria
        const res = await fetchQuestionProgressAndSuggestions('memory');
        const maxUnlockedLevel = res.maxUnlockedLevel || 1;
        
        // Raggruppa domande per categoria
        const unlocked = {};
        for (const game of memoryOnly) {
          // Prendi tutte le domande di questa categoria
          const catQuestions = [...res.answeredQuestions, ...res.unansweredQuestions].filter(q => q.category === game.category);
          // Filtra solo quelle sbloccate
          const unlockedQuestions = catQuestions.filter(q => (q.difficulty || 1) <= maxUnlockedLevel);
          unlocked[game.category] = unlockedQuestions.length > 0;
        }
        
        setUnlockedCategories(unlocked);
        setMemoryGames(memoryOnly);
        setLoading(false);
        
        // Per ogni memory game, controlla se è stato completato
        const solved = {};
        for (const game of memoryOnly) {
          const res = await fetchQuestionProgressAndSuggestions('memory');
          // Filtra per categoria
          const catQuestions = res.answeredQuestions.filter(q => q.category === game.category);
          const allCatQuestions = [...res.answeredQuestions, ...res.unansweredQuestions].filter(q => q.category === game.category);
          if (allCatQuestions.length > 0 && catQuestions.length === allCatQuestions.length) {
            solved[game.id] = true;
          } else {
            solved[game.id] = false;
          }
        }
        setSolvedMap(solved);
      } catch (error) {
        console.error('Errore nel caricamento dei giochi memory:', error);
        setLoading(false);
        // Se non ci sono domande disponibili, mostra un messaggio
        if (error.message && error.message.includes('età non disponibile')) {
          setMemoryGames([]);
        }
      }
    };

    loadMemoryGames();
  }, []);

  const headerStyle = {
    background: 'linear-gradient(135deg, #4A90E2 0%, #83B3E9 100%)',
    color: '#fff',
    padding: '2rem 1rem',
    borderRadius: '18px',
    margin: '2rem auto 2.5rem auto',
    maxWidth: '900px',
    boxShadow: '0 4px 24px 0 rgba(74,144,226,0.20)',
    textAlign: 'center',
  };

  const gamesSectionStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2rem',
    justifyContent: 'center',
    margin: '2rem 0',
  };

  const backButtonStyle = {
    background: 'none',
    color: '#4A90E2',
    border: '2px solid #4A90E2',
    borderRadius: '999px',
    padding: '0.35em 1.1em',
    fontWeight: 700,
    fontSize: '0.98rem',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    marginBottom: '2rem',
    transition: 'background 0.18s, color 0.18s, border 0.18s',
    outline: 'none',
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Caricamento giochi Memory...</div>
      </div>
    );
  }

  if (memoryGames.length === 0) {
    return (
      <div className="container">
        <div className="no-games">
          <h2>Nessun gioco Memory disponibile</h2>
          <p>Non ci sono domande disponibili per la tua età. Prova a modificare la tua età nel profilo per vedere più contenuti.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link to="/" className="back-home-btn">
        ← Torna alla Home
      </Link>
      
      <section style={headerStyle}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 800 }}>
          Scegli il tuo Memory! 🧠
        </h1>
        <p style={{ fontSize: '1.3rem', maxWidth: 600, margin: '0 auto' }}>
          Seleziona una categoria e metti alla prova la tua memoria con giochi di abbinamento divertenti.
        </p>
      </section>

      <h2 style={{ textAlign: 'center', margin: '2rem 0 1rem 0', fontWeight: 700 }}>
        Giochi Memory Disponibili ({memoryGames.length})
      </h2>

      {memoryGames.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888', fontSize: '1.2rem', padding: '2rem' }}>
          Nessun gioco memory disponibile al momento.
        </div>
      ) : (
        <div style={gamesSectionStyle}>
          {memoryGames.filter(game => unlockedCategories[game.category]).map((game) => (
            <GameBadge
              key={game.id}
              name={game.name}
              description={`${game.description} (${game.config?.pairs || 0} coppie)`}
              to={`/game/${game.id}`}
              type={game.type}
              category={game.category}
              solved={!!solvedMap[game.id]}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MemorySelectionPage; 