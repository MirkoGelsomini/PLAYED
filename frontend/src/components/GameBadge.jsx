import React from 'react';
import { Link } from 'react-router-dom';
import GlareHover from './GlareHover';

const badgeStyle = {
  background: 'var(--white-cloud)',
  borderRadius: 'var(--border-radius-large)',
  boxShadow: 'var(--shadow-soft)',
  padding: 'var(--spacing-xl) var(--spacing-l)',
  minWidth: '220px',
  maxWidth: '260px',
  position: 'relative',
  transition: 'var(--transition-fast)',
  border: '2px solid var(--green-leaf)',
};

const iconStyle = {
  width: '64px',
  height: '64px',
  marginBottom: 'var(--spacing-m)',
  objectFit: 'contain',
};

const iconContainerStyle = {
  width: '64px',
  height: '64px',
  marginBottom: 'var(--spacing-m)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2rem',
  fontWeight: 700,
  color: 'var(--white-cloud)',
};

const soonBadgeStyle = {
  position: 'absolute',
  top: 'var(--spacing-m)',
  right: 'var(--spacing-m)',
  background: 'var(--gradient-sun)',
  color: 'var(--gray-charcoal)',
  fontWeight: 700,
  fontSize: '0.85rem',
  borderRadius: 'var(--border-radius-small)',
  padding: 'var(--spacing-s) var(--spacing-l)',
  boxShadow: 'var(--shadow-soft)',
  zIndex: 2,
};

const playBtnStyle = {
  marginTop: 'var(--spacing-l)',
  background: 'var(--gradient-primary)',
  color: 'var(--white-cloud)',
  border: 'none',
  borderRadius: 'var(--border-radius-medium)',
  padding: 'var(--spacing-m) var(--spacing-xl)',
  fontWeight: 700,
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'var(--transition-fast)',
  textDecoration: 'none',
  position: 'relative',
  zIndex: 2,
  boxShadow: 'var(--shadow-soft)',
};

const solvedBadgeStyle = {
  position: 'absolute',
  top: 'var(--spacing-m)',
  right: 'var(--spacing-m)',
  background: 'linear-gradient(90deg, #4ade80, #22d3ee)',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.85rem',
  borderRadius: 'var(--border-radius-small)',
  padding: 'var(--spacing-s) var(--spacing-l)',
  boxShadow: 'var(--shadow-soft)',
  zIndex: 2,
};

const getGameIcon = (type, category) => {
  const iconConfigs = {
    memory: {
      icon: '🧠',
      background: 'var(--gradient-sky)',
    },
    memory_selection: {
      icon: '🧠',
      background: 'var(--gradient-sky)',
    },
    quiz: {
      icon: '❓',
      background: 'var(--gradient-sun)',
    },
    quiz_selection: {
      icon: '🎯',
      background: 'var(--gradient-sun)',
    },
    matching: {
      icon: '🔗',
      background: 'var(--gradient-primary)',
    },
    matching_selection: {
      icon: '🔗',
      background: 'var(--gradient-primary)',
    },
    sorting: {
      icon: '🔢',
      background: 'var(--gradient-earth)',
    },
  };

  return iconConfigs[type] || {
    icon: '🎮',
    background: 'var(--gradient-earth)',
  };
};

const GameBadge = ({ name, description, to, icon, soon, type, category, solved }) => {
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
      borderRadius="var(--border-radius-large)"
      borderColor="transparent"
      glareColor="var(--secondary-color)"
      glareOpacity={0.4}
      glareAngle={-30}
      glareSize={200}
      transitionDuration={1250}
      playOnce={false}
      style={badgeStyle}
    >
      {soon && <span style={soonBadgeStyle}>Prossimamente</span>}
      {solved && <span style={solvedBadgeStyle}>Risolto</span>}
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
      <h3 style={{ 
        margin: 'var(--spacing-s) 0 var(--spacing-xs) 0', 
        fontWeight: 700, 
        fontSize: '1.2rem', 
        color: 'var(--primary-color)' 
      }}>
        {name}
      </h3>
      <p style={{ 
        color: 'var(--gray-charcoal)', 
        fontSize: '1rem', 
        minHeight: '48px', 
        textAlign: 'center' 
      }}>
        {description}
      </p>
      {!soon && (
        <Link to={to} style={playBtnStyle}>
          {getButtonText()}
        </Link>
      )}
    </GlareHover>
  );
};

export default GameBadge; 