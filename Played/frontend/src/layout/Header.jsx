import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import Avatar from '../components/Avatar';
import logo from '../logo.png';
import '../styles/Auth.css';

const headerStyle = {
  background: 'var(--gradient-sky)',
  color: 'var(--white-cloud)',
  padding: 'var(--spacing-m) 0',
  fontFamily: 'var(--font-family)',
  boxShadow: 'var(--shadow-medium)',
};

const containerStyle = {
  maxWidth: '1100px',
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 var(--spacing-xl)',
};

const logoImgStyle = {
  height: '80px',
  width: 'auto',
  display: 'block',
};

const logoSectionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-l)',
  background: 'rgba(255,255,255,0.9)',
  border: '3px solid var(--secondary-color)',
  borderRadius: 'var(--border-radius-large)',
  padding: 'var(--spacing-s) var(--spacing-l)',
  boxShadow: 'var(--shadow-soft)',
};

const rightStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-m)',
  background: 'rgba(255,255,255,0.9)',
  border: '3px solid var(--secondary-color)',
  borderRadius: 'var(--border-radius-large)',
  padding: 'var(--spacing-s) var(--spacing-l)',
  boxShadow: 'var(--shadow-soft)',
};

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-xl)',
};




const buttonSeparatorStyle = {
  height: '28px',
  width: '2px',
  background: 'var(--green-leaf)',
  margin: '0 var(--spacing-s)',
  borderRadius: 'var(--spacing-xs)',
  alignSelf: 'center',
};

const navSeparatorStyle = {
  height: '22px',
  width: '2px',
  background: 'var(--secondary-color)',
  margin: '0 var(--spacing-s)',
  borderRadius: 'var(--spacing-xs)',
  alignSelf: 'center',
};


const profileBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-s)',
  background: 'none',
  border: 'none',
  color: 'var(--primary-color)',
  fontWeight: 700,
  fontSize: '1.05rem',
  cursor: 'pointer',
  padding: 'var(--spacing-s) var(--spacing-l)',
  borderRadius: 'var(--border-radius-small)',
  transition: 'var(--transition-fast)',
};

const dropdownStyle = {
  position: 'relative',
  display: 'inline-block',
};



const dropdownMenuStyle = {
  position: 'absolute',
  top: 'calc(100% + var(--spacing-s))',
  left: 0,
  minWidth: '160px',
  background: 'var(--white-cloud)',
  border: '3px solid var(--green-leaf)',
  borderRadius: 'var(--border-radius-medium)',
  boxShadow: 'var(--shadow-medium)',
  zIndex: 100,
  padding: 'var(--spacing-s) 0',
  marginTop: 'var(--spacing-s)',
  backdropFilter: 'blur(10px)',
  animation: 'dropdownFadeIn 0.2s ease-out',
};

