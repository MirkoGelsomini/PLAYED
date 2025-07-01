import React from 'react';

const Badge = ({ label }) => (
  <span style={{ background: '#F5A623', color: '#fff', borderRadius: '8px', padding: '0.3em 0.8em', fontWeight: 'bold' }}>
    {label}
  </span>
);

export default Badge; 