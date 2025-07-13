import React from 'react';
import { getAvatarUrl } from '../utils/avatarUtils';
import './Avatar.css';

const Avatar = ({ 
  avatar, 
  alt = "Avatar", 
  className = "", 
  size = "medium",
  fallbackIcon = null 
}) => {
  const avatarUrl = getAvatarUrl(avatar);
  
  const sizeClasses = {
    small: 'avatar-small',
    medium: 'avatar-medium', 
    large: 'avatar-large',
    xlarge: 'avatar-xlarge'
  };

  const handleError = (e) => {
    // Se l'immagine non carica, mostra l'icona utente di default
    if (fallbackIcon) {
      e.target.src = fallbackIcon;
    } else {
      // Icona utente SVG di default più discreta
      e.target.src = `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6c757d">
          <circle cx="12" cy="8" r="4"/>
          <path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/>
        </svg>
      `)}`;
    }
  };

  return (
    <img
      src={avatarUrl}
      alt={alt}
      className={`avatar-base ${sizeClasses[size]} ${className}`}
      onError={handleError}
    />
  );
};

export default Avatar; 