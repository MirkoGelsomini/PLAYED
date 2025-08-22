import React from 'react';

const Button = ({ children, variant = 'primary', ...props }) => {
  const buttonStyles = {
    padding: 'var(--spacing-m) var(--spacing-xl)',
    borderRadius: 'var(--border-radius-medium)',
    fontSize: '1.1rem',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
    outline: 'none',
    fontFamily: 'var(--font-family)',
    ...props.style
  };

  // Varianti del bottone
  if (variant === 'primary') {
    buttonStyles.background = 'var(--gradient-primary)';
    buttonStyles.color = 'var(--white-cloud)';
    buttonStyles.boxShadow = 'var(--shadow-soft)';
  } else if (variant === 'secondary') {
    buttonStyles.background = 'transparent';
    buttonStyles.color = 'var(--primary-color)';
    buttonStyles.border = '3px solid var(--primary-color)';
    buttonStyles.boxShadow = 'var(--shadow-soft)';
  } else if (variant === 'accent') {
    buttonStyles.background = 'var(--gradient-sun)';
    buttonStyles.color = 'var(--gray-charcoal)';
    buttonStyles.boxShadow = 'var(--shadow-soft)';
  } else if (variant === 'danger') {
    buttonStyles.background = 'var(--gradient-danger)';
    buttonStyles.color = 'var(--white-cloud)';
    buttonStyles.boxShadow = 'var(--shadow-soft)';
  }

  return (
    <button 
      style={buttonStyles} 
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = 'var(--shadow-medium)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = variant === 'secondary' ? 'var(--shadow-soft)' : 'var(--shadow-soft)';
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 