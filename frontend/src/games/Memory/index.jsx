import React, { useState, useEffect } from 'react';
import './Memory.css';
import axios from 'axios';
import { useAuth } from '../../core/AuthContext';
import { useLocation } from 'react-router-dom';

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

const MemoryGame = ({ config = {}, pairs: propPairs, onQuestionAnswered }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const questionIdParam = params.get('questionId');
  // propPairs è un array di oggetti {front, back}
  const pairs = propPairs || [];
  let filteredPairs = pairs;
  if (questionIdParam) {
    // questionId corrisponde all'id della domanda in questions.json
    // Trova la domanda e usa solo le sue pairs
    // (Serve passare pairs come [{front, back}] per la domanda specifica)
    filteredPairs = pairs.filter(p => String(p.id) === String(questionIdParam));
    if (filteredPairs.length === 0 && pairs.length > 0) {
      // fallback: usa tutte
      filteredPairs = pairs;
    }
  }
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]); // indici delle carte girate
  const [matched, setMatched] = useState([]); // indici delle carte trovate
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [lock, setLock] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    resetGame();
    // eslint-disable-next-line
  }, [JSON.stringify(filteredPairs)]);

  useEffect(() => {
    if (completed && !progressSaved && user) {
      axios.post('/api/progress', {
        game: 'Memory',
        sessionId: `${user._id}-memory-${Date.now()}`,
        score: pairs.length,
        level: config.difficulty || 1,
        completed: true,
        details: { attempts }
      }, { withCredentials: true })
      .catch(error => {
        console.error('Memory: Errore nel salvataggio progressi', error.response?.data || error.message);
      });
      setProgressSaved(true);
      if (onQuestionAnswered) onQuestionAnswered();
    }
  }, [completed, progressSaved, user, pairs.length, config.difficulty, attempts, onQuestionAnswered]);

  const resetGame = () => {
    const newCards = generateCards(filteredPairs);
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
            if (!progressSaved && user) {
              axios.post('/api/progress', {
                game: 'Memory',
                sessionId: `${user._id}-memory-${Date.now()}`,
                score: pairs.length,
                level: config.difficulty || 1,
                completed: true,
                details: { attempts }
              }, { withCredentials: true }).catch(() => {});
              setProgressSaved(true);
            }
          }
        }
        setFlipped([]);
        setLock(false);
      }, 900);
    }
  };

  return (
    <div className="memory-container">
      <div className="memory-header">
        <span className="memory-title">Memory Game</span>
        <span className="memory-attempts">Tentativi: {attempts}</span>
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