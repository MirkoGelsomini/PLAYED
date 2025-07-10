import React from 'react';
import { Link } from 'react-router-dom';
import GlareHover from './GlareHover';

const badgeStyle = {
  background: '#fff',
  borderRadius: '16px',
  boxShadow: '0 2px 12px 0 rgba(74,144,226,0.10)',
  padding: '1.5rem 1.2rem',
  minWidth: '220px',
  maxWidth: '260px',
  position: 'relative',
  transition: 'transform 0.15s',
};

const iconStyle = {
  width: '64px',
  height: '64px',
  marginBottom: '1rem',
  objectFit: 'contain',
};

const iconContainerStyle = {
  width: '64px',
  height: '64px',
  marginBottom: '1rem',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2rem',
  fontWeight: 700,
  color: '#fff',
};

const soonBadgeStyle = {
  position: 'absolute',
  top: '12px',
  right: '12px',
  background: '#F7C873',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.85rem',
  borderRadius: '8px',
  padding: '0.2em 0.7em',
  boxShadow: '0 1px 4px 0 rgba(0,0,0,0.08)',
  zIndex: 2,
};

const playBtnStyle = {
  marginTop: '1.2rem',
  background: 'linear-gradient(90deg, #83B3E9 0%, #4A90E2 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '0.6em 1.5em',
  fontWeight: 700,
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'background 0.2s',
  textDecoration: 'none',
  position: 'relative',
  zIndex: 2,
};

const getGameIcon = (type, category) => {
  const iconConfigs = {
    memory: {
      icon: '🧠',
      background: 'linear-gradient(135deg, #4A90E2, #83B3E9)',
    },
    memory_selection: {
      icon: '🧠',
      background: 'linear-gradient(135deg, #4A90E2, #83B3E9)',
    },
    quiz: {
      icon: '❓',
      background: 'linear-gradient(135deg, #F7C873, #FFD700)',
    },
    quiz_selection: {
      icon: '🎯',
      background: 'linear-gradient(135deg, #F7C873, #FFD700)',
    },
    matching: {
      icon: '🔗',
      background: 'linear-gradient(135deg, #4AE290, #6BCF7F)',
    },
    matching_selection: {
      icon: '🔗',
      background: 'linear-gradient(135deg, #4AE290, #6BCF7F)',
    },
  };

  return iconConfigs[type] || {
    icon: '🎮',
    background: 'linear-gradient(135deg, #F7C873, #FFD700)',
  };
};

const GameBadge = ({ name, description, to, icon, soon, type, category }) => {
  const gameIcon = getGameIcon(type, category);

  const getButtonText = () => {
    if (type === 'quiz_selection' || type === 'memory_selection') {
      return 'Scegli';
    }
    return 'Gioca';
  };

  return (
    <GlareHover
      width="100%"
      height="100%"
      background="transparent"
      borderRadius="16px"
      borderColor="transparent"
      glareColor="#83B3E9"
      glareOpacity={0.4}
      glareAngle={-30}
      glareSize={200}
      transitionDuration={1250}
      playOnce={false}
      style={badgeStyle}
    >
      {soon && <span style={soonBadgeStyle}>Prossimamente</span>}
      {icon ? (
        <img src={icon} alt={name} style={iconStyle} />
      ) : (
        <div style={{
          ...iconContainerStyle,
          background: gameIcon.background,
        }}>
          {gameIcon.icon}
        </div>
      )}
      <h3 style={{ margin: '0.5rem 0 0.3rem 0', fontWeight: 700, fontSize: '1.2rem', color: '#4A90E2' }}>{name}</h3>
      <p style={{ color: '#555', fontSize: '1rem', minHeight: '48px', textAlign: 'center' }}>{description}</p>
      {!soon && (
        <Link to={to} style={playBtnStyle}>
          {getButtonText()}
        </Link>
      )}
    </GlareHover>
  );
};

export default GameBadge; 