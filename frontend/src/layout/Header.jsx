import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';
import { FaUserCircle } from 'react-icons/fa';
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

const navLinkStyle = {
  color: 'var(--primary-color)',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '1.1rem',
  padding: 'var(--spacing-s) var(--spacing-l)',
  borderRadius: 'var(--border-radius-small)',
  transition: 'var(--transition-fast)',
  background: 'none',
};

const navLinkActiveStyle = {
  background: 'var(--gradient-primary)',
  color: 'var(--white-cloud)',
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

const avatarStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  objectFit: 'cover',
  marginRight: 'var(--spacing-s)',
  border: '2px solid var(--secondary-color)',
  background: 'var(--gradient-primary)',
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

const dropdownBtnStyle = {
  ...navLinkStyle,
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-s)',
  cursor: 'pointer',
  userSelect: 'none',
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
      </div>
    </header>
  );
};

export default Header; 