import React, { useState, useEffect, useContext } from 'react';
import './Memory.css';
import axios from 'axios';
import { useAuth } from '../../core/AuthContext';
import { useLocation } from 'react-router-dom';
import { SidebarRefreshContext } from '../../core/SidebarRefreshContext';

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
    cards.push({ 
      id: `f${idx}`, 
      value: pair.front, 
      pairId: idx, 
      type: 'front',
      colorIndex: idx
    });
    cards.push({ 
      id: `b${idx}`, 
      value: pair.back, 
      pairId: idx, 
      type: 'back',
      colorIndex: idx
    });
  });
  return shuffle(cards);
};

const MemoryGame = ({ config = {}, pairs: propPairs, category, questionText, onQuestionAnswered }) => {
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
  const [gridColumns, setGridColumns] = useState(4);
  const { refresh } = useContext(SidebarRefreshContext);

  // Array di colori per le diverse coppie
  const pairColors = [
    'var(--gradient-sun)',
    'var(--gradient-sky)',
    'var(--gradient-primary)',
    'var(--gradient-green)',
    'var(--gradient-purple)',
    'var(--gradient-orange)',
    'var(--gradient-pink)',
    'var(--gradient-teal)'
  ];

  // Calcola il layout adattivo in base al numero di card e alla lunghezza media del testo
  const computeLayout = (cards) => {
    const cardCount = cards.length;
    const textLengths = cards.map(c => (c.value || '').length);
    const avgLen = textLengths.length ? (textLengths.reduce((a,b)=>a+b,0) / textLengths.length) : 0;
    // Base columns
    let columns = 4;
    if (cardCount <= 4) columns = 2; else if (cardCount <= 6) columns = 3; else if (cardCount <= 8) columns = 4; else if (cardCount <= 10) columns = 5; else if (cardCount <= 12) columns = 4; else columns = 5;
    // Adatta dimensioni e font in base alla lunghezza media
    let width = 120; let height = 140; let fontSize = 1.2; // default per testi medi
    if (avgLen <= 10) { width = 100; height = 110; fontSize = 1.4; }
    else if (avgLen <= 20) { width = 120; height = 140; fontSize = 1.2; }
    else if (avgLen <= 30) { width = 140; height = 170; fontSize = 1.05; }
    else if (avgLen <= 45) { width = 160; height = 200; fontSize = 0.95; }
    else { width = 180; height = 220; fontSize = 0.9; }
    // Per testi molto lunghi, riduci le colonne per fare spazio
    if (avgLen > 35 && columns > 3) columns = 3;
    return { columns, width, height, fontSize };
  };

  // Carica pairs: preferisci quelle passate da props (question specifica), altrimenti carica dal backend filtrando per livello
  useEffect(() => {
    const loadPairsAndLevel = async () => {
      try {
        if (Array.isArray(propPairs) && propPairs.length > 0) {
          setPairs(propPairs.map(p => ({ ...p })));
          const gen = generateCards(propPairs);
          setCards(gen);
          const layout = computeLayout(gen);
          setGridColumns(layout.columns);
          document.documentElement.style.setProperty('--card-width', `${layout.width}px`);
          document.documentElement.style.setProperty('--card-height', `${layout.height}px`);
          document.documentElement.style.setProperty('--card-font-size', `${layout.fontSize}rem`);
          return;
        }
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
          allQuestions = allQuestions.filter(q => String(q.id || q._id) === String(questionIdParam));
        }
        // Ricava tutte le coppie dal campo corretto (memoryPairs). Fallback: mappa pairs {left,right} -> {front,back}
        let allPairs = [];
        allQuestions.forEach(q => {
          let qPairs = [];
          if (Array.isArray(q.memoryPairs)) {
            qPairs = q.memoryPairs;
          } else if (Array.isArray(q.pairs)) {
            qPairs = q.pairs.map(p => ({ front: p.front ?? p.left, back: p.back ?? p.right }));
          }
          if (qPairs.length > 0) {
            allPairs = allPairs.concat(qPairs.map(p => ({ ...p, id: q.id || q._id, difficulty: q.difficulty })));
          }
        });
        setPairs(allPairs);
        const gen = generateCards(allPairs);
        setCards(gen);
        const layout = computeLayout(gen);
        setGridColumns(layout.columns);
        document.documentElement.style.setProperty('--card-width', `${layout.width}px`);
        document.documentElement.style.setProperty('--card-height', `${layout.height}px`);
        document.documentElement.style.setProperty('--card-font-size', `${layout.fontSize}rem`);
      } catch (err) {
        setPairs(Array.isArray(propPairs) ? propPairs : []);
        const gen = generateCards(Array.isArray(propPairs) ? propPairs : []);
        setCards(gen);
        const layout = computeLayout(gen);
        setGridColumns(layout.columns);
        document.documentElement.style.setProperty('--card-width', `${layout.width}px`);
        document.documentElement.style.setProperty('--card-height', `${layout.height}px`);
        document.documentElement.style.setProperty('--card-font-size', `${layout.fontSize}rem`);
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
        // Notifica global refresh (Sidebar e schermate collegate)
        if (typeof refresh === 'function') refresh();
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
    const layout = computeLayout(newCards);
    setGridColumns(layout.columns);
    document.documentElement.style.setProperty('--card-width', `${layout.width}px`);
    document.documentElement.style.setProperty('--card-height', `${layout.height}px`);
    document.documentElement.style.setProperty('--card-font-size', `${layout.fontSize}rem`);
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
        {questionText && (
          <div className="memory-question-text" style={{ maxWidth: '860px', width: '100%' }}>
            {questionText}
          </div>
        )}
        <div 
          className="memory-board-grid"
          style={{ 
            gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
            maxWidth: gridColumns <= 3 ? '400px' : gridColumns <= 4 ? '500px' : '600px'
          }}
        >
          {cards.map((card, idx) => {
            const isFlipped = flipped.includes(idx) || matched.includes(idx);
            const isMatched = matched.includes(idx);
            const colorIndex = card.colorIndex % pairColors.length;
            const pairColor = pairColors[colorIndex];
            
            return (
              <button
                key={card.id}
                className={`memory-card${isFlipped ? ' flipped' : ''}${isMatched ? ' matched' : ''}`}
                onClick={() => handleCardClick(idx)}
                disabled={isFlipped || lock || completed}
                aria-label={isFlipped ? card.value : 'Carta coperta'}
                style={isMatched ? {
                  '--pair-color': pairColor
                } : {}}
              >
                <span className="memory-card-inner">
                  <span className="memory-card-front">
                    <span style={{
                      display: 'inline-block',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'normal',
                      WebkitLineClamp: 6,
                      WebkitBoxOrient: 'vertical'
                    }} className="memory-card-front-text">
                      {card.value}
                    </span>
                  </span>
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