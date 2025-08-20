import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Stepper, { Step } from '../Stepper';

/**
 * Test per il componente Stepper
 */

// Mock di framer-motion per semplificare i test
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, exit, variants, transition, custom, ...props }) => (
      <div {...props}>{children}</div>
    ),
    path: ({ children, initial, animate, transition, ...props }) => (
      <path {...props}>{children}</path>
    )
  },
  AnimatePresence: ({ children }) => <>{children}</>
}));

describe('Stepper Component', () => {
  const defaultSteps = [
    <Step key="1">Step 1 Content</Step>,
    <Step key="2">Step 2 Content</Step>,
    <Step key="3">Step 3 Content</Step>
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders stepper with initial step', () => {
    render(<Stepper>{defaultSteps}</Stepper>);
    
    expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
    // Il primo step è attivo, quindi mostra un dot invece del numero
    expect(screen.getByText('2')).toBeInTheDocument(); // Il secondo step mostra il numero
    expect(screen.getByText('3')).toBeInTheDocument(); // Il terzo step mostra il numero
  });

  test('renders stepper with custom initial step', () => {
    render(<Stepper initialStep={2}>{defaultSteps}</Stepper>);
    
    expect(screen.getByText('Step 2 Content')).toBeInTheDocument();
  });

  test('navigates to next step when next button is clicked', () => {
    render(<Stepper>{defaultSteps}</Stepper>);
    
    const nextButton = screen.getByText('Continue');
    fireEvent.click(nextButton);
    
    expect(screen.getByText('Step 2 Content')).toBeInTheDocument();
  });

  test('navigates to previous step when back button is clicked', () => {
    render(<Stepper initialStep={2}>{defaultSteps}</Stepper>);
    
    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);
    
    expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
  });

  test('does not show back button on first step', () => {
    render(<Stepper>{defaultSteps}</Stepper>);
    
    expect(screen.queryByText('Back')).not.toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  test('shows complete button on last step', () => {
    render(<Stepper initialStep={3}>{defaultSteps}</Stepper>);
    
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.queryByText('Continue')).not.toBeInTheDocument();
  });

  test('calls onStepChange when step changes', () => {
    const onStepChange = jest.fn();
    render(<Stepper onStepChange={onStepChange}>{defaultSteps}</Stepper>);
    
    const nextButton = screen.getByText('Continue');
    fireEvent.click(nextButton);
    
    expect(onStepChange).toHaveBeenCalledWith(2);
  });

  test('calls onFinalStepCompleted when complete button is clicked', () => {
    const onFinalStepCompleted = jest.fn();
    render(
      <Stepper initialStep={3} onFinalStepCompleted={onFinalStepCompleted}>
        {defaultSteps}
      </Stepper>
    );
    
    const completeButton = screen.getByText('Complete');
    fireEvent.click(completeButton);
    
    expect(onFinalStepCompleted).toHaveBeenCalledTimes(1);
  });

  test('validates step before advancing when onStepNext is provided', () => {
    const onStepNext = jest.fn().mockReturnValue(false); // Validazione fallisce
    render(<Stepper onStepNext={onStepNext}>{defaultSteps}</Stepper>);
    
    const nextButton = screen.getByText('Continue');
    fireEvent.click(nextButton);
    
    expect(onStepNext).toHaveBeenCalledWith(1);
    // Dovrebbe rimanere sul primo step
    expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
  });

  test('advances step when validation passes', () => {
    const onStepNext = jest.fn().mockReturnValue(true); // Validazione passa
    render(<Stepper onStepNext={onStepNext}>{defaultSteps}</Stepper>);
    
    const nextButton = screen.getByText('Continue');
    fireEvent.click(nextButton);
    
    expect(onStepNext).toHaveBeenCalledWith(1);
    expect(screen.getByText('Step 2 Content')).toBeInTheDocument();
  });

  test('allows clicking on step indicators to navigate', () => {
    render(<Stepper>{defaultSteps}</Stepper>);
    
    // Trova e clicca sul secondo step indicator
    const stepTwoIndicator = screen.getByText('2').closest('.step-indicator');
    fireEvent.click(stepTwoIndicator);
    
    expect(screen.getByText('Step 2 Content')).toBeInTheDocument();
  });

  test('disables step indicators when disableStepIndicators is true', () => {
    render(<Stepper disableStepIndicators={true}>{defaultSteps}</Stepper>);
    
    const stepTwoIndicator = screen.getByText('2').closest('.step-indicator');
    fireEvent.click(stepTwoIndicator);
    
    // Dovrebbe rimanere sul primo step
    expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
  });

  test('uses custom button text', () => {
    render(
      <Stepper 
        backButtonText="Indietro" 
        nextButtonText="Avanti"
        initialStep={2}
      >
        {defaultSteps}
      </Stepper>
    );
    
    expect(screen.getByText('Indietro')).toBeInTheDocument();
    expect(screen.getByText('Avanti')).toBeInTheDocument();
  });

  test('applies custom CSS classes', () => {
    render(
      <Stepper 
        stepCircleContainerClassName="custom-container"
        stepContainerClassName="custom-step-container"
        contentClassName="custom-content"
        footerClassName="custom-footer"
      >
        {defaultSteps}
      </Stepper>
    );
    
    expect(document.querySelector('.custom-container')).toBeInTheDocument();
    expect(document.querySelector('.custom-step-container')).toBeInTheDocument();
    expect(document.querySelector('.step-content-default.custom-content')).toBeInTheDocument();
    expect(document.querySelector('.custom-footer')).toBeInTheDocument();
  });

  test('passes button props to back and next buttons', () => {
    render(
      <Stepper 
        initialStep={2}
        backButtonProps={{ 'data-testid': 'back-btn', className: 'custom-back' }}
        nextButtonProps={{ 'data-testid': 'next-btn', className: 'custom-next' }}
      >
        {defaultSteps}
      </Stepper>
    );
    
    const backButton = screen.getByTestId('back-btn');
    const nextButton = screen.getByTestId('next-btn');
    
    expect(backButton).toHaveClass('custom-back');
    expect(nextButton).toHaveClass('custom-next');
  });

  test('handles step indicator states correctly', () => {
    render(<Stepper initialStep={2}>{defaultSteps}</Stepper>);
    
    // Verifica che ci siano 3 step indicators
    const stepIndicators = document.querySelectorAll('.step-indicator');
    expect(stepIndicators).toHaveLength(3);
    
    // Step 3 dovrebbe essere inattivo e mostrare il numero
    const stepThree = screen.getByText('3').closest('.step-indicator');
    expect(stepThree).toBeInTheDocument();
    
    // Verifica che il contenuto del secondo step sia visibile
    expect(screen.getByText('Step 2 Content')).toBeInTheDocument();
  });

  test('renders step connectors between indicators', () => {
    render(<Stepper>{defaultSteps}</Stepper>);
    
    const connectors = document.querySelectorAll('.step-connector');
    // Dovrebbero esserci 2 connettori per 3 step
    expect(connectors).toHaveLength(2);
  });

  test('handles completion state correctly', () => {
    const onFinalStepCompleted = jest.fn();
    render(
      <Stepper initialStep={3} onFinalStepCompleted={onFinalStepCompleted}>
        {defaultSteps}
      </Stepper>
    );
    
    const completeButton = screen.getByText('Complete');
    fireEvent.click(completeButton);
    
    // Dopo il completamento, non dovrebbero esserci più bottoni
    expect(screen.queryByText('Complete')).not.toBeInTheDocument();
    expect(screen.queryByText('Back')).not.toBeInTheDocument();
  });

  test('uses custom step indicator renderer when provided', () => {
    const customRenderer = ({ step, currentStep, onStepClick }) => (
      <div 
        data-testid={`custom-step-${step}`}
        onClick={() => onStepClick(step)}
        className={step === currentStep ? 'active-custom' : 'inactive-custom'}
      >
        Custom Step {step}
      </div>
    );
    
    render(
      <Stepper renderStepIndicator={customRenderer}>
        {defaultSteps}
      </Stepper>
    );
    
    expect(screen.getByTestId('custom-step-1')).toBeInTheDocument();
    expect(screen.getByTestId('custom-step-2')).toBeInTheDocument();
    expect(screen.getByTestId('custom-step-3')).toBeInTheDocument();
    expect(screen.getByText('Custom Step 1')).toBeInTheDocument();
  });
});
