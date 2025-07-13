import React, { useState, useEffect } from 'react';
import './TrophyNotification.css';

const TrophyNotification = ({ trophies, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [currentTrophy, setCurrentTrophy] = useState(0);

  useEffect(() => {
    if (trophies && trophies.length > 0) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          onClose();
        }, 500);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [trophies, onClose]);

  useEffect(() => {
    if (trophies && trophies.length > 1) {
      const interval = setInterval(() => {
        setCurrentTrophy(prev => (prev + 1) % trophies.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [trophies]);

  if (!trophies || trophies.length === 0) return null;

  const getRarityColor = (rarity) => {
    const colors = {
      common: '#6c757d',
      rare: '#007bff',
      epic: '#6f42c1',
      legendary: '#fd7e14',
      mythic: '#dc3545'
    };
    return colors[rarity] || '#6c757d';
  };

  const getRarityGlow = (rarity) => {
    const glows = {
      common: '0 0 10px rgba(108, 117, 125, 0.3)',
      rare: '0 0 15px rgba(0, 123, 255, 0.4)',
      epic: '0 0 20px rgba(111, 66, 193, 0.5)',
      legendary: '0 0 25px rgba(253, 126, 20, 0.6)',
      mythic: '0 0 30px rgba(220, 53, 69, 0.7)'
    };
    return glows[rarity] || 'none';
  };

  const trophy = trophies[currentTrophy];

  return (
    <div className={`trophy-notification-overlay ${visible ? 'visible' : ''}`}>
      <div 
        className="trophy-notification-card"
        style={{ 
          borderColor: getRarityColor(trophy.rarity),
          boxShadow: getRarityGlow(trophy.rarity)
        }}
      >
        <div className="trophy-notification-header">
          <span className="trophy-notification-icon">🎉</span>
          <h3>Nuovo Trofeo Sbloccato!</h3>
          <button className="trophy-notification-close" onClick={() => setVisible(false)}>
            ×
          </button>
        </div>
        
        <div className="trophy-notification-content">
          <div className="trophy-notification-trophy">
            <span className="trophy-icon">{trophy.icon}</span>
            <div className="trophy-info">
              <h4>{trophy.name}</h4>
              <p>{trophy.description}</p>
              <div className="trophy-meta">
                <span className="trophy-rarity" style={{ color: getRarityColor(trophy.rarity) }}>
                  {trophy.rarity.toUpperCase()}
                </span>
                <span className="trophy-points">+{trophy.points} punti</span>
              </div>
            </div>
          </div>
        </div>

        {trophies.length > 1 && (
          <div className="trophy-notification-indicators">
            {trophies.map((_, index) => (
              <div 
                key={index} 
                className={`indicator ${index === currentTrophy ? 'active' : ''}`}
                onClick={() => setCurrentTrophy(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrophyNotification; 