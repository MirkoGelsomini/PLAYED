import React, { useEffect, useState } from 'react';
import { fetchGames, fetchQuestions } from '../core/api';
import MemoryGame from '../games/Memory';
import QuizGame from '../games/Quiz';
import MatchingGame from '../games/Matching';
import QuizSelectionPage from './QuizSelectionPage';
import MemorySelectionPage from './MemorySelectionPage';
import MatchingSelectionPage from './MatchingSelectionPage';
import { useParams } from 'react-router-dom';
import { SidebarRefreshContext } from '../core/SidebarRefreshContext';
import { useContext } from 'react';

const GamePage = () => {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const { id: gameId } = useParams();
  const { refresh } = useContext(SidebarRefreshContext);
  const handleQuestionAnswered = () => {
    refresh();
  };

  useEffect(() => {
    fetchGames().then(data => {
      let gamesArray = Array.isArray(data) ? data : (Array.isArray(data.games) ? data.games : []);
      const found = gamesArray.find(g => String(g.id) === String(gameId));
      setGame(found);
      setLoading(false);
      
      // Per i giochi memory o matching, recupera la domanda collegata
      if (found && (found.type === 'memory' || found.type === 'matching') && found.questionId) {
        fetchQuestions().then(questions => {
          const q = questions.find(q => String(q.id) === String(found.questionId));
          setQuestion(q);
        });
      }
    });
  }, [gameId]);

  if (loading) return <p>Caricamento gioco...</p>;
  if (!game) return <p>Gioco non trovato.</p>;

  if (game.type === 'quiz_selection') {
    return <QuizSelectionPage />;
  }
  if (game.type === 'memory_selection') {
    return <MemorySelectionPage />;
  }
  if (game.type === 'matching_selection') {
    return <MatchingSelectionPage />;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>{game.name}</h2>
      <p>Tipo: {game.type}</p>
      <p>Tema: {game.config?.theme}</p>
      {game.type === 'memory' && <p>Coppie: {game.config?.pairs}</p>}
      {game.type === 'matching' && <p>Abbinamenti: {game.config?.pairs}</p>}
      {game.type === 'quiz' && (
        <>
          <p>Tempo limite: {game.config?.timeLimit}s</p>
          <p>Domande: {game.questionCount || 0}</p>
        </>
      )}
      {/* Renderizza il gioco appropriato in base al tipo */}
      {game.type === 'memory' && question && (
        <MemoryGame config={game.config} pairs={question.pairs} onQuestionAnswered={handleQuestionAnswered} />
      )}
      {game.type === 'quiz' && (
        <QuizGame config={game.config} questionIds={game.questionIds} onQuestionAnswered={handleQuestionAnswered} />
      )}
      {game.type === 'matching' && question && (
        <MatchingGame config={game.config} pairs={question.pairs} onQuestionAnswered={handleQuestionAnswered} />
      )}
    </div>
  );
};

export default GamePage; 