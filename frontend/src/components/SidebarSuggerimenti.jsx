import React, { useEffect, useState, useContext, useRef } from 'react';
import { fetchQuestionProgressAndSuggestions } from '../core/api';
import { Link } from 'react-router-dom';
import './SidebarSuggerimenti.css';
import { SidebarRefreshContext } from '../core/SidebarRefreshContext';

const MATERIE = [
  { key: 'quiz', label: 'Quiz' },
  { key: 'memory', label: 'Memory' },
  { key: 'matching', label: 'Matching' }
];

const MIN_WIDTH = 260;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 320;

const SidebarSuggerimenti = ({ onHide }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { refreshToken } = useContext(SidebarRefreshContext);
  const [hidden, setHidden] = useState(false);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [resizing, setResizing] = useState(false);
  const sidebarRef = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_WIDTH);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      let allSuggestions = [];
      try {
        for (const materia of MATERIE) {
          const res = await fetchQuestionProgressAndSuggestions(materia.key);
          if (res.suggestions && res.suggestions.length > 0) {
            allSuggestions.push(...res.suggestions.map(q => ({ ...q, materia: materia.label, gameType: materia.key }))); 
          }
        }
        setSuggestions(allSuggestions);
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    };
    load();
  }, [refreshToken]);

  // Resize handlers
  const handleMouseDown = (e) => {
    setResizing(true);
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.userSelect = 'none';
  };
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizing) return;
      let newWidth = startWidth.current - (e.clientX - startX.current);
      newWidth = Math.max(MIN_WIDTH, Math.min(newWidth, MAX_WIDTH));
      setWidth(newWidth);
      window.dispatchEvent(new CustomEvent('sidebar-width', { detail: { width: newWidth, hidden } }));
    };
    const handleMouseUp = () => {
      setResizing(false);
      document.body.style.userSelect = '';
    };
    if (resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, hidden]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sidebar-width', { detail: { width: hidden ? 0 : width, hidden } }));
  }, [width, hidden]);

  const isMobile = window.innerWidth < 700;

  if (hidden) {
    return (
      <button className="ss-float-btn-fixed" onClick={() => setHidden(false)} title="Show suggestions">
        💡
      </button>
    );
  }

  return (
    <aside
      className={`sidebar-suggerimenti fixed${isMobile ? ' mobile' : ''}`}
      ref={sidebarRef}
      style={{ width: width, minWidth: MIN_WIDTH, maxWidth: MAX_WIDTH, right: 0, top: 0, height: '100vh', position: 'fixed', zIndex: 1000, boxShadow: '0 0 24px rgba(0,0,0,0.13)' }}
    >
      {!isMobile && (
        <div className="ss-resize-handle" onMouseDown={handleMouseDown} title="Ridimensiona" />
      )}
      <div className="ss-header-beauty">
        <span className="ss-header-icon">💡</span>
        <span className="ss-header-title">Domande Consigliate</span>
        <button className="ss-hide-btn-beauty" onClick={() => onHide ? onHide() : setHidden(true)} title="Nascondi">×</button>
      </div>
      {loading && <div className="ss-loading">Caricamento...</div>}
      {error && <div className="ss-error">{error}</div>}
      {!loading && !error && (
        <ul className="ss-sugg-list-beauty">
          {suggestions.length === 0 && <li className="ss-sugg-empty">Nessun suggerimento al momento.</li>}
          {suggestions.map((q, idx) => (
            <li key={q.id + '-' + idx} className="ss-sugg-badge">
              <Link to={`/game/${q.gameType}_${q.category}?questionId=${q.id}`} className="ss-sugg-link-beauty">
                <div className="ss-sugg-header">
                  <span className="ss-sugg-materia-badge">{q.materia}</span>
                  <span className="ss-sugg-level-badge">Livello {q.difficulty}</span>
                </div>
                <span className="ss-sugg-question">{q.question}</span>
                <span className="ss-sugg-hint">💡 Per completare il livello corrente</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default SidebarSuggerimenti; 