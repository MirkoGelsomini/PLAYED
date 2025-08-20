import React, { useState, useCallback } from 'react';
import axios from 'axios';
import './ProgressCard.css';
import LevelUnlockModal from './LevelUnlockModal';
import { toastSuccess, toastError } from '../utils/toast';

const ProgressCard = ({ gameType, progressData, onLevelUnlocked }) => {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockingLevel, setUnlockingLevel] = useState(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

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

  const handleUnlockLevel = useCallback(async (level) => {
    if (showUnlockModal) {
      setShowUnlockModal(false);
      setUnlockingLevel(null);
      setTimeout(() => {
        setUnlockingLevel(level);
        setShowUnlockModal(true);
      }, 100);
    } else {
      setUnlockingLevel(level);
      setShowUnlockModal(true);
    }
  }, [showUnlockModal]);

  const confirmUnlockLevel = useCallback(async () => {
    if (!unlockingLevel) return;
    
    setIsUnlocking(true);
    try {
      const response = await axios.post('/api/progress/unlock-level', {
        gameType: gameType,
        level: unlockingLevel
      }, { withCredentials: true });

      if (response.data.success) {
        // Chiudi il modal
        setShowUnlockModal(false);
        setUnlockingLevel(null);
        
        // Notifica il componente padre per aggiornare i dati
        if (onLevelUnlocked) {
          onLevelUnlocked();
        }
        
        // Mostra un messaggio di successo
        toastSuccess(`🎉 Livello ${unlockingLevel} sbloccato con successo!`);
      }
    } catch (error) {
      console.error('ProgressCard - Errore nello sblocco del livello:', error);
      console.error('ProgressCard - Dettagli errore:', {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      });
      toastError('Errore nello sblocco del livello. Riprova più tardi.');
    } finally {
      setIsUnlocking(false);
    }
  }, [unlockingLevel, gameType, onLevelUnlocked]);

  const closeUnlockModal = useCallback(() => {
    setShowUnlockModal(false);
    setUnlockingLevel(null);
  }, []);

  return (
    <div className="progress-card">
      <div className="progress-header">
        <span className="game-icon">{gameIcons[gameType]}</span>
        <h3 className="game-title">{gameNames[gameType]}</h3>
        <div className="game-stats">
          <span className="stat">
            {progressData.answeredCount}/{progressData.totalAvailable} domande
          </span>
        </div>
      </div>

      <div className="levels-container">
        {/* Mostra solo il livello corrente */}
        {(() => {
          const currentLevel = progressData.maxUnlockedLevel;
          const levelData = progressData.progressByLevel[currentLevel];
          
          if (!levelData) return null;
          
          const canUnlock = levelData.isCurrentLevel && levelData.progress >= 100;
          const remainingAnswers = levelData.threshold - levelData.correctAnswers;
          
          return (
            <div className="level-item current">
              <div className="level-details">
                <div className="current-level-info">
                  <span className="level-label">Livello {currentLevel}</span>
                  <span className="correct-answers">
                    {levelData.correctAnswers}/{levelData.threshold} corrette
                  </span>
                </div>
                
                {levelData.progress < 100 && (
                  <span className="next-level-hint">
                    Mancano {remainingAnswers} risposte per sbloccare livello {currentLevel + 1}
                  </span>
                )}
                
                {canUnlock && (
                  <div className="unlock-section">
                    <span className="level-completed">
                      ✅ Livello {currentLevel + 1} pronto per lo sblocco!
                    </span>
                    <button 
                      className="unlock-button"
                      onClick={() => handleUnlockLevel(currentLevel + 1)}
                    >
                      🚀 Sblocca
                    </button>
                  </div>
                )}
                
                {levelData.isCurrentLevel && levelData.progress >= 100 && !canUnlock && (
                  <span className="level-completed">
                    ✅ Livello {currentLevel + 1} sbloccato!
                  </span>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Modal con ID unico per evitare duplicazioni */}
      {showUnlockModal && (
        <LevelUnlockModal
          key={`${gameType}-${unlockingLevel}-modal`}
          isOpen={showUnlockModal}
          onClose={closeUnlockModal}
          onConfirm={confirmUnlockLevel}
          gameType={gameType}
          level={unlockingLevel}
          isLoading={isUnlocking}
        />
      )}
    </div>
  );
};

export default ProgressCard; 