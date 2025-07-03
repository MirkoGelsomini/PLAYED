import React from 'react';
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
const rightStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
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
              <button className="profile-btn" onClick={() => navigate('/profile')} title="Profilo">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="avatar-header" />
                ) : (
                  <FaUserCircle size={32} />
                )}
                <span className="profile-btn-text">{user?.name?.split(' ')[0] || 'Profilo'}</span>
              </button>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"><button className="main-btn">Login</button></Link>
              <Link to="/register"><button className="main-btn">Registrati</button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 