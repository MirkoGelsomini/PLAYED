import React, { useEffect, useState } from 'react';
import { fetchQuestions, fetchQuestionProgressAndSuggestions } from '../core/api';
import { Link } from 'react-router-dom';
import GameBadge from '../components/GameBadge';
import '../styles/main.css';

const SortingSelectionPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [solvedMap, setSolvedMap] = useState({});
  const [unlockedCategories, setUnlockedCategories] = useState({});

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const [questions, progressRes] = await Promise.all([
          fetchQuestions(),
          fetchQuestionProgressAndSuggestions('sorting')
        ]);
        
        // Prendi solo domande di tipo 'sorting'
        const sortingQuestions = questions.filter(q => q.type === 'sorting');
        const maxUnlockedLevel = progressRes.maxUnlockedLevel || 1;
        
        // Estrai le categorie uniche e controlla se hanno domande sbloccate
        const uniqueCategories = Array.from(new Set(sortingQuestions.map(q => q.category)));
        const unlocked = {};
        
        for (const category of uniqueCategories) {
          // Prendi tutte le domande di questa categoria
          const catQuestions = sortingQuestions.filter(q => q.category === category);
          // Filtra solo quelle sbloccate
          const unlockedQuestions = catQuestions.filter(q => (q.difficulty || 1) <= maxUnlockedLevel);
          unlocked[category] = unlockedQuestions.length > 0;
        }
        
        setUnlockedCategories(unlocked);
        setCategories(uniqueCategories);
        setLoading(false);
        
        // Per ogni categoria, controlla se è stata completata
        const solved = {};
        for (const category of uniqueCategories) {
          // Filtra per categoria
          const catQuestions = progressRes.answeredQuestions.filter(q => q.category === category);
          const allCatQuestions = [...progressRes.answeredQuestions, ...progressRes.unansweredQuestions].filter(q => q.category === category);
          if (allCatQuestions.length > 0 && catQuestions.length === allCatQuestions.length) {
            solved[category] = true;
          } else {
            solved[category] = false;
          }
        }
        setSolvedMap(solved);
      } catch (error) {
        console.error('Errore nel caricamento delle categorie sorting:', error);
        setLoading(false);
      }
    };

    loadCategories();
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
        Categorie disponibili ({categories.filter(cat => unlockedCategories[cat]).length})
      </h2>
      {categories.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888', fontSize: '1.2rem', padding: '2rem' }}>
          Nessuna categoria di ordinamento disponibile al momento.
        </div>
      ) : (
        <div style={gamesSectionStyle}>
          {categories.filter(cat => unlockedCategories[cat]).map((cat, idx) => (
            <GameBadge
              key={cat}
              name={cat.charAt(0).toUpperCase() + cat.slice(1)}
              description={`Domande di ordinamento per la categoria "${cat}"`}
              to={`/sorting/category/${encodeURIComponent(cat)}`}
              type="sorting"
              category={cat}
              solved={!!solvedMap[cat]}
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