const dropdownItemStyle = {
  color: 'var(--primary-color)',
  background: 'none',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '1.05rem',
  padding: 'var(--spacing-m) var(--spacing-l)',
  border: 'none',
  borderRadius: 'var(--border-radius-small)',
  display: 'block',
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'var(--transition-fast)',
  margin: 'var(--spacing-xs) var(--spacing-s)',
  position: 'relative',
};

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navMobileOpen, setNavMobileOpen] = useState(false);
  const [accountMobileOpen, setAccountMobileOpen] = useState(false);
  const [screenSize, setScreenSize] = useState(
    window.innerWidth <= 700 ? 'mobile' : window.innerWidth <= 1100 ? 'tablet' : 'desktop'
  );
  const dropdownRef = useRef();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Chiudi la tendina se clicchi fuori
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Responsive: aggiorna screenSize in tempo reale
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 700) setScreenSize('mobile');
      else if (width >= 700 && width <= 1100) setScreenSize('tablet');
      else setScreenSize('desktop');
      if (width > 700) {
        setNavMobileOpen(false);
        setAccountMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    // Esegui subito al mount
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Overlay per chiusura menu mobile
  const renderOverlay = (onClick) => (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.35)',
      zIndex: 1999,
    }} onClick={onClick}></div>
  );

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <div style={logoSectionStyle}>
          <Link to="/">
            <img src={logo} alt="Logo PLAYED" style={logoImgStyle} />
          </Link>
          {/* Desktop nav */}
          {screenSize === 'desktop' && (
            <nav style={navStyle} className="header-desktop-nav">
              {isAuthenticated && <Link to="/" className="nav-link">Home</Link>}
            {isAuthenticated && user?.role !== 'docente' && (
              <>    
              <span style={navSeparatorStyle}></span>
              <div style={dropdownStyle} ref={dropdownRef}>
                <button
                  className="dropdown-btn"
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                  onClick={() => setDropdownOpen((open) => !open)}
                  onBlur={e => setTimeout(() => setDropdownOpen(false), 120)}
                >
                  Giochi <span style={{fontSize: '1.1em'}}>▼</span>
                </button>
                {dropdownOpen && (
                  <div style={dropdownMenuStyle} role="menu">
                    <Link to="/memory-selection" className="nav-link" style={dropdownItemStyle} onClick={() => setDropdownOpen(false)} role="menuitem">Memory</Link>
                    <Link to="/quiz-selection" className="nav-link" style={dropdownItemStyle} onClick={() => setDropdownOpen(false)} role="menuitem">Quiz</Link>
                    <Link to="/matching-selection" className="nav-link" style={dropdownItemStyle} onClick={() => setDropdownOpen(false)} role="menuitem">Matching</Link>
                    <Link to="/sorting" className="nav-link" style={dropdownItemStyle} onClick={() => setDropdownOpen(false)} role="menuitem">Ordinamento</Link>
                  </div>
                )}
              </div>
              </>
            )}
              {isAuthenticated && user?.role !== 'docente' && (
                <>
                  <span style={navSeparatorStyle}></span>
                  <Link to="/results" className="nav-link">Risultati</Link>
                </>
              )}
              {isAuthenticated && user?.role === 'docente' && (
                <>
                  <span style={navSeparatorStyle}></span>
                  <Link to="/teacher-panel" className="nav-link">Pannello Docente</Link>
                </>
              )}
            </nav>
          )}
          {/* Tablet nav */}
          {screenSize === 'tablet' && (
            <nav style={{...navStyle, fontSize: '0.98rem', gap: '1.2rem'}} className="header-tablet-nav">
              {isAuthenticated && <Link to="/" className="nav-link">Home</Link>}
              {isAuthenticated && (
                <>
                  <div style={dropdownStyle} ref={dropdownRef}>
                    <button
                      className="dropdown-btn"
                      aria-haspopup="true"
                      aria-expanded={dropdownOpen}
                      onClick={() => setDropdownOpen((open) => !open)}
                      style={{ fontSize: '1rem', padding: '6px 12px' }}
                    >
                      Giochi <span style={{fontSize: '1.1em'}}>▼</span>
                    </button>
                    {dropdownOpen && (
                      <div style={dropdownMenuStyle} role="menu">
                        <Link to="/memory-selection" className="nav-link" style={dropdownItemStyle} onClick={() => setDropdownOpen(false)} role="menuitem">Memory</Link>
                        <Link to="/quiz-selection" className="nav-link" style={dropdownItemStyle} onClick={() => setDropdownOpen(false)} role="menuitem">Quiz</Link>
                        <Link to="/matching-selection" className="nav-link" style={dropdownItemStyle} onClick={() => setDropdownOpen(false)} role="menuitem">Matching</Link>
                        <Link to="/sorting" className="nav-link" style={dropdownItemStyle} onClick={() => setDropdownOpen(false)} role="menuitem">Ordinamento</Link>
                      </div>
                    )}
                  </div>
                  {user?.role !== 'docente' && (
                    <Link to="/results" className="nav-link">Risultati</Link>
                  )}
                  {user?.role === 'docente' && (
                    <Link to="/teacher-panel" className="nav-link">Pannello Docente</Link>
                  )}
                </>
              )}
            </nav>
          )}
          {/* Mobile nav hamburger */}
          {screenSize === 'mobile' && isAuthenticated && (
            <button className="header-hamburger" style={{ marginLeft: 16, background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', alignItems: 'center', color: 'var(--primary-color)' }} onClick={() => setNavMobileOpen(o => !o)} aria-label="Menu principale">
              <FaBars />
            </button>
          )}
        </div>
        {/* Desktop account */}
        {screenSize === 'desktop' && (
          <div style={rightStyle} className="header-desktop-account">
            {isAuthenticated ? (
              <>
                <button className="profile-btn" style={profileBtnStyle} onClick={() => navigate('/profile')} title="Profilo">
                  <Avatar 
                    avatar={user?.avatar} 
                    alt="Avatar" 
                    size="small"
                    className="header-avatar"
                  />
                  <span>{user?.name?.split(' ')[0] || 'Profilo'}</span>
                </button>
                <span style={buttonSeparatorStyle}></span>
                <button className="logout-btn main-btn" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login"><button className="main-btn">Login</button></Link>
                <span style={buttonSeparatorStyle}></span>
                <Link to="/register"><button className="main-btn">Registrati</button></Link>
              </>
            )}
          </div>
        )}
        {/* Tablet account */}
        {screenSize === 'tablet' && (
          <div style={{...rightStyle, fontSize: '0.98rem', gap: '1.2rem'}} className="header-tablet-account">
            {isAuthenticated ? (
              <>
                <button className="profile-btn" style={profileBtnStyle} onClick={() => navigate('/profile')} title="Profilo">
                  <Avatar 
                    avatar={user?.avatar} 
                    alt="Avatar" 
                    size="small"
                    className="header-avatar"
                  />
                  <span>{user?.name?.split(' ')[0] || 'Profilo'}</span>
                </button>
                <button className="logout-btn main-btn" onClick={handleLogout} style={{ fontSize: '1rem', padding: '6px 16px' }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login"><button className="main-btn" style={{ fontSize: '1rem', padding: '6px 16px' }}>Login</button></Link>
                <Link to="/register"><button className="main-btn" style={{ fontSize: '1rem', padding: '6px 16px' }}>Registrati</button></Link>
              </>
            )}
          </div>
        )}
        {/* Mobile account hamburger */}
        {screenSize === 'mobile' && (
          <button className="header-hamburger" style={{ marginLeft: 8, background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', alignItems: 'center', color: 'var(--primary-color)' }} onClick={() => setAccountMobileOpen(o => !o)} aria-label="Menu account">
            <FaUserCircle />
          </button>
        )}
      </div>
      {/* Mobile nav menu */}
      {navMobileOpen && screenSize === 'mobile' && (
        <>
          {renderOverlay(() => setNavMobileOpen(false))}
          <nav className="header-mobile-nav" style={{ position: 'fixed', top: 0, left: 0, width: 320, maxWidth: '90vw', height: '100vh', background: 'var(--white-cloud)', zIndex: 2001, boxShadow: 'var(--shadow-medium)', padding: 'var(--spacing-xl) 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, transition: 'left 0.2s' }}>
            <button style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 28, color: 'var(--primary-color)', cursor: 'pointer' }} onClick={() => setNavMobileOpen(false)} aria-label="Chiudi menu"><FaTimes /></button>
            {isAuthenticated && (
              <>
                <Link to="/" className="nav-link" onClick={() => setNavMobileOpen(false)}>Home</Link>
                <div style={{ position: 'relative', width: '100%', textAlign: 'center' }}>
                  <button className="dropdown-btn" style={{ width: '100%', background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 700, fontSize: '1.1rem', padding: 'var(--spacing-s) var(--spacing-l)', borderRadius: 'var(--border-radius-small)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={() => setDropdownOpen(o => !o)}>
                    Giochi <span style={{fontSize: '1.1em'}}>▼</span>
                  </button>
                  {dropdownOpen && (
                    <div style={{ ...dropdownMenuStyle, position: 'static', boxShadow: 'none', marginTop: 0, background: 'var(--gray-stone)' }} role="menu">
                      <Link to="/memory-selection" className="nav-link" style={dropdownItemStyle} onClick={() => { setDropdownOpen(false); setNavMobileOpen(false); }} role="menuitem">Memory</Link>
                      <Link to="/quiz-selection" className="nav-link" style={dropdownItemStyle} onClick={() => { setDropdownOpen(false); setNavMobileOpen(false); }} role="menuitem">Quiz</Link>
                      <Link to="/matching-selection" className="nav-link" style={dropdownItemStyle} onClick={() => { setDropdownOpen(false); setNavMobileOpen(false); }} role="menuitem">Matching</Link>
                      <Link to="/sorting" className="nav-link" style={dropdownItemStyle} onClick={() => { setDropdownOpen(false); setNavMobileOpen(false); }} role="menuitem">Ordinamento</Link>
                    </div>
                  )}
                </div>
                {user?.role !== 'docente' && (
                  <Link to="/results" className="nav-link" onClick={() => setNavMobileOpen(false)}>Risultati</Link>
                )}
                {user?.role === 'docente' && (
                  <Link to="/teacher-panel" className="nav-link" onClick={() => setNavMobileOpen(false)}>Pannello Docente</Link>
                )}
              </>
            )}
          </nav>
        </>
      )}
      {/* Mobile account menu */}
      {accountMobileOpen && screenSize === 'mobile' && (
        <>
          {renderOverlay(() => setAccountMobileOpen(false))}
          <div className="header-mobile-account" style={{ position: 'fixed', top: 0, right: 0, width: 320, maxWidth: '90vw', height: '100vh', background: 'var(--white-cloud)', zIndex: 2001, boxShadow: 'var(--shadow-medium)', padding: 'var(--spacing-xl) 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, transition: 'right 0.2s' }}>
            <button style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 28, color: 'var(--primary-color)', cursor: 'pointer' }} onClick={() => setAccountMobileOpen(false)} aria-label="Chiudi menu"><FaTimes /></button>
            {isAuthenticated ? (
              <>
                <button className="profile-btn" style={profileBtnStyle} onClick={() => { navigate('/profile'); setAccountMobileOpen(false); }} title="Profilo">
                  <Avatar 
                    avatar={user?.avatar} 
                    alt="Avatar" 
                    size="small"
                    className="header-avatar"
                  />
                  <span>{user?.name?.split(' ')[0] || 'Profilo'}</span>
                </button>
                <button className="logout-btn main-btn" onClick={() => { handleLogout(); setAccountMobileOpen(false); }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setAccountMobileOpen(false)}><button className="main-btn">Login</button></Link>
                <Link to="/register" onClick={() => setAccountMobileOpen(false)}><button className="main-btn">Registrati</button></Link>
              </>
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default Header; 