import React from 'react';

const ProgressBar = ({ value, max }) => (
  <div style={{ background: '#eee', borderRadius: '8px', width: '100%', height: '20px' }}>
    <div style={{ width: `${(value / max) * 100}%`, background: '#4A90E2', height: '100%', borderRadius: '8px' }} />
  </div>
);

export default ProgressBar; 