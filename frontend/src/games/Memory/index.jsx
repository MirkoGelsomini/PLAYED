import React, { useState, useEffect } from 'react';
import './Memory.css';
import axios from 'axios';
import { useAuth } from '../../core/AuthContext';
import { useLocation } from 'react-router-dom';

const LEVEL_THRESHOLD = 5;

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// pairs: array di oggetti {front, back}
const generateCards = (pairs) => {
  if (!Array.isArray(pairs) || pairs.length === 0) return [];
  let cards = [];
  pairs.forEach((pair, idx) => {
    cards.push({ id: `f${idx}`, value: pair.front, pairId: idx, type: 'front' });
    cards.push({ id: `b${idx}`, value: pair.back, pairId: idx, type: 'back' });
  });
  return shuffle(cards);
};

const MemoryGame = ({ config = {}, pairs: propPairs, category, onQuestionAnswered }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const questionIdParam = params.get('questionId');
  const { user } = useAuth();
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [pairs, setPairs] = useState([]);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [lock, setLock] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);

  // Carica pairs filtrate per livello sbloccato
  useEffect(() => {
    const loadPairsAndLevel = async () => {
      try {
        const res = await axios.get('/api/progress/questions?gameType=memory', { withCredentials: true });
        const { unansweredQuestions, answeredQuestions, maxUnlockedLevel, correctAnswersPerLevel } = res.data;
        setMaxUnlockedLevel(maxUnlockedLevel || 1);
        setLevelProgress(correctAnswersPerLevel?.[maxUnlockedLevel?.toString()] || 0);
        let allQuestions = [...answeredQuestions, ...unansweredQuestions].filter(q => 
          (q.difficulty || 1) <= (maxUnlockedLevel || 1) && 
          q.category === category
        );
        // Se questionIdParam, filtra per quella domanda
        if (questionIdParam) {
          allQuestions = allQuestions.filter(q => String(q.id) === String(questionIdParam));
        }
        // Ricava tutte le pairs
        let allPairs = [];
        allQuestions.forEach(q => {
          if (Array.isArray(q.pairs)) {
            allPairs = allPairs.concat(q.pairs.map(p => ({ ...p, id: q.id, difficulty: q.difficulty })));
          }
        });
        setPairs(allPairs);
        setCards(generateCards(allPairs));
      } catch (err) {
        setPairs(propPairs || []);
        setCards(generateCards(propPairs || []));
      }
    };
    loadPairsAndLevel();
    // eslint-disable-next-line
  }, [JSON.stringify(propPairs), questionIdParam, category]);

  useEffect(() => {
    if (completed && !progressSaved && user) {
      // Prendi la difficoltà della domanda (se unica)
      const difficulty = pairs[0]?.difficulty || config.difficulty || 1;
      
      // Genera un sessionId per questa risposta
      const responseSessionId = `${user.id || user._id}-memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      axios.post('/api/progress/answer', {
        sessionId: responseSessionId,
        questionId: pairs[0]?.id || 'memory',
        isCorrect: true,
        questionDifficulty: difficulty
      }, { withCredentials: true })
      .then(resp => {
        const nuovoLivello = resp.data.progress.maxUnlockedLevel;
        if (nuovoLivello > maxUnlockedLevel) {
          setShowLevelUp(true);
          setTimeout(() => setShowLevelUp(false), 3000);
          setMaxUnlockedLevel(nuovoLivello);
          setLevelProgress(0);
        } else {
          const correctPerLevel = resp.data.progress.correctAnswersPerLevel || {};
          const currentLevelProgress = correctPerLevel[maxUnlockedLevel?.toString()] || 0;
          setLevelProgress(currentLevelProgress);
        }
      })
      .catch(err => {
        console.error('Errore salvataggio progressi Memory:', err);
      });
      setProgressSaved(true);
      if (onQuestionAnswered) onQuestionAnswered();
    }
  }, [completed, progressSaved, user, pairs, config.difficulty, onQuestionAnswered, maxUnlockedLevel]);

  const resetGame = () => {
    const newCards = generateCards(pairs);
    setCards(newCards);
    setFlipped([]);
    setMatched([]);
    setAttempts(0);
    setCompleted(false);
    setLock(false);
    setProgressSaved(false);
  };

  const handleCardClick = (idx) => {
    if (lock || flipped.includes(idx) || matched.includes(idx)) return;
    if (flipped.length === 0) {
      setFlipped([idx]);
    } else if (flipped.length === 1) {
      setFlipped([flipped[0], idx]);
      setLock(true);
      setAttempts(a => a + 1);
      setTimeout(() => {
        const first = cards[flipped[0]];
        const second = cards[idx];
        if (
          first.pairId === second.pairId &&
          first.id !== second.id // non la stessa carta
        ) {
          setMatched(m => [...m, flipped[0], idx]);
          if (matched.length + 2 === cards.length) {
            setCompleted(true);
          }
        }
        setFlipped([]);
        setLock(false);
      }, 900);
    }
  };

  return (
    <div className="memory-container">
      {showLevelUp && (
        <div className="levelup-notification">
          <span role="img" aria-label="level up">🚀</span> Nuovo livello sbloccato! Ora puoi affrontare domande più difficili!
        </div>
      )}
      <div className="memory-header">
        <span className="memory-title">Memory Game</span>
        <span className="memory-attempts">Tentativi: {attempts}</span>
        <div className="memory-level-progress">
          <span>Livello sbloccato: <strong>{maxUnlockedLevel}</strong></span>
          <div className="level-progress-container">
            <div className="level-progress-bar">
              <div 
                className="level-progress-fill"
                style={{
                  width: `${Math.min(100, (levelProgress / LEVEL_THRESHOLD) * 100)}%`,
                  background: 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                }}
              />
            </div>
            <span className="level-progress-text">{levelProgress}/{LEVEL_THRESHOLD}</span>
          </div>
        </div>
      </div>
      <div className="memory-board-wrapper">
        <div className="memory-board-grid">
          {cards.map((card, idx) => {
            const isFlipped = flipped.includes(idx) || matched.includes(idx);
            return (
              <button
                key={card.id}
                className={`memory-card${isFlipped ? ' flipped' : ''}${matched.includes(idx) ? ' matched' : ''}`}
                onClick={() => handleCardClick(idx)}
                disabled={isFlipped || lock || completed}
                aria-label={isFlipped ? card.value : 'Carta coperta'}
              >
                <span className="memory-card-inner">
                  <span className="memory-card-front">{card.value}</span>
                  <span className="memory-card-back">?</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {completed && (
        <MemoryResults attempts={attempts} user={user} pairs={pairs} config={config} resetGame={resetGame} />
      )}
    </div>
  );
};

export default MemoryGame;

// Aggiungo componente MemoryResults
function MemoryResults({ attempts, user, pairs, config, resetGame }) {
  return (
    <>
      <div className="memory-completed">
        <div className="memory-celebration">🎉</div>
        <h2>Complimenti!</h2>
        <p>Hai completato il Memory in <b>{attempts}</b> tentativi!</p>
        <button className="memory-restart" onClick={resetGame}>
          Rigioca
        </button>
      </div>
    </>
  );
} 