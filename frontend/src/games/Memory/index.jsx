import React, { useEffect, useRef } from 'react';
import phaserWrapper from '../../gameEngine/phaserWrapper';

const MemoryGame = ({ config, pairs }) => {
  const phaserContainer = useRef(null);

  useEffect(() => {
    phaserWrapper(phaserContainer.current, config, pairs);
    // Cleanup: distruggi la scena quando il componente si smonta
    return () => {
      if (phaserContainer.current && phaserContainer.current._phaserGame) {
        phaserContainer.current._phaserGame.destroy(true);
        phaserContainer.current._phaserGame = null;
      }
    };
  }, [config, pairs]);

  return (
    <div>
      <div
        ref={phaserContainer}
        style={{
          width: 'min(98vw, 900px)',
          height: 'min(70vw, 600px)',
          margin: '0 auto',
          background: '#eee',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 24px 0 rgba(74,144,226,0.10)',
        }}
      />
    </div>
  );
};

export default MemoryGame; 