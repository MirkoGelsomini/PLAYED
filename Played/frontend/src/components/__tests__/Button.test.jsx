import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../Button';

/**
 * Test per il componente Button
 */

describe('Button Component', () => {
  test('renders button with children', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
  });

  test('renders with different variants', () => {
    // Test primary variant (default)
    const { rerender } = render(<Button>Primary Button</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    // Test secondary variant
    rerender(<Button variant="secondary">Secondary Button</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    // Test accent variant
    rerender(<Button variant="accent">Accent Button</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    // Test danger variant
    rerender(<Button variant="danger">Danger Button</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('handles mouse hover interactions', () => {
    render(<Button>Hover Button</Button>);
    const button = screen.getByRole('button');
    
    // Verifica che gli event handlers esistano
    expect(button.onmouseenter).toBeDefined();
    expect(button.onmouseleave).toBeDefined();
    
    // Simula hover - verifica che il transform venga applicato
    fireEvent.mouseEnter(button);
    expect(button.style.transform).toBe('translateY(-2px)');
    
    // Simula mouse leave - verifica che il transform venga rimosso
    fireEvent.mouseLeave(button);
    expect(button.style.transform).toBe('translateY(0)');
  });

  test('passes through additional props', () => {
    render(<Button disabled data-testid="custom-button">Disabled Button</Button>);
    const button = screen.getByTestId('custom-button');
    
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-testid', 'custom-button');
  });

  test('applies custom styles from props', () => {
    const customStyle = { fontSize: '2rem', padding: '20px' };
    render(<Button style={customStyle}>Custom Style</Button>);
    const button = screen.getByRole('button');
    
    // Verifica che gli stili personalizzati vengano applicati
    expect(button.style.fontSize).toBe('2rem');
    expect(button.style.padding).toBe('20px');
  });

  test('maintains accessibility attributes', () => {
    render(
      <Button aria-label="Custom aria label" role="button">
        Accessible Button
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Custom aria label');
  });
});
