import React, { useEffect, useState } from 'react';
import { fetchGames, fetchQuestionProgressAndSuggestions } from '../core/api';
import { Link } from 'react-router-dom';
import GameBadge from '../components/GameBadge';
import '../styles/main.css';

const MatchingSelectionPage = () => {
  const [matchingGames, setMatchingGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [solvedMap, setSolvedMap] = useState({});
  const [unlockedCategories, setUnlockedCategories] = useState({});

  useEffect(() => {
    const loadMatchingGames = async () => {
      try {
        const games = await fetchGames();
        const gamesArray = Array.isArray(games) ? games : (Array.isArray(games.games) ? games.games : []);
        // Filtra solo i matching (escludendo il matching_selection)
        const matchingOnly = gamesArray.filter(game => 
          game.type === 'matching' && game.id !== 'matching_selection'
        );
        // Recupera domande sbloccate per categoria
        const res = await fetchQuestionProgressAndSuggestions('matching');
        const maxUnlockedLevel = res.maxUnlockedLevel || 1;
        // Raggruppa domande per categoria
        const unlocked = {};
        for (const game of matchingOnly) {
          // Prendi tutte le domande di questa categoria
          const catQuestions = [...res.answeredQuestions, ...res.unansweredQuestions].filter(q => q.category === game.category);
          // Filtra solo quelle sbloccate
          const unlockedQuestions = catQuestions.filter(q => (q.difficulty || 1) <= maxUnlockedLevel);
          unlocked[game.category] = unlockedQuestions.length > 0;
        }
        setUnlockedCategories(unlocked);
        setMatchingGames(matchingOnly);
        setLoading(false);
        
        // Per ogni matching game, controlla se è stato completato
        const solved = {};
        for (const game of matchingOnly) {
          const res = await fetchQuestionProgressAndSuggestions('matching');
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
        console.error('Errore nel caricamento dei giochi matching:', error);
        setLoading(false);
      }
    };

    loadMatchingGames();
  }, []);

  const headerStyle = {
    background: 'linear-gradient(135deg, #4AE290 0%, #6BCF7F 100%)',
    color: '#fff',
    padding: '2rem 1rem',
    borderRadius: '18px',
    margin: '2rem auto 2.5rem auto',
    maxWidth: '900px',
    boxShadow: '0 4px 24px 0 rgba(74,226,144,0.20)',
    textAlign: 'center',
  };

  const gamesSectionStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2rem',
    justifyContent: 'center',
    margin: '2rem 0',
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="loading-spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e9ecef',
          borderTop: '4px solid #4AE290',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem auto',
        }}></div>
        <p>Caricamento giochi matching disponibili...</p>
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
          Scegli il tuo Matching! 🔗
        </h1>
        <p style={{ fontSize: '1.3rem', maxWidth: 600, margin: '0 auto' }}>
          Seleziona una categoria e metti alla prova le tue abilità di abbinamento.
        </p>
      </section>

      <h2 style={{ textAlign: 'center', margin: '2rem 0 1rem 0', fontWeight: 700 }}>
        Giochi Matching Disponibili ({matchingGames.length})
      </h2>

      {matchingGames.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888', fontSize: '1.2rem', padding: '2rem' }}>
          Nessun gioco matching disponibile al momento.
        </div>
      ) : (
        <div style={gamesSectionStyle}>
          {matchingGames.filter(game => unlockedCategories[game.category]).map((game) => (
            <GameBadge
              key={game.id}
              name={game.name}
              description={`${game.description} (${game.config?.pairs || 0} abbinamenti)`}
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

export default MatchingSelectionPage; 