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
  const [questionData, setQuestionData] = useState(question || null);
  const [items, setItems] = useState(question ? question.items : []);
  const [isCorrect, setIsCorrect] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [progressSaved, setProgressSaved] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (question) {
      setQuestionData(question);
      setItems(question.items);
    }
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
    if (completed && !progressSaved && user) {
      axios.post('/api/progress', {
        game: 'Sorting',
        sessionId: `${user._id}-sorting-${Date.now()}`,
        score: items.length,
        level: 1,
        completed: true,
        details: { attempts }
      }, { withCredentials: true })
      .catch(error => {
        console.error('Sorting: Errore nel salvataggio progressi', error.response?.data || error.message);
      });
      setProgressSaved(true);
    }
  }, [completed, progressSaved, user, items.length, attempts]);

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
      <h2>{questionData?.question}</h2>
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