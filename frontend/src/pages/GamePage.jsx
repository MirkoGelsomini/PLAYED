import React, { useEffect, useState } from 'react';
import { fetchGames, fetchQuestions } from '../core/api';
import MemoryGame from '../games/Memory';
import { useParams } from 'react-router-dom';

const GamePage = () => {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const { id: gameId } = useParams();

  useEffect(() => {
    fetchGames().then(data => {
      const found = data.find(g => String(g.id) === String(gameId));
      setGame(found);
      setLoading(false);
      // Dopo aver trovato il gioco, recupera la domanda collegata
      fetchQuestions().then(questions => {
        const q = questions.find(q => String(q.id) === String(found?.questionId));
        setQuestion(q);
      });
    });
  }, [gameId]);

  if (loading) return <p>Caricamento gioco...</p>;
  if (!game) return <p>Gioco non trovato.</p>;

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>{game.name}</h2>
      <p>Tipo: {game.type}</p>
      <p>Tema: {game.config?.theme}</p>
      <p>Coppie: {game.config?.pairs}</p>
      {/* Passa le coppie della domanda a MemoryGame */}
      {game.type === 'memory' && question && (
        <MemoryGame config={game.config} pairs={question.pairs} />
      )}
    </div>
  );
};

export default GamePage; 