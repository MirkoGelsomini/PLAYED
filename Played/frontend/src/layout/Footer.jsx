import React from 'react';

const footerStyle = {
  background: 'var(--gradient-primary)',
  color: 'var(--white-cloud)',
  padding: 'var(--spacing-m)',
  textAlign: 'center',
  marginTop: 'var(--spacing-xxl)',
  boxShadow: 'var(--shadow-soft)',
  borderTop: '3px solid var(--green-leaf)',
};

const Footer = () => (
  <footer style={footerStyle}>
    <small>&copy; {new Date().getFullYear()} PLAYED - Tutti i diritti riservati</small>
  </footer>
);

export default Footer; 