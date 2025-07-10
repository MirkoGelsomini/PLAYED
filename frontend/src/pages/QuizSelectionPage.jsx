import React, { useEffect, useState } from 'react';
import { fetchGames, fetchQuestions } from '../core/api';
import { Link } from 'react-router-dom';
import GameBadge from '../components/GameBadge';
import '../styles/main.css';

const QuizSelectionPage = () => {
  const [quizGames, setQuizGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuizGames = async () => {
      try {
        const games = await fetchGames();
        // Filtra solo i quiz (escludendo il quiz_selection)
        const quizOnly = games.filter(game => 
          game.type === 'quiz' && game.id !== 'quiz_selection'
        );
        setQuizGames(quizOnly);
        setLoading(false);
      } catch (error) {
        console.error('Errore nel caricamento dei quiz:', error);
        setLoading(false);
      }
    };

    loadQuizGames();
  }, []);

  const headerStyle = {
    background: 'linear-gradient(135deg, #F7C873 0%, #FFD700 100%)',
    color: '#fff',
    padding: '2rem 1rem',
    borderRadius: '18px',
    margin: '2rem auto 2.5rem auto',
    maxWidth: '900px',
    boxShadow: '0 4px 24px 0 rgba(247,200,115,0.20)',
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
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="loading-spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e9ecef',
          borderTop: '4px solid #4A90E2',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem auto',
        }}></div>
        <p>Caricamento quiz disponibili...</p>
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
          Scegli il tuo Quiz! 🎯
        </h1>
        <p style={{ fontSize: '1.3rem', maxWidth: 600, margin: '0 auto' }}>
          Seleziona una categoria e metti alla prova le tue conoscenze con domande interattive e timer.
        </p>
      </section>

      <h2 style={{ textAlign: 'center', margin: '2rem 0 1rem 0', fontWeight: 700 }}>
        Quiz Disponibili ({quizGames.length})
      </h2>

      {quizGames.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888', fontSize: '1.2rem', padding: '2rem' }}>
          Nessun quiz disponibile al momento.
        </div>
      ) : (
        <div style={gamesSectionStyle}>
          {quizGames.map((game) => (
            <GameBadge
              key={game.id}
              name={game.name}
              description={`${game.description} (${game.questionCount || 0} domande)`}
              to={`/game/${game.id}`}
              type={game.type}
              category={game.category}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default QuizSelectionPage; 