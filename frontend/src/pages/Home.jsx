import React, { useEffect, useState, useRef, useContext } from 'react';
import { fetchGames, fetchQuestions, fetchDetailedProgress } from '../core/api';
import { Link } from 'react-router-dom';
import GameBadge from '../components/GameBadge';
import ProgressCard from '../components/ProgressCard';
import '../styles/main.css';
import RotatingText from '../components/RotatingText'
import { useAuth } from '../core/AuthContext';
import SidebarSuggerimenti from '../components/SidebarSuggerimenti';
import axios from 'axios';
import { SidebarRefreshContext } from '../core/SidebarRefreshContext';


const heroStyle = {
  background: 'var(--gradient-sky)',
  color: 'var(--white-cloud)',
  padding: '2.5rem 1rem 2rem 1rem',
  borderRadius: 'var(--border-radius-large)',
  margin: '2rem auto 2.5rem auto',
  maxWidth: '700px',
  maxHeight: '100px',
  boxShadow: 'var(--shadow-medium)',
  border: '3px solid var(--green-leaf)',
};

const gamesSectionStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '2rem',
  justifyContent: 'center',
  margin: '2rem 0',
};

const Home = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [detailedProgress, setDetailedProgress] = useState({});
  const [progressLoading, setProgressLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const { refreshToken } = useContext(SidebarRefreshContext);
  const mainRef = useRef();
  const [sidebarHidden, setSidebarHidden] = useState(true); 

  useEffect(() => {
    fetchGames().then(data => {
      let filteredGames = [];
      if (Array.isArray(data)) {
        filteredGames = data.filter(game => 
          game.type === 'quiz_selection' || game.type === 'memory_selection' || game.type === 'matching_selection' || game.type === 'sorting_selection'
        );
      } else if (data && Array.isArray(data.games)) {
        filteredGames = data.games.filter(game => 
          game.type === 'quiz_selection' || game.type === 'memory_selection' ||  game.type === 'matching_selection' || game.type === 'sorting_selection'
        );
      }
      setGames(filteredGames);
      setLoading(false);
    }).catch(err => {
      console.error('Errore nel caricamento giochi:', err);
      setGames([]);
      setLoading(false);
    });
    
    // Carica domande filtrate per età
    fetchQuestions().then(setQuestions).catch(err => {
      console.error('Errore nel caricamento domande:', err);
      setQuestions([]); // Imposta array vuoto se non ci sono domande disponibili
    });
  }, []);

  // Carica i progressi dettagliati
  const loadDetailedProgress = async () => {
    try {
      const progress = await fetchDetailedProgress();
      setDetailedProgress(progress);
    } catch (error) {
      console.error('Errore nel caricamento progressi dettagliati:', error);
    } finally {
      setProgressLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role !== 'docente') {
      loadDetailedProgress();
      
      // Refresh automatico ogni 30 secondi
      const interval = setInterval(loadDetailedProgress, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.role]);

  // Ricarica progressi quando arriva un refresh globale (es. domanda risolta)
  useEffect(() => {
    if (!isAuthenticated || user?.role === 'docente') return;
    loadDetailedProgress();
  }, [refreshToken, isAuthenticated, user?.role]);

  useEffect(() => {
    const handler = (e) => {
      if (mainRef.current) {
        if (e.detail.hidden) {
          mainRef.current.style.marginRight = '0px';
        } else {
          mainRef.current.style.marginRight = `${e.detail.width}px`;
        }
      }
    };
    window.addEventListener('sidebar-width', handler);
    return () => window.removeEventListener('sidebar-width', handler);
  }, []);

  if (!isAuthenticated) {
    return <PublicHome />;
  }

  // Se l'utente è un docente, mostra la TeacherHome
  if (user?.role === 'docente') {
    return <TeacherHome user={user} />;
  }

  return (
    <div ref={mainRef} className="with-sidebar-right" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', transition: 'margin-right 0.2s', padding: '0.5rem 1rem 2rem' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <section style={heroStyle}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 800 }}>        
            <RotatingText
            texts={['Benvenuto su Played!', 'Scopri giochi didattici', 'Metti alla prova la tua memoria', 'Divertiti imparando!']}
            mainClassName="px-3 py-2 bg-gradient-to-r from-amber-300 via-orange-400 to-pink-400 text-gray-800 overflow-hidden rounded-lg shadow-md border border-orange-200"
            staggerFrom={"first"}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            staggerDuration={0.05}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            rotationInterval={4000}
          /></h1>
        </section>

        {/* Sezione Progressi */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ textAlign: 'center', margin: '2rem 0 1.5rem 0', fontWeight: 700, color: '#1f2937' }}>
            I tuoi Progressi
          </h2>
          {progressLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Caricamento progressi...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {Object.keys(detailedProgress).map(gameType => (
                <ProgressCard
                  key={gameType}
                  gameType={gameType}
                  progressData={detailedProgress[gameType]}
                  onLevelUnlocked={loadDetailedProgress}
                />
              ))}
            </div>
          )}
        </section>

        <h2 style={{ textAlign: 'center', margin: '2rem 0 1rem 0', fontWeight: 700 }}>Giochi disponibili</h2>
        {loading ? (
          <p style={{ textAlign: 'center' }}>Caricamento giochi...</p>
        ) : (
          <div style={gamesSectionStyle}>
            {games.length === 0 ? (
              <div style={{ color: '#888', fontSize: '1.2rem' }}>Nessun gioco disponibile.</div>
            ) : (
              games.map((game, idx) => (
                <GameBadge
                  key={game.id || idx}
                  name={game.name || 'Gioco senza nome'}
                  description={game.description || 'Descrizione non disponibile.'}
                  to={`/game/${game.id}`}
                  icon={game.icon || undefined}
                  soon={game.soon}
                  type={game.type}
                  category={game.category}
                />
              ))
            )}
          </div>
        )}
      </div>
      {/* Sidebar: mostra solo il bottone se hidden, altrimenti la sidebar */}
      {sidebarHidden ? (
        <button className="ss-float-btn-fixed" onClick={() => setSidebarHidden(false)} title="Domande consigliate" style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1001 }}>
          💡
        </button>
      ) : (
        <SidebarSuggerimenti onHide={() => {
          setSidebarHidden(true);
          if (mainRef.current) mainRef.current.style.marginRight = '0px';
        }} />
      )}
    </div>
  );
};

