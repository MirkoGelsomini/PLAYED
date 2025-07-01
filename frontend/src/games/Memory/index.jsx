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
      <div ref={phaserContainer} style={{ width: 600, height: 400, margin: '0 auto', background: '#eee', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
    </div>
  );
};

export default MemoryGame; 