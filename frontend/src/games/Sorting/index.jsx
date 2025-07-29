// Assicurati di installare la dipendenza:
// npm install @hello-pangea/dnd
import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './Sorting.css';
import axios from 'axios';
import { useAuth } from '../../core/AuthContext';
import { fetchQuestions } from '../../core/api';

const LEVEL_THRESHOLD = 5;

// Componente per ogni item ordinabile
function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: isDragging ? '#d0e6ff' : '#f0f4fa',
    boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.10)' : '0 1px 3px rgba(0,0,0,0.04)',
    marginBottom: '10px',
    padding: '14px 20px',
    borderRadius: '8px',
    fontSize: '1.2rem',
    cursor: 'grab',
  };
  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </li>
  );
}

const Sorting = ({ question }) => {
  const { user } = useAuth();
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [questionData, setQuestionData] = useState(question || null);
  const [items, setItems] = useState(question ? question.items : []);
  const [isCorrect, setIsCorrect] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [progressSaved, setProgressSaved] = useState(false);

  // Carica domanda filtrata per livello sbloccato
  useEffect(() => {
    const loadQuestionAndLevel = async () => {
      try {
        const res = await axios.get('/api/progress/questions?gameType=sorting', { withCredentials: true });
        const { unansweredQuestions, answeredQuestions, maxUnlockedLevel, correctAnswersPerLevel } = res.data;
        setMaxUnlockedLevel(maxUnlockedLevel || 1);
        setLevelProgress(correctAnswersPerLevel?.[maxUnlockedLevel?.toString()] || 0);
        let allQuestions = [...answeredQuestions, ...unansweredQuestions].filter(q => (q.difficulty || 1) <= (maxUnlockedLevel || 1));
        // Prendi la prima domanda disponibile
        if (allQuestions.length > 0) {
          setQuestionData(allQuestions[0]);
          setItems(allQuestions[0].items);
        }
      } catch (err) {
        if (question) {
          setQuestionData(question);
          setItems(question.items);
        }
      }
    };
    loadQuestionAndLevel();
  }, [question]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      setItems((items) => arrayMove(items, oldIndex, newIndex));
      setIsCorrect(null);
    }
  };

  const checkOrder = () => {
    setAttempts(a => a + 1);
    const correct = JSON.stringify(items) === JSON.stringify(questionData.solution);
    setIsCorrect(correct);
    if (correct) {
      setCompleted(true);
    }
  };

  // Salva i progressi quando il gioco è completato
  React.useEffect(() => {
    if (completed && !progressSaved && user && questionData) {
      const difficulty = questionData.difficulty || 1;
      
      // Genera un sessionId per questa risposta
      const responseSessionId = `${user._id}-sorting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      axios.post('/api/progress/answer', {
        sessionId: responseSessionId,
        questionId: questionData.id || 'sorting',
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
        console.error('Errore salvataggio progressi Sorting:', err);
      });
      setProgressSaved(true);
    }
  }, [completed, progressSaved, user, items.length, attempts, questionData, maxUnlockedLevel]);

  const resetGame = () => {
    setItems(questionData.items);
    setIsCorrect(null);
    setCompleted(false);
    setAttempts(0);
    setProgressSaved(false);
  };

  if (!questionData) return null;

  if (completed) {
    return (
      <div className="sorting-completed">
        <div className="sorting-celebration">🎉</div>
        <h2>Complimenti!</h2>
        <p>Hai ordinato correttamente tutti gli elementi in <b>{attempts}</b> tentativi!</p>
        <button className="sorting-restart" onClick={resetGame}>
          Rigioca
        </button>
      </div>
    );
  }

  return (
    <div className="sorting-game-container">
      {showLevelUp && (
        <div className="levelup-notification">
          <span role="img" aria-label="level up">🚀</span> Nuovo livello sbloccato! Ora puoi affrontare domande più difficili!
        </div>
      )}
      <h2>{questionData?.question}</h2>
      <div className="sorting-level-progress">
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
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <ul className="sorting-list">
            {items.map((item) => (
              <SortableItem key={item} id={item}>
                {item}
              </SortableItem>
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <button onClick={checkOrder}>Verifica</button>
      {isCorrect === true && <div className="correct">Corretto!</div>}
      {isCorrect === false && <div className="incorrect">Prova ancora</div>}
    </div>
  );
}

export default Sorting; 