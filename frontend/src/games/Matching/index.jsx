import React, { useState, useEffect } from 'react';
import './Matching.css';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const MatchingGame = ({ pairs = [], config = {} }) => {
  // pairs: [{left, right}]
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matched, setMatched] = useState([]); // [{left, right}]
  const [completed, setCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    setLeftItems(shuffle(pairs.map(p => p.left)));
    setRightItems(shuffle(pairs.map(p => p.right)));
    setMatched([]);
    setCompleted(false);
    setSelectedLeft(null);
    setAttempts(0);
  }, [pairs]);

  const handleLeftClick = (item) => {
    if (matched.find(m => m.left === item)) return;
    setSelectedLeft(item);
  };

  const handleRightClick = (item) => {
    if (!selectedLeft) return;
    if (matched.find(m => m.right === item)) return;
    setAttempts(a => a + 1);
    const pair = pairs.find(p => p.left === selectedLeft && p.right === item);
    if (pair) {
      setMatched(m => [...m, { left: selectedLeft, right: item }]);
      setSelectedLeft(null);
      setTimeout(() => {
        if (matched.length + 1 === pairs.length) setCompleted(true);
      }, 300);
    } else {
      setSelectedLeft(null);
    }
  };

  return (
    <div className="matching-container">
      <div className="matching-header">
        <span className="matching-title">Abbina gli elementi!</span>
        <span className="matching-attempts">Tentativi: {attempts}</span>
      </div>
      <div className="matching-board">
        <div className="matching-column">
          {leftItems.map((item, idx) => (
            <button
              key={item}
              className={`matching-item left ${selectedLeft === item ? 'selected' : ''} ${matched.find(m => m.left === item) ? 'matched' : ''}`}
              onClick={() => handleLeftClick(item)}
              disabled={matched.find(m => m.left === item) || completed}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="matching-column">
          {rightItems.map((item, idx) => (
            <button
              key={item}
              className={`matching-item right ${matched.find(m => m.right === item) ? 'matched' : ''}`}
              onClick={() => handleRightClick(item)}
              disabled={matched.find(m => m.right === item) || completed}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {completed && (
        <div className="matching-completed">
          <div className="matching-celebration">🎉</div>
          <h2>Complimenti!</h2>
          <p>Hai completato tutti gli abbinamenti in <b>{attempts}</b> tentativi!</p>
          <button className="matching-restart" onClick={() => {
            setLeftItems(shuffle(pairs.map(p => p.left)));
            setRightItems(shuffle(pairs.map(p => p.right)));
            setMatched([]);
            setCompleted(false);
            setSelectedLeft(null);
            setAttempts(0);
          }}>
            Rigioca
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchingGame; 