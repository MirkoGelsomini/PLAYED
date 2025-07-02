import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';
import { FaUserCircle } from 'react-icons/fa';
import logo from '../logo.png';

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
const rightStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};
const buttonStyle = {
  background: 'linear-gradient(90deg, #4A90E2 5%, #F5A623 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: '20px',
  padding: '0.5rem 1.2rem',
  fontSize: '1rem',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 2px 8px 0 rgba(74,144,226,0.10)',
  transition: 'background 0.2s, transform 0.1s',
};
const profileBtnStyle = {
  ...buttonStyle,
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: '#fff',
  color: '#4A90E2',
  border: '2px solid #4A90E2',
};

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <Link to="/">
          <img src={logo} alt="Logo PLAYED" style={logoImgStyle} />
        </Link>
        <div style={rightStyle}>
          {isAuthenticated ? (
            <>
              <button style={profileBtnStyle} onClick={() => navigate('/profile')} title="Profilo">
                <FaUserCircle size={22} />
                <span style={{ fontWeight: 700 }}>{user?.name?.split(' ')[0] || 'Profilo'}</span>
              </button>
              <button style={buttonStyle} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"><button style={buttonStyle}>Login</button></Link>
              <Link to="/register"><button style={buttonStyle}>Registrati</button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 