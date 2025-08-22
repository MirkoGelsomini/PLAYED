import React from 'react';
import { createPortal } from 'react-dom';
import './LevelUnlockModal.css';

const LevelUnlockModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  gameType, 
  level, 
  isLoading = false 
}) => {
  if (!isOpen || !level) return null;

  const gameNames = {
    quiz: 'Quiz',
    memory: 'Memory',
    matching: 'Matching',
    sorting: 'Sorting'
  };

  const gameIcons = {
    quiz: '🧠',
    memory: '🎯',
    matching: '🔗',
    sorting: '📊'
  };

  const modalContent = (
    <div className="level-unlock-modal-overlay" onClick={onClose}>
      <div className="level-unlock-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">
            <span className="game-icon">{gameIcons[gameType]}</span>
            <span className="level-icon">🚀</span>
          </div>
          <h2>Nuovo Livello Sbloccato!</h2>
          <p className="modal-subtitle">
            Hai completato il livello {level - 1} di {gameNames[gameType]}!
          </p>
        </div>

        <div className="modal-content">
          <div className="unlock-info">
            <h3>🎉 Livello {level} Disponibile</h3>
            <p>
              Ora puoi accedere a domande più difficili e sfidanti nel livello {level} di {gameNames[gameType]}!
            </p>
            <div className="unlock-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">📈</span>
                <span>Domande più complesse</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🏆</span>
                <span>Più punti da guadagnare</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">⭐</span>
                <span>Nuove sfide</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button 
            className="modal-btn cancel-btn" 
            onClick={onClose}
            disabled={isLoading}
          >
            Chiudi
          </button>
          <button 
            className="modal-btn confirm-btn" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Sbloccando...' : '🚀 Sblocca Livello'}
          </button>
        </div>
      </div>
    </div>
  );

  // Usa createPortal per renderizzare il modal fuori dal DOM normale
  return createPortal(modalContent, document.body);
};

export default LevelUnlockModal; 