import React, { useEffect, useState } from 'react';
import { useAuth } from '../core/AuthContext';
import axios from 'axios';
import './Results.css';

export default function Results() {
  const { user, isAuthenticated } = useAuth();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    axios.get('/api/progress', { withCredentials: true })
      .then(res => setProgress(res.data))
      .catch(() => setError('Errore nel recupero dei progressi'))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <div className="results-container"><h2>Devi essere loggato per vedere i risultati!</h2></div>;
  }

  if (loading) return <div className="results-container"><h2>Caricamento statistiche...</h2></div>;
  if (error) return <div className="results-container"><h2>{error}</h2></div>;

  // Statistiche inventate e placeholder
  const totalGames = progress.length;
  const completedGames = progress.filter(p => p.completed).length;
  const bestScore = Math.max(...progress.map(p => p.score), 0);
  const gamesByType = progress.reduce((acc, p) => {
    acc[p.game] = (acc[p.game] || 0) + 1;
    return acc;
  }, {});
  const lastGames = progress.slice(0, 5);

  return (
    <div className="results-container">
      <h1>Statistiche Giocatore</h1>
      <div className="results-summary">
        <div className="results-card">
          <h3>Giochi completati</h3>
          <p>{completedGames} / {totalGames}</p>
        </div>
        <div className="results-card">
          <h3>Punteggio migliore</h3>
          <p>{bestScore}</p>
        </div>
        <div className="results-card">
          <h3>Tipi di giochi provati</h3>
          <ul>
            {Object.entries(gamesByType).map(([game, count]) => (
              <li key={game}>{game}: {count}</li>
            ))}
          </ul>
        </div>
        <div className="results-card">
          <h3>Badge</h3>
          <div className="badge-list">
            {/* Badge inventati */}
            {completedGames >= 10 && <span className="badge">Veterano 🎖️</span>}
            {bestScore >= 100 && <span className="badge">Top Scorer 🏆</span>}
            {Object.keys(gamesByType).length >= 3 && <span className="badge">Poliedrico 🧠</span>}
            {completedGames === 0 && <span className="badge">Inizia la tua avventura!</span>}
          </div>
        </div>
      </div>
      <h2>Storico ultime partite</h2>
      <table className="results-table">
        <thead>
          <tr>
            <th>Gioco</th>
            <th>Punteggio</th>
            <th>Livello</th>
            <th>Completato</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {lastGames.map((p, i) => (
            <tr key={i}>
              <td>{p.game}</td>
              <td>{p.score}</td>
              <td>{p.level}</td>
              <td>{p.completed ? 'Sì' : 'No'}</td>
              <td>{new Date(p.date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="results-future">
        <h3>Prossimi obiettivi</h3>
        <ul>
          <li>Completa 20 giochi per sbloccare il badge "Maratoneta" 🥇</li>
          <li>Ottieni 200 punti in un singolo gioco per il badge "Campione" 🥈</li>
          <li>Prova tutti i tipi di giochi per il badge "Esploratore" 🧭</li>
        </ul>
      </div>
    </div>
  );
} 