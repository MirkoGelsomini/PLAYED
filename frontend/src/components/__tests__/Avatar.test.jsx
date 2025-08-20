import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Avatar from '../Avatar';
import { getAvatarUrl, defaultUserIcon } from '../../utils/avatarUtils';

/**
 * Test per il componente Avatar
 */

// Mock della funzione getAvatarUrl
jest.mock('../../utils/avatarUtils', () => ({
  getAvatarUrl: jest.fn(),
  defaultUserIcon: 'data:image/svg+xml;base64,mock-default-icon'
}));

describe('Avatar Component', () => {
  beforeEach(() => {
    // Reset dei mock prima di ogni test
    jest.clearAllMocks();
    getAvatarUrl.mockImplementation((avatar) => {
      if (!avatar) return defaultUserIcon;
      if (avatar.startsWith('http')) return avatar;
      if (avatar.match(/\.(png|jpg|jpeg)$/i)) return `/avatar/${avatar}`;
      return defaultUserIcon;
    });
  });

  test('renders avatar image with correct src', () => {
    getAvatarUrl.mockReturnValue('/avatar/cat.png');
    
    render(<Avatar avatar="cat.png" alt="Cat Avatar" />);
    
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/avatar/cat.png');
    expect(image).toHaveAttribute('alt', 'Cat Avatar');
  });

  test('applies default alt text when not provided', () => {
    getAvatarUrl.mockReturnValue('/avatar/dog.png');
    
    render(<Avatar avatar="dog.png" />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', 'Avatar');
  });

  test('applies size classes correctly', () => {
    getAvatarUrl.mockReturnValue('/avatar/lion.png');
    
    // Test small size
    const { rerender } = render(<Avatar avatar="lion.png" size="small" />);
    expect(screen.getByRole('img')).toHaveClass('avatar-base', 'avatar-small');
    
    // Test medium size (default)
    rerender(<Avatar avatar="lion.png" size="medium" />);
    expect(screen.getByRole('img')).toHaveClass('avatar-base', 'avatar-medium');
    
    // Test large size
    rerender(<Avatar avatar="lion.png" size="large" />);
    expect(screen.getByRole('img')).toHaveClass('avatar-base', 'avatar-large');
    
    // Test xlarge size
    rerender(<Avatar avatar="lion.png" size="xlarge" />);
    expect(screen.getByRole('img')).toHaveClass('avatar-base', 'avatar-xlarge');
  });

  test('applies default medium size when size not specified', () => {
    getAvatarUrl.mockReturnValue('/avatar/panda.png');
    
    render(<Avatar avatar="panda.png" />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveClass('avatar-base', 'avatar-medium');
  });

  test('applies additional className', () => {
    getAvatarUrl.mockReturnValue('/avatar/fox.png');
    
    render(<Avatar avatar="fox.png" className="custom-avatar-class" />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveClass('avatar-base', 'avatar-medium', 'custom-avatar-class');
  });

  test('handles image load error with default fallback', () => {
    getAvatarUrl.mockReturnValue('/avatar/nonexistent.png');
    
    render(<Avatar avatar="nonexistent.png" />);
    
    const image = screen.getByRole('img');
    
    // Simula errore di caricamento immagine
    fireEvent.error(image);
    
    // Verifica che sia stato impostato l'SVG di fallback
    expect(image.src).toContain('data:image/svg+xml;base64,');
  });

  test('handles image load error with custom fallback icon', () => {
    getAvatarUrl.mockReturnValue('/avatar/broken.png');
    const customFallback = '/custom-fallback.png';
    
    render(<Avatar avatar="broken.png" fallbackIcon={customFallback} />);
    
    const image = screen.getByRole('img');
    
    // Simula errore di caricamento immagine
    fireEvent.error(image);
    
    // Verifica che sia stato impostato il fallback personalizzato
    expect(image).toHaveAttribute('src', customFallback);
  });

  test('calls getAvatarUrl with correct avatar parameter', () => {
    const avatarName = 'test-avatar.png';
    
    render(<Avatar avatar={avatarName} />);
    
    expect(getAvatarUrl).toHaveBeenCalledWith(avatarName);
    expect(getAvatarUrl).toHaveBeenCalledTimes(1);
  });

  test('handles null/undefined avatar gracefully', () => {
    getAvatarUrl.mockReturnValue(defaultUserIcon);
    
    render(<Avatar avatar={null} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', defaultUserIcon);
    expect(getAvatarUrl).toHaveBeenCalledWith(null);
  });

  test('maintains accessibility with proper img role', () => {
    getAvatarUrl.mockReturnValue('/avatar/cat.png');
    
    render(<Avatar avatar="cat.png" alt="User profile picture" />);
    
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'User profile picture');
  });

  test('error handler creates correct default SVG', () => {
    getAvatarUrl.mockReturnValue('/avatar/test.png');
    
    render(<Avatar avatar="test.png" />);
    
    const image = screen.getByRole('img');
    fireEvent.error(image);
    
    // Verifica che il src contenga un SVG base64 valido
    const src = image.getAttribute('src');
    expect(src).toMatch(/^data:image\/svg\+xml;base64,/);
    
    // Decodifica e verifica il contenuto SVG
    const base64Content = src.replace('data:image/svg+xml;base64,', '');
    const svgContent = atob(base64Content);
    expect(svgContent).toContain('<svg');
    expect(svgContent).toContain('<circle');
    expect(svgContent).toContain('<path');
  });
});