// Home dedicata per i docenti
const TeacherHome = ({ user }) => {
  const [teacherStats, setTeacherStats] = useState({
    totalQuestions: 0,
    approvedQuestions: 0,
    pendingQuestions: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentQuestions, setRecentQuestions] = useState([]);

  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    try {
      const response = await axios.get('/api/questions/teacher');
      const questions = response.data.data || [];
      
      setTeacherStats({
        totalQuestions: questions.length,
        approvedQuestions: questions.filter(q => q.approved).length,
        pendingQuestions: questions.filter(q => !q.approved).length
      });
      
      // Mostra le ultime 5 domande create
      setRecentQuestions(questions.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Errore nel caricamento dati docente:', error);
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Hero Section per Docenti */}
      <section style={{
        ...heroStyle,
        background: 'var(--gradient-primary)',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 800 }}>
          Benvenuto, Prof. {user.name}! 👨‍🏫
        </h1>
      </section>

      {/* Statistiche Rapide */}
      <section style={{ margin: '2rem 0' }}>
        <h2 style={{ textAlign: 'center', margin: '2rem 0 1.5rem 0', fontWeight: 700, color: '#1f2937' }}>
          Le tue Statistiche
        </h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Caricamento statistiche...</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1.5rem', 
            marginBottom: '2rem' 
          }}>
            <div style={{
              background: 'var(--gradient-sky)',
              color: 'var(--gray-charcoal)',
              padding: '1.5rem',
              borderRadius: 'var(--border-radius-large)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-medium)'
            }}>
              <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>📝</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{teacherStats.totalQuestions}</p>
              <p style={{ margin: '0.5rem 0 0 0' }}>Domande Totali</p>
            </div>
            
            <div style={{
              background: 'var(--gradient-success)',
              color: 'var(--gray-charcoal)',
              padding: '1.5rem',
              borderRadius: 'var(--border-radius-large)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-medium)'
            }}>
              <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>✅</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{teacherStats.approvedQuestions}</p>
              <p style={{ margin: '0.5rem 0 0 0' }}>Domande Approvate</p>
            </div>
            
            <div style={{
              background: 'var(--gradient-warning)',
              color: 'var(--gray-charcoal)',
              padding: '1.5rem',
              borderRadius: 'var(--border-radius-large)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-medium)'
            }}>
              <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>⏳</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{teacherStats.pendingQuestions}</p>
              <p style={{ margin: '0.5rem 0 0 0' }}>In Attesa di Approvazione</p>
            </div>
          </div>
        )}
      </section>

      {/* Azioni Rapide */}
      <section style={{ margin: '3rem 0' }}>
        <h2 style={{ textAlign: 'center', margin: '2rem 0 1.5rem 0', fontWeight: 700, color: '#1f2937' }}>
          Azioni Rapide
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          <Link to="/teacher-panel" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--white-cloud)',
              border: '3px solid var(--primary-color)',
              borderRadius: 'var(--border-radius-large)',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              boxShadow: 'var(--shadow-soft)'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <h3 style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>🎯</h3>
              <h4 style={{ color: 'var(--primary-color)', margin: '0 0 1rem 0', fontSize: '1.3rem' }}>
                Pannello Docente
              </h4>
              <p style={{ color: 'var(--text-color)', margin: 0 }}>
                Crea nuove domande con SAGE e gestisci quelle esistenti
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Domande Recenti */}
      {recentQuestions.length > 0 && (
        <section style={{ margin: '3rem 0' }}>
          <h2 style={{ textAlign: 'center', margin: '2rem 0 1.5rem 0', fontWeight: 700, color: '#1f2937' }}>
            Ultime Domande Create
          </h2>
          <div style={{
            background: 'var(--white-cloud)',
            border: '2px solid var(--gray-light)',
            borderRadius: 'var(--border-radius-large)',
            padding: '1.5rem'
          }}>
            {recentQuestions.map((question, index) => (
              <div key={question._id || index} style={{
                padding: '1rem',
                borderBottom: index < recentQuestions.length - 1 ? '1px solid var(--gray-light)' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>
                    {question.type} - {question.category}
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-color)', fontSize: '0.9rem' }}>
                    {question.question?.substring(0, 100)}...
                  </p>
                </div>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--border-radius-small)',
                  background: question.approved ? 'var(--success-color)' : 'var(--warning-color)',
                  color: 'var(--white-cloud)',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap'
                }}>
                  {question.approved ? '✓ Approvata' : '⏳ In attesa'}
                </div>
              </div>
            ))}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/teacher-panel" style={{
                color: 'var(--primary-color)',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}>
                Vedi tutte le domande →
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

