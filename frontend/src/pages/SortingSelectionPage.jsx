import React, { useEffect, useState } from 'react';
import { fetchQuestions } from '../core/api';
import { Link } from 'react-router-dom';
import GameBadge from '../components/GameBadge';
import '../styles/main.css';

const SortingSelectionPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions().then(questions => {
      // Prendi solo domande di tipo 'sorting'
      const sortingQuestions = questions.filter(q => q.type === 'sorting');
      // Estrai le categorie uniche
      const uniqueCategories = Array.from(new Set(sortingQuestions.map(q => q.category)));
      setCategories(uniqueCategories);
      setLoading(false);
    });
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="loading-spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e9ecef',
          borderTop: '4px solid #F7C873',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem auto',
        }}></div>
        <p>Caricamento categorie ordinamento...</p>
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
          Scegli la categoria di Ordinamento! 🔢
        </h1>
        <p style={{ fontSize: '1.3rem', maxWidth: 600, margin: '0 auto' }}>
          Seleziona una categoria e metti alla prova le tue abilità di ordinamento logico e sequenziale.
        </p>
      </section>
      <h2 style={{ textAlign: 'center', margin: '2rem 0 1rem 0', fontWeight: 700 }}>
        Categorie disponibili ({categories.length})
      </h2>
      {categories.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888', fontSize: '1.2rem', padding: '2rem' }}>
          Nessuna categoria di ordinamento disponibile al momento.
        </div>
      ) : (
        <div style={gamesSectionStyle}>
          {categories.map((cat, idx) => (
            <GameBadge
              key={cat}
              name={cat.charAt(0).toUpperCase() + cat.slice(1)}
              description={`Domande di ordinamento per la categoria "${cat}"`}
              to={`/sorting/category/${encodeURIComponent(cat)}`}
              type="sorting"
              category={cat}
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

export default SortingSelectionPage; 