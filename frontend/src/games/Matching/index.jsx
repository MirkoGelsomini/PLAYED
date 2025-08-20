import React, { useState, useEffect, useContext } from 'react';
import './Matching.css';
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

const MatchingGame = ({ pairs: propPairs = [], config = {}, category, onQuestionAnswered }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const questionIdParam = params.get('questionId');
  const { user } = useAuth();
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [pairs, setPairs] = useState([]);
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matched, setMatched] = useState([]); // [{left, right}]
  const [completed, setCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [progressSaved, setProgressSaved] = useState(false);
  const { refresh } = useContext(SidebarRefreshContext);

  // Array di colori per le diverse coppie (stesso sistema del Memory)
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

  // Carica pairs filtrate per livello sbloccato
  useEffect(() => {
    const loadPairsAndLevel = async () => {
      try {
        const res = await axios.get('/api/progress/questions?gameType=matching', { withCredentials: true });
        const { unansweredQuestions, answeredQuestions, maxUnlockedLevel, correctAnswersPerLevel } = res.data;
        setMaxUnlockedLevel(maxUnlockedLevel || 1);
        setLevelProgress(correctAnswersPerLevel?.[maxUnlockedLevel?.toString()] || 0);
        let allQuestions = [...answeredQuestions, ...unansweredQuestions].filter(q => 
          (q.difficulty || 1) <= (maxUnlockedLevel || 1) && 
          q.category === category
        );
        
        // Se c'è un questionId specifico, trova quella domanda
        if (questionIdParam) {
          const specificQuestion = allQuestions.find(q => (q.id || q._id)?.toString() === questionIdParam);
          if (specificQuestion) {
            allQuestions = [specificQuestion];
          } else {
          }
        }
        
        // Seleziona una sola domanda per sessione (la prima disponibile)
        let selectedQuestion = null;
        if (allQuestions.length > 0) {
          // Se c'è un questionId specifico, usa quella domanda
          if (questionIdParam) {
            selectedQuestion = allQuestions[0];
          } else {
            // Preferisci domande non risposte
            selectedQuestion = allQuestions.find(q => !answeredQuestions.find(aq => (aq.id || aq._id) === (q.id || q._id))) || allQuestions[0];
          }
        }
        
        if (selectedQuestion && Array.isArray(selectedQuestion.pairs)) {
           // Usa solo le coppie della domanda selezionata
           const questionPairs = selectedQuestion.pairs.map((p, idx) => ({ 
            ...p, 
             id: selectedQuestion.id || selectedQuestion._id, 
            difficulty: selectedQuestion.difficulty,
            colorIndex: idx // Aggiungi l'indice del colore per ogni coppia
          }));
          
          // Rimuovi duplicati basati su left e right, mantenendo il colorIndex
          const uniquePairs = questionPairs.filter((pair, index, self) => 
            index === self.findIndex(p => p.left === pair.left && p.right === pair.right)
          ).map((pair, idx) => ({
            ...pair,
            colorIndex: idx // Re-assigna colorIndex dopo il filtro
          }));
          
          setPairs(uniquePairs);
          setLeftItems(shuffle(uniquePairs.map(p => p.left)));
          setRightItems(shuffle(uniquePairs.map(p => p.right)));
        } else {
          // Fallback alle props
          const fallbackPairs = (propPairs || []).map((p, idx) => ({
            ...p,
            colorIndex: idx
          }));
          setPairs(fallbackPairs);
          setLeftItems(shuffle(fallbackPairs.map(p => p.left)));
          setRightItems(shuffle(fallbackPairs.map(p => p.right)));
        }
      } catch (err) {
        const fallbackPairs = (propPairs || []).map((p, idx) => ({
          ...p,
          colorIndex: idx
        }));
        setPairs(fallbackPairs);
        setLeftItems(shuffle(fallbackPairs.map(p => p.left)));
        setRightItems(shuffle(fallbackPairs.map(p => p.right)));
      }
    };
    loadPairsAndLevel();
  }, [JSON.stringify(propPairs), questionIdParam, category]);

  useEffect(() => {
    if (completed && !progressSaved && user) {
      const difficulty = pairs[0]?.difficulty || config.difficulty || 1;
      
      // Genera un sessionId per questa risposta
      const responseSessionId = `${user.id || user._id}-matching-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      axios.post('/api/progress/answer', {
        sessionId: responseSessionId,
        questionId: pairs[0]?.id || 'matching',
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
        console.error('Errore salvataggio progressi Matching:', err);
      });
      setProgressSaved(true);
      if (onQuestionAnswered) onQuestionAnswered();
    }
  }, [completed, progressSaved, user, pairs, config.difficulty, onQuestionAnswered, maxUnlockedLevel]);

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
        if (matched.length + 1 === pairs.length) {
          setCompleted(true);
        }
      }, 300);
    } else {
      setSelectedLeft(null);
    }
  };

  const resetGame = () => {
    setLeftItems(shuffle(pairs.map(p => p.left)));
    setRightItems(shuffle(pairs.map(p => p.right)));
    setMatched([]);
    setCompleted(false);
    setSelectedLeft(null);
    setAttempts(0);
    setProgressSaved(false);
  };

  return (
    <div className="matching-container">
      {showLevelUp && (
        <div className="levelup-notification">
          <span role="img" aria-label="level up">🚀</span> Nuovo livello sbloccato! Ora puoi affrontare domande più difficili!
        </div>
      )}
      <div className="matching-header">
        <span className="matching-title">Abbina gli elementi!</span>
        <span className="matching-attempts">Tentativi: {attempts}</span>
        <div className="matching-level-progress">
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
      <div className="matching-board">
        <div className="matching-column">
          {leftItems.map((item, idx) => {
            const matchedPair = matched.find(m => m.left === item);
            const pair = pairs.find(p => p.left === item);
            const colorIndex = pair ? pair.colorIndex % pairColors.length : 0;
            const pairColor = pairColors[colorIndex];
            
            return (
              <button
                key={item}
                className={`matching-item left ${selectedLeft === item ? 'selected' : ''} ${matchedPair ? 'matched' : ''}`}
                onClick={() => handleLeftClick(item)}
                disabled={matchedPair || completed}
                style={matchedPair ? {
                  '--pair-color': pairColor
                } : {}}
              >
                {item}
              </button>
            );
          })}
        </div>
        <div className="matching-column">
          {rightItems.map((item, idx) => {
            const matchedPair = matched.find(m => m.right === item);
            const pair = pairs.find(p => p.right === item);
            const colorIndex = pair ? pair.colorIndex % pairColors.length : 0;
            const pairColor = pairColors[colorIndex];
            
            return (
              <button
                key={item}
                className={`matching-item right ${matchedPair ? 'matched' : ''}`}
                onClick={() => handleRightClick(item)}
                disabled={matchedPair || completed}
                style={matchedPair ? {
                  '--pair-color': pairColor
                } : {}}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
      {completed && (
        <MatchingResults attempts={attempts} user={user} pairs={pairs} config={config} resetGame={resetGame} />
      )}
    </div>
  );
};

export default MatchingGame;

function MatchingResults({ attempts, user, pairs, config, resetGame }) {
  return (
    <>
      <div className="matching-completed">
        <div className="matching-celebration">🎉</div>
        <h2>Complimenti!</h2>
        <p>Hai completato tutti gli abbinamenti in <b>{attempts}</b> tentativi!</p>
        <button className="matching-restart" onClick={resetGame}>
          Rigioca
        </button>
      </div>
    </>
  );
} 