// Home pubblica per utenti non autenticati
const PublicHome = () => (
  <div style={{ background: '#fff', minHeight: '100vh', padding: '0', margin: 0 }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '3rem' }}>
      <img src={require('../logo.png')} alt="Played Logo" style={{ width: 120, marginBottom: 24, filter: 'drop-shadow(0 2px 8px #b3e5fc)' }} />
      <h1 className="text-natural-primary animate-natural-bounce" style={{ fontWeight: 900, fontSize: '2.7rem', marginBottom: 8 }}>Benvenuto su Played!</h1>
      <p className="text-natural-sky" style={{ fontSize: '1.2rem', marginBottom: 24, maxWidth: 500 }}>
        La piattaforma di giochi didattici dove imparare è un'avventura!<br/>
        <span style={{ fontWeight: 600 }}>Gioca, impara, conquista trofei e divertiti con la community.</span>
      </p>
      <div className="natural-card animate-natural-fade-in" style={{ marginBottom: 32, maxWidth: 420 }}>
        <p style={{ fontSize: '1.1rem', marginBottom: 12 }}>Per accedere ai giochi e alle funzionalità, effettua il <Link to="/login">login</Link> o <Link to="/register">registrati</Link>.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <img src={process.env.PUBLIC_URL + '/avatar/cat.png'} alt="Avatar Cat" style={{ width: 48, borderRadius: '50%' }} />
          <img src={process.env.PUBLIC_URL + '/avatar/dog.png'} alt="Avatar Dog" style={{ width: 48, borderRadius: '50%' }} />
          <img src={process.env.PUBLIC_URL + '/avatar/fox.png'} alt="Avatar Fox" style={{ width: 48, borderRadius: '50%' }} />
          <img src={process.env.PUBLIC_URL + '/avatar/lion.png'} alt="Avatar Lion" style={{ width: 48, borderRadius: '50%' }} />
          <img src={process.env.PUBLIC_URL + '/avatar/panda.png'} alt="Avatar Panda" style={{ width: 48, borderRadius: '50%' }} />
        </div>
      </div>
      <div className="natural-card animate-natural-fade-in" style={{ background: 'var(--gradient-sun)', color: 'var(--brown-wood)', maxWidth: 420, marginBottom: 32 }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: 8 }}>Perché scegliere Played?</h2>
        <ul style={{ textAlign: 'left', fontSize: '1.05rem', margin: 0, paddingLeft: 24 }}>
          <li>🎮 Giochi originali per allenare memoria e logica</li>
          <li>🏆 Sistema di trofei e obiettivi</li>
          <li>📈 Statistiche e progressi personali</li>
          <li>👥 Community e classifiche</li>
          <li>🌱 Crescita personale divertendosi</li>
        </ul>
      </div>
    </div>
  </div>
);

export default Home;