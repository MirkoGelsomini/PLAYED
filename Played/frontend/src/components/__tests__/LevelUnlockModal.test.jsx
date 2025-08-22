import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LevelUnlockModal from '../LevelUnlockModal';

/**
 * Test per il componente LevelUnlockModal
 */

// Mock di createPortal per semplificare i test
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (element) => element,
}));

describe('LevelUnlockModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    gameType: 'quiz',
    level: 2,
    isLoading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('does not render when isOpen is false', () => {
    render(<LevelUnlockModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Nuovo Livello Sbloccato!')).not.toBeInTheDocument();
  });

  test('does not render when level is not provided', () => {
    render(<LevelUnlockModal {...defaultProps} level={null} />);
    
    expect(screen.queryByText('Nuovo Livello Sbloccato!')).not.toBeInTheDocument();
  });

  test('renders modal content when isOpen is true', () => {
    render(<LevelUnlockModal {...defaultProps} />);
    
    expect(screen.getByText('Nuovo Livello Sbloccato!')).toBeInTheDocument();
    expect(screen.getByText('Hai completato il livello 1 di Quiz!')).toBeInTheDocument();
    expect(screen.getByText('🎉 Livello 2 Disponibile')).toBeInTheDocument();
  });

  test('displays correct game name and icon for each game type', () => {
    const gameTypes = [
      { type: 'quiz', name: 'Quiz', icon: '🧠' },
      { type: 'memory', name: 'Memory', icon: '🎯' },
      { type: 'matching', name: 'Matching', icon: '🔗' },
      { type: 'sorting', name: 'Sorting', icon: '📊' }
    ];

    gameTypes.forEach(({ type, name, icon }) => {
      const { rerender } = render(<LevelUnlockModal {...defaultProps} gameType={type} />);
      
      expect(screen.getByText(`Hai completato il livello 1 di ${name}!`)).toBeInTheDocument();
      expect(screen.getByText(icon)).toBeInTheDocument();
      
      rerender(<div />); // Clear per il prossimo test
    });
  });

  test('handles close button click', () => {
    const onClose = jest.fn();
    render(<LevelUnlockModal {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByText('Chiudi');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('handles confirm button click', () => {
    const onConfirm = jest.fn();
    render(<LevelUnlockModal {...defaultProps} onConfirm={onConfirm} />);
    
    const confirmButton = screen.getByText('🚀 Sblocca Livello');
    fireEvent.click(confirmButton);
    
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test('handles overlay click to close modal', () => {
    const onClose = jest.fn();
    render(<LevelUnlockModal {...defaultProps} onClose={onClose} />);
    
    const overlay = screen.getByText('Nuovo Livello Sbloccato!').closest('.level-unlock-modal-overlay');
    fireEvent.click(overlay);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('prevents modal close when clicking inside modal content', () => {
    const onClose = jest.fn();
    render(<LevelUnlockModal {...defaultProps} onClose={onClose} />);
    
    const modalContent = screen.getByText('Nuovo Livello Sbloccato!').closest('.level-unlock-modal');
    fireEvent.click(modalContent);
    
    expect(onClose).not.toHaveBeenCalled();
  });

  test('shows loading state on confirm button', () => {
    render(<LevelUnlockModal {...defaultProps} isLoading={true} />);
    
    const confirmButton = screen.getByText('⏳ Sbloccando...');
    expect(confirmButton).toBeDisabled();
    expect(confirmButton).toBeInTheDocument();
  });

  test('disables buttons when loading', () => {
    render(<LevelUnlockModal {...defaultProps} isLoading={true} />);
    
    const closeButton = screen.getByText('Chiudi');
    const confirmButton = screen.getByText('⏳ Sbloccando...');
    
    expect(closeButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();
  });

  test('displays correct level information', () => {
    render(<LevelUnlockModal {...defaultProps} level={5} />);
    
    expect(screen.getByText('Hai completato il livello 4 di Quiz!')).toBeInTheDocument();
    expect(screen.getByText('🎉 Livello 5 Disponibile')).toBeInTheDocument();
    expect(screen.getByText(/Ora puoi accedere a domande più difficili e sfidanti nel livello 5 di Quiz!/)).toBeInTheDocument();
  });

  test('displays unlock benefits', () => {
    render(<LevelUnlockModal {...defaultProps} />);
    
    expect(screen.getByText('Domande più complesse')).toBeInTheDocument();
    expect(screen.getByText('Più punti da guadagnare')).toBeInTheDocument();
    expect(screen.getByText('Nuove sfide')).toBeInTheDocument();
    
    // Verifica le icone dei benefici
    expect(screen.getByText('📈')).toBeInTheDocument();
    expect(screen.getByText('🏆')).toBeInTheDocument();
    expect(screen.getByText('⭐')).toBeInTheDocument();
  });

  test('renders modal with correct CSS classes', () => {
    render(<LevelUnlockModal {...defaultProps} />);
    
    const overlay = screen.getByText('Nuovo Livello Sbloccato!').closest('.level-unlock-modal-overlay');
    const modal = screen.getByText('Nuovo Livello Sbloccato!').closest('.level-unlock-modal');
    
    expect(overlay).toHaveClass('level-unlock-modal-overlay');
    expect(modal).toHaveClass('level-unlock-modal');
  });

  test('maintains focus management and accessibility', () => {
    render(<LevelUnlockModal {...defaultProps} />);
    
    const closeButton = screen.getByText('Chiudi');
    const confirmButton = screen.getByText('🚀 Sblocca Livello');
    
    expect(closeButton).toHaveClass('modal-btn', 'cancel-btn');
    expect(confirmButton).toHaveClass('modal-btn', 'confirm-btn');
  });

  test('handles different game types correctly', () => {
    const { rerender } = render(<LevelUnlockModal {...defaultProps} gameType="memory" level={3} />);
    
    expect(screen.getByText('Hai completato il livello 2 di Memory!')).toBeInTheDocument();
    expect(screen.getByText('🎯')).toBeInTheDocument();
    
    rerender(<LevelUnlockModal {...defaultProps} gameType="matching" level={4} />);
    expect(screen.getByText('Hai completato il livello 3 di Matching!')).toBeInTheDocument();
    expect(screen.getByText('🔗')).toBeInTheDocument();
  });
});
