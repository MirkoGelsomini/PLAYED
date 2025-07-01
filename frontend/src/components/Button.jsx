import React from 'react';

const Button = ({ children, ...props }) => (
  <button style={{ padding: '1rem', borderRadius: '12px', fontSize: '1.1rem' }} {...props}>
    {children}
  </button>
);

export default Button; 