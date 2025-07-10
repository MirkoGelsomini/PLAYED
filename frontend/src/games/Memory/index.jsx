import React, { useState, useEffect } from 'react';
import './Memory.css';

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

const MemoryGame = ({ config = {}, pairs: propPairs }) => {
  // propPairs è un array di oggetti {front, back}
  const pairs = propPairs || [];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]); // indici delle carte girate
  const [matched, setMatched] = useState([]); // indici delle carte trovate
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [lock, setLock] = useState(false);

  useEffect(() => {
    resetGame();
    // eslint-disable-next-line
  }, [JSON.stringify(pairs)]);

  const resetGame = () => {
    const newCards = generateCards(pairs);
    setCards(newCards);
    setFlipped([]);
    setMatched([]);
    setAttempts(0);
    setCompleted(false);
    setLock(false);
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
        <div className="memory-completed">
          <div className="memory-celebration">🎉</div>
          <h2>Complimenti!</h2>
          <p>Hai completato il Memory in <b>{attempts}</b> tentativi!</p>
          <button className="memory-restart" onClick={resetGame}>
            Rigioca
          </button>
        </div>
      )}
    </div>
  );
};

export default MemoryGame; 