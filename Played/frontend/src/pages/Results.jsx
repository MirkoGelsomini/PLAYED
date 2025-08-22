import React, { useEffect, useState, useContext } from 'react';
import { useAuth } from '../core/AuthContext';
import axios from 'axios';
import { useErrorHandler } from '../utils/errorHandler';
import Avatar from '../components/Avatar';
import './Results.css';
import { SidebarRefreshContext } from '../core/SidebarRefreshContext';
import { toastSuccess, toastError, toastInfo } from '../utils/toast';

export default function Results() {
  const { user, isAuthenticated } = useAuth();
  const { handleComponentError } = useErrorHandler();
  const [stats, setStats] = useState(null);
  const [trophies, setTrophies] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [newTrophies, setNewTrophies] = useState([]);
  const [claimingReward, setClaimingReward] = useState(false);
  const { refreshToken } = useContext(SidebarRefreshContext);

  useEffect(() => {
    if (!isAuthenticated) return;
    console.log('=== DEBUG Results - useEffect triggered ===');
    loadAllData();
  }, [isAuthenticated]);

  // Ricarica quando arriva un refresh globale (es. domanda risolta)
  useEffect(() => {
    if (!isAuthenticated) return;
    loadAllData();
  }, [refreshToken, isAuthenticated]);

  // Rimosso: aggiornamento livello lato client per evitare incoerenze e chiamate PUT superflue

  const loadAllData = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('=== DEBUG Results - Caricamento dati ===');
      
      const [statsRes, trophiesRes, objectivesRes, leaderboardRes] = await Promise.all([
        axios.get('/api/trophy/stats', { withCredentials: true }),
        axios.get('/api/trophy/trophies', { withCredentials: true }),
        axios.get('/api/trophy/objectives', { withCredentials: true }),
        axios.get('/api/trophy/leaderboard?type=points&limit=10', { withCredentials: true })
      ]);

      console.log('Stats response:', statsRes.data);
      console.log('Trophies response:', trophiesRes.data);
      console.log('Objectives response:', objectivesRes.data);
      console.log('Leaderboard response:', leaderboardRes.data);

      setStats(statsRes.data.stats);
      setTrophies(trophiesRes.data.trophies);
      setObjectives(objectivesRes.data.objectives);
      setLeaderboard(leaderboardRes.data.leaderboard);
      
      console.log('Dati impostati nel state');
      console.log('Impostando loading a false...');
      setLoading(false);
      console.log('Loading impostato a false');
    } catch (err) {
      console.error('Errore nel caricamento dati Results:', err);
      setError('Errore nel caricamento dei dati');
      setLoading(false);
    }
  };

  const testModels = async () => {
    try {
      const res = await axios.get('/api/trophy/test', { withCredentials: true });
      toastInfo('🧪 Test completato! Controlla la console per i dettagli.');
    } catch (err) {
      console.error('Errore nel test:', err);
      toastError('Errore nel test: ' + err.message);
    }
  };

  const claimReward = async (objectiveId) => {
    setClaimingReward(true);
    try {
      const res = await axios.post('/api/trophy/claim-reward', 
        { objectiveId }, 
        { withCredentials: true }
      );
      
      if (res.data.success) {
        toastSuccess(`🎉 Ricompensa riscattata! Hai guadagnato ${res.data.pointsEarned} punti!`);
        loadAllData(); // Ricarica i dati per aggiornare le statistiche
      }
    } catch (err) {
      handleComponentError(err, setError, setClaimingReward);
      toastError('Errore nel riscatto della ricompensa: ' + (err.response?.data?.message || err.message));
    }
  };





  if (!isAuthenticated) {
    console.log('=== DEBUG Results - Rendering auth required ===');
    return (
      <div className="results-container">
        <div className="auth-required">
          <h2>🔐 Accesso Richiesto</h2>
          <p>Devi essere loggato per vedere i tuoi risultati e trofei!</p>
        </div>
      </div>
    );
  }

  if (user?.role === 'docente') {
    console.log('=== DEBUG Results - Rendering access denied for teacher ===');
    return (
      <div className="results-container">
        <div className="auth-required">
          <h2>🚫 Accesso Negato</h2>
          <p>I docenti non hanno accesso alla pagina dei risultati.</p>
          <p>Utilizza il <strong>Pannello Docente</strong> per gestire le tue domande.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    console.log('=== DEBUG Results - Rendering loading ===');
    return (
      <div className="results-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h2>Caricamento statistiche...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('=== DEBUG Results - Rendering error ===');
    return (
      <div className="results-container">
        <div className="error-state">
          <h2>❌ Errore</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={loadAllData} className="retry-btn">
              🔄 Riprova
            </button>
            <button onClick={testModels} className="test-btn">
              🧪 Test Modelli
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('=== DEBUG Results - Render ===');
  console.log('stats:', stats);
  console.log('trophies:', trophies);
  console.log('objectives:', objectives);
  console.log('leaderboard:', leaderboard);
  console.log('activeTab:', activeTab);

  const getRarityColor = (rarity) => {
    const colors = {
      common: '#6c757d',
      rare: '#007bff',
      epic: '#6f42c1',
      legendary: '#fd7e14',
      mythic: '#dc3545'
    };
    return colors[rarity] || colors.common;
  };

  const getRarityGlow = (rarity) => {
    const glows = {
      common: '0 0 5px rgba(108, 117, 125, 0.3)',
      rare: '0 0 10px rgba(0, 123, 255, 0.4)',
      epic: '0 0 15px rgba(111, 66, 193, 0.5)',
      legendary: '0 0 20px rgba(253, 126, 20, 0.6)',
      mythic: '0 0 25px rgba(220, 53, 69, 0.7)'
    };
    return glows[rarity] || glows.common;
  };

  console.log('=== DEBUG Results - Prima del return ===');
  console.log('stats è definito:', !!stats);
  console.log('trophies è definito:', !!trophies);
  console.log('objectives è definito:', !!objectives);
  console.log('leaderboard è definito:', !!leaderboard);

  return (
    <div className="results-container">
      {/* Notifica warning livello-punti */}
      {/* Notifica nuovi trofei */}
      {newTrophies.length > 0 && (
        <div className="trophy-notification">
          <h3>🎉 Nuovi Trofei Sbloccati!</h3>
          <div className="new-trophies">
            {newTrophies.map((trophy, index) => (
              <div key={index} className="new-trophy" style={{ borderColor: getRarityColor(trophy.rarity) }}>
                <span className="trophy-icon">{trophy.icon}</span>
                <div className="trophy-info">
                  <h4>{trophy.name}</h4>
                  <p>{trophy.description}</p>
                  <span className="trophy-points">+{trophy.points} punti</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header con statistiche principali */}
      <div className="results-header">
        <div className="user-info">
          <div className="user-avatar">
            <Avatar 
              avatar={user.avatar} 
              alt="Avatar" 
              size="xlarge"
              className="user-avatar-img"
            />
            <div className="user-level">
              <span className="level-number">{stats?.level || 1}</span>
            </div>
          </div>
          <div className="user-details">
            <h1>{user.name}</h1>
            <div className="user-stats">
              <span className="stat-item">
                <span className="stat-icon">⭐</span>
                {stats?.totalPoints || 0} punti totali
              </span>
              <span className="stat-item">
                <span className="stat-icon">🏆</span>
                {trophies.length} trofei
              </span>
              <span className="stat-item">
                <span className="stat-icon">🔥</span>
                {stats?.dailyStreak || 0} giorni consecutivi
              </span>
            </div>
          </div>
        </div>
        

      </div>

      {/* Navigation tabs */}
      <div className="results-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Panoramica
        </button>
        <button 
          className={`tab ${activeTab === 'trophies' ? 'active' : ''}`}
          onClick={() => setActiveTab('trophies')}
        >
          🏆 Trofei ({trophies.length})
        </button>
        <button 
          className={`tab ${activeTab === 'objectives' ? 'active' : ''}`}
          onClick={() => setActiveTab('objectives')}
        >
          🎯 Obiettivi ({objectives.filter(o => !o.isCompleted).length})
        </button>
        <button 
          className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          🏅 Classifica
        </button>
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Statistiche principali */}
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">🎮</div>
                <div className="stat-content">
                  <h3>Partite Completate</h3>
                  <p className="stat-value">{stats?.gamesCompleted || 0}</p>
                </div>
              </div>
              
              <div className="stat-card success">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <h3>Punteggio Medio</h3>
                  <p className="stat-value">{stats?.averageScore || 0}</p>
                </div>
              </div>
              
              <div className="stat-card warning">
                <div className="stat-icon">🏅</div>
                <div className="stat-content">
                  <h3>Punteggio Migliore</h3>
                  <p className="stat-value">{stats?.maxScore || 0}</p>
                </div>
              </div>
              
              <div className="stat-card info">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <h3>Gioco Preferito</h3>
                  <p className="stat-value">{stats?.bestGameType?.gameType || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Progresso settimanale e mensile */}
            <div className="progress-section">
              <div className="progress-card">
                <h3>📅 Progresso Settimanale</h3>
                <div className="progress-stats">
                  <div className="progress-item">
                    <span>Partite: {stats?.weeklyProgress?.games || 0}</span>
                  </div>
                  <div className="progress-item">
                    <span>Punteggio: {stats?.weeklyProgress?.totalScore || 0}</span>
                  </div>
                  <div className="progress-item">
                    <span>Media: {stats?.weeklyProgress?.averageScore || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="progress-card">
                <h3>📊 Progresso Mensile</h3>
                <div className="progress-stats">
                  <div className="progress-item">
                    <span>Partite: {stats?.monthlyProgress?.games || 0}</span>
                  </div>
                  <div className="progress-item">
                    <span>Punteggio: {stats?.monthlyProgress?.totalScore || 0}</span>
                  </div>
                  <div className="progress-item">
                    <span>Media: {stats?.monthlyProgress?.averageScore || 0}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'trophies' && (
          <div className="trophies-tab">
            <div className="trophy-info-section">
              <h3>🏆 Sistema di Trofei</h3>
              <div className="trophy-explanation">
                <p>
                  I trofei si sbloccano automaticamente quando raggiungi nuovi livelli! 
                  Ogni 100 punti totali guadagnati = 1 livello.
                </p>
              </div>
            </div>

            <div className="trophy-stats">
              <div className="trophy-summary">
                <h3>📊 Statistiche Trofei</h3>
                <div className="trophy-summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Completamento</span>
                    <span className="summary-value">{Math.round((trophies.length / 7) * 100)}%</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Punti Totali</span>
                    <span className="summary-value">{trophies.reduce((sum, t) => sum + t.points, 0)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Trofei Rari+</span>
                    <span className="summary-value">
                      {trophies.filter(t => ['rare', 'epic', 'legendary', 'mythic'].includes(t.rarity)).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="trophies-grid">
              {trophies.map((trophy, index) => (
                <div 
                  key={index} 
                  className="trophy-card"
                  style={{ 
                    borderColor: getRarityColor(trophy.rarity),
                    boxShadow: getRarityGlow(trophy.rarity)
                  }}
                >
                  <div className="trophy-header">
                    <span className="trophy-icon">{trophy.icon}</span>
                    <span className="trophy-rarity" style={{ color: getRarityColor(trophy.rarity) }}>
                      {trophy.rarity.toUpperCase()}
                    </span>
                  </div>
                  <div className="trophy-content">
                    <h4>{trophy.name}</h4>
                    <p>{trophy.description}</p>
                    <div className="trophy-meta">
                      <span className="trophy-points">+{trophy.points} punti</span>
                      <span className="trophy-date">
                        {new Date(trophy.unlockedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {trophies.length > 0 && trophies.length < 7 && (
              <div className="upcoming-trophies-section">
                <h3>🎯 Prossimi Trofei</h3>
                <div className="upcoming-trophies-grid">
                  {trophies.length < 1 && (
                    <div className="upcoming-trophy">
                      <span className="trophy-icon">🌱</span>
                      <div className="trophy-details">
                        <h5>Principiante</h5>
                        <p>Raggiungi il livello 5 (500 punti totali)</p>
                      </div>
                    </div>
                  )}
                  {trophies.length < 2 && (
                    <div className="upcoming-trophy">
                      <span className="trophy-icon">📚</span>
                      <div className="trophy-details">
                        <h5>Apprendista</h5>
                        <p>Raggiungi il livello 10 (1000 punti totali)</p>
                      </div>
                    </div>
                  )}
                  {trophies.length < 3 && (
                    <div className="upcoming-trophy">
                      <span className="trophy-icon">🎓</span>
                      <div className="trophy-details">
                        <h5>Esperto</h5>
                        <p>Raggiungi il livello 20 (2000 punti totali)</p>
                      </div>
                    </div>
                  )}
                  {trophies.length < 4 && (
                    <div className="upcoming-trophy">
                      <span className="trophy-icon">👑</span>
                      <div className="trophy-details">
                        <h5>Maestro</h5>
                        <p>Raggiungi il livello 35 (3500 punti totali)</p>
                      </div>
                    </div>
                  )}
                  {trophies.length < 5 && (
                    <div className="upcoming-trophy">
                      <span className="trophy-icon">💎</span>
                      <div className="trophy-details">
                        <h5>Gran Maestro</h5>
                        <p>Raggiungi il livello 50 (5000 punti totali)</p>
                      </div>
                    </div>
                  )}
                  {trophies.length < 6 && (
                    <div className="upcoming-trophy">
                      <span className="trophy-icon">🌟</span>
                      <div className="trophy-details">
                        <h5>Leggenda</h5>
                        <p>Raggiungi il livello 75 (7500 punti totali)</p>
                      </div>
                    </div>
                  )}
                  {trophies.length < 7 && (
                    <div className="upcoming-trophy">
                      <span className="trophy-icon">👻</span>
                      <div className="trophy-details">
                        <h5>Immortale</h5>
                        <p>Raggiungi il livello 100 (10000 punti totali)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {trophies.length === 0 && (
              <div className="empty-state">
                <h3>🏆 Nessun Trofeo Ancora</h3>
                <p>Inizia a giocare per sbloccare i tuoi primi trofei!</p>
                <p className="trophy-info">
                  I trofei si sbloccano automaticamente raggiungendo nuovi livelli!
                </p>
                <div className="upcoming-trophies">
                  <h4>🎯 Prossimi Trofei Disponibili:</h4>
                  <div className="upcoming-trophies-grid">
                    <div className="upcoming-trophy">
                      <span className="trophy-icon">🌱</span>
                      <div className="trophy-details">
                        <h5>Principiante</h5>
                        <p>Raggiungi il livello 5 (500 punti totali)</p>
                      </div>
                    </div>
                    <div className="upcoming-trophy">
                      <span className="trophy-icon">📚</span>
                      <div className="trophy-details">
                        <h5>Apprendista</h5>
                        <p>Raggiungi il livello 10 (1000 punti totali)</p>
                      </div>
                    </div>
                    <div className="upcoming-trophy">
                      <span className="trophy-icon">🎓</span>
                      <div className="trophy-details">
                        <h5>Esperto</h5>
                        <p>Raggiungi il livello 20 (2000 punti totali)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'objectives' && (
          <div className="objectives-tab">
            <div className="objectives-grid">
              {objectives.map((objective, index) => (
                <div 
                  key={index} 
                  className={`objective-card ${objective.isCompleted ? 'completed' : ''}`}
                >
                  <div className="objective-header">
                    <h4>{objective.title}</h4>
                    <span className={`difficulty-badge ${objective.difficulty}`}>
                      {objective.difficulty}
                    </span>
                  </div>
                  <p>{objective.description}</p>
                  <div className="objective-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${Math.min((objective.progress / objective.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {objective.progress} / {objective.target}
                    </span>
                  </div>
                  <div className="objective-reward">
                    <span className="reward-icon">🎁</span>
                    <span className="reward-text">
                      {objective.reward.type === 'points' ? `${objective.reward.value} punti` : objective.reward.value}
                    </span>
                    {objective.isCompleted && !objective.rewardClaimed && (
                      <button 
                        className="claim-reward-btn"
                        onClick={() => claimReward(objective._id)}
                        disabled={claimingReward}
                      >
                        {claimingReward ? '⏳ Riscattando...' : '💰 Riscatta Ricompensa'}
                      </button>
                    )}
                    {objective.isCompleted && objective.rewardClaimed && (
                      <div className="reward-claimed">
                        <span className="claimed-icon">✅</span>
                        <span className="claimed-text">Ricompensa Riscattata</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {objectives.length === 0 && (
              <div className="empty-state">
                <h3>🎯 Nessun Obiettivo Attivo</h3>
                <p>Controlla più tardi per nuovi obiettivi!</p>
                <p className="objective-info">
                  Gli obiettivi giornalieri si aggiornano automaticamente!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="leaderboard-tab">
            <div className="leaderboard-header">
              <h3>🏅 Classifica Globale</h3>
              <div className="leaderboard-filters">
                <button className="filter-btn active">Punti</button>
              </div>
            </div>
            
            <div className="leaderboard-list">
              {leaderboard.map((player, index) => (
                <div key={index} className={`leaderboard-item ${player._id === user.id ? 'current-user' : ''}`}>
                  <div className="rank">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div className="player-info">
                    <Avatar 
                      avatar={player.avatar} 
                      alt="Avatar" 
                      size="medium"
                      className="player-avatar"
                    />
                    <span className="player-name">{player.name || player.username}</span>
                  </div>
                  <div className="player-stats">
                    <span className="player-points">{player.totalPoints || 0} punti</span>
                    <span className="player-games">{player.gamesCompleted || 0} partite</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 