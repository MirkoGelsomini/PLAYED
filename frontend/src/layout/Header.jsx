import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';
import { FaUserCircle } from 'react-icons/fa';
import logo from '../logo.png';
import '../styles/Auth.css';

const headerStyle = {
  background: '#83B3E9',
  color: '#fff',
  padding: '1rem 0',
  fontFamily: 'Nunito, Arial, sans-serif',
  boxShadow: '0 2px 8px 0 rgba(74,144,226,0.10)',
};
const containerStyle = {
  maxWidth: '1100px',
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 2rem',
};
const logoImgStyle = {
  height: '80px',
  width: 'auto',
  display: 'block',
};
const logoSectionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.2rem',
  background: 'rgba(255,255,255,0.85)',
  border: '2px solid #83B3E9',
  borderRadius: '16px',
  padding: '0.4rem 1.2rem',
  boxShadow: '0 2px 8px 0 rgba(74,144,226,0.08)',
};
const rightStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  background: 'rgba(255,255,255,0.85)',
  border: '2px solid #83B3E9',
  borderRadius: '16px',
  padding: '0.4rem 1.2rem',
  boxShadow: '0 2px 8px 0 rgba(74,144,226,0.08)',
};
const navStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
};
const navLinkStyle = {
  color: '#2560A8',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '1.1rem',
  padding: '0.2em 0.7em',
  borderRadius: '6px',
  transition: 'background 0.15s, color 0.15s',
  background: 'none',
};
const navLinkActiveStyle = {
  background: '#EAF3FB',
  color: '#4A90E2',
};
const buttonSeparatorStyle = {
  height: '28px',
  width: '1.5px',
  background: '#E0E7EF',
  margin: '0 0.5rem',
  borderRadius: '2px',
  alignSelf: 'center',
};
const navSeparatorStyle = {
  height: '22px',
  width: '1.5px',
  background: '#83B3E9',
  margin: '0 0.5rem',
  borderRadius: '2px',
  alignSelf: 'center',
};
const avatarStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  objectFit: 'cover',
  marginRight: '0.5rem',
  border: '2px solid #83B3E9',
  background: '#EAF3FB',
};
const profileBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
  background: 'none',
  border: 'none',
  color: '#2560A8',
  fontWeight: 700,
  fontSize: '1.05rem',
  cursor: 'pointer',
  padding: '0.2em 0.7em',
  borderRadius: '8px',
  transition: 'background 0.15s',
};

const dropdownStyle = {
  position: 'relative',
  display: 'inline-block',
};
const dropdownBtnStyle = {
  ...navLinkStyle,
  display: 'flex',
  alignItems: 'center',
  gap: '0.3em',
  cursor: 'pointer',
  userSelect: 'none',
};
const dropdownMenuStyle = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: 0,
  minWidth: '160px',
  background: '#fff',
  border: '2px solid #83B3E9',
  borderRadius: '12px',
  boxShadow: '0 8px 32px 0 rgba(74,144,226,0.18)',
  zIndex: 100,
  padding: '0.5em 0',
  marginTop: '2px',
  backdropFilter: 'blur(10px)',
  animation: 'dropdownFadeIn 0.2s ease-out',
};
const dropdownItemStyle = {
  color: '#2560A8',
  background: 'none',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '1.05rem',
  padding: '0.6em 1.2em',
  border: 'none',
  borderRadius: '8px',
  display: 'block',
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  margin: '0.1em 0.3em',
  position: 'relative',
};

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Chiudi la tendina se clicchi fuori
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <div style={logoSectionStyle}>
          <Link to="/">
            <img src={logo} alt="Logo PLAYED" style={logoImgStyle} />
          </Link>
          <nav style={navStyle}>
            <Link to="/" className="nav-link">Home</Link>
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
                </div>
              )}
            </div>
            <span style={navSeparatorStyle}></span>
            <Link to="/results" className="nav-link">Risultati</Link>
          </nav>
        </div>
        <div style={rightStyle}>
          {isAuthenticated ? (
            <>
              <button className="profile-btn" style={profileBtnStyle} onClick={() => navigate('/profile')} title="Profilo">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" style={avatarStyle} />
                ) : (
                  <FaUserCircle size={32} style={{ marginRight: '0.5rem', color: '#83B3E9' }} />
                )}
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
      </div>
    </header>
  );
};

export default Header; 