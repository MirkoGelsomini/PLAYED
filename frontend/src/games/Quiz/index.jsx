import React, { useState, useEffect, useRef } from 'react';
import './Quiz.css';
import axios from 'axios';
import { useAuth } from '../../core/AuthContext';
import { useLocation } from 'react-router-dom';

const QuizGame = ({ config, questionIds, onQuestionAnswered }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const questionIdParam = params.get('questionId');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit || 30);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const timerRef = useRef(null);
  const { user, isAuthenticated } = useAuth();

  // Carica le domande specifiche del quiz
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch('/api/questions');
        const allQuestions = await response.json();
        
        let quizQuestions = allQuestions.filter(q => 
          questionIds && questionIds.includes(q.id)
        );
        // Se c'è questionId nella query string, metti quella domanda per prima
        if (questionIdParam) {
          const forced = quizQuestions.find(q => String(q.id) === String(questionIdParam));
          if (forced) {
            quizQuestions = [forced, ...quizQuestions.filter(q => String(q.id) !== String(questionIdParam))];
          }
        }
        // Shuffle delle domande solo se non c'è questionId
        if (!questionIdParam) {
          for (let i = quizQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [quizQuestions[i], quizQuestions[j]] = [quizQuestions[j], quizQuestions[i]];
          }
        }
        
        setQuestions(quizQuestions);
      } catch (error) {
        console.error('Errore nel caricamento delle domande:', error);
      }
    };
    loadQuestions();
  }, [questionIds, questionIdParam]);

  // Shuffle delle opzioni se richiesto
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion && currentQuestion.options) {
        const options = [...currentQuestion.options];
        if (config.shuffleOptions) {
          for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
          }
        }
        setShuffledOptions(options);
      }
    }
  }, [questions, currentQuestionIndex, config.shuffleOptions]);

  // Timer
  useEffect(() => {
    if (config.showTimer && timeLeft > 0 && !isAnswered && questions.length > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered && questions.length > 0) {
      handleTimeout();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, isAnswered, config.showTimer, questions.length]);

  useEffect(() => {
    if (gameCompleted && !progressSaved && user) {
      const percentage = Math.round((score / questions.length) * 100);
      axios.post('/api/progress', {
        game: 'Quiz',
        sessionId: `${user._id}-quiz-${Date.now()}`,
        score,
        level: config.difficulty || 1,
        completed: true,
        details: { totalQuestions: questions.length, percentage }
      }, { withCredentials: true })
      .then(response => {
        console.log('Quiz: Progressi salvati con successo', response.data);
      })
      .catch(error => {
        console.error('Quiz: Errore nel salvataggio progressi', error.response?.data || error.message);
      });
      setProgressSaved(true);
    }
  }, [gameCompleted, progressSaved, user, score, questions.length, config.difficulty]);

  const handleTimeout = () => {
    setIsAnswered(true);
    setIsCorrect(false);
    setShowResult(true);
  };

  const handleAnswerSelect = (answer) => {
    if (isAnswered || questions.length === 0) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    const correct = answer === currentQuestion.answer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
    }
    
    setShowResult(true);
    if (onQuestionAnswered) onQuestionAnswered();
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setShowResult(false);
      setTimeLeft(config.timeLimit || 30);
    } else {
      setGameCompleted(true);
    }
  };

  const handleRestartGame = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowResult(false);
    setTimeLeft(config.timeLimit || 30);
    setGameCompleted(false);
    setProgressSaved(false);
  };

  if (questions.length === 0) {
    return (
      <div className="quiz-container">
        <div className="quiz-loading">
          <div className="loading-spinner"></div>
          <p>Caricamento domande...</p>
        </div>
      </div>
    );
  }

  if (gameCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="quiz-container">
        <div className="quiz-completed">
          <div className="completion-icon">🎉</div>
          <h2>Quiz Completato!</h2>
          <div className="final-score">
            <p>Hai risposto correttamente a <strong>{score}</strong> domande su <strong>{questions.length}</strong></p>
            <div className="score-percentage">{percentage}%</div>
          </div>
          <div className="score-message">
            {percentage >= 80 && <p>Eccellente! Sei un vero esperto! 🌟</p>}
            {percentage >= 60 && percentage < 80 && <p>Ottimo lavoro! Continua così! 👍</p>}
            {percentage >= 40 && percentage < 60 && <p>Buon lavoro! Puoi migliorare ancora! 💪</p>}
            {percentage < 40 && <p>Non scoraggiarti! Continua a studiare! 📚</p>}
          </div>
          <button className="restart-button" onClick={handleRestartGame}>
            Rigioca Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      {/* Header con timer e score */}
      <div className="quiz-header">
        <div className="quiz-score">
          <span className="score-label">Punteggio:</span>
          <span className="score-value">{score}</span>
        </div>
        <div className="quiz-progress">
          <span className="progress-text">
            Domanda {currentQuestionIndex + 1} di {questions.length}
          </span>
        </div>
        {config.showTimer && (
          <div className="quiz-timer">
            <div className="timer-circle">
              <span className="timer-value">{timeLeft}</span>
              <span className="timer-unit">s</span>
            </div>
          </div>
        )}
      </div>

      {/* Domanda */}
      <div className="quiz-question">
        <h2 className="question-text">{currentQuestion.question}</h2>
      </div>

      {/* Opzioni di risposta */}
      <div className="quiz-options">
        {shuffledOptions.map((option, index) => (
          <button
            key={index}
            className={`quiz-option ${
              selectedAnswer === option ? 'selected' : ''
            } ${
              isAnswered && option === currentQuestion.answer ? 'correct' : ''
            } ${
              isAnswered && selectedAnswer === option && option !== currentQuestion.answer ? 'incorrect' : ''
            }`}
            onClick={() => handleAnswerSelect(option)}
            disabled={isAnswered}
          >
            <span className="option-letter">{String.fromCharCode(65 + index)}</span>
            <span className="option-text">{option}</span>
          </button>
        ))}
      </div>

      {/* Risultato */}
      {showResult && (
        <div className="quiz-result">
          <div className={`result-message ${isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="result-icon">
              {isCorrect ? '✓' : '✗'}
            </div>
            <h3>{isCorrect ? 'Corretto!' : 'Sbagliato!'}</h3>
            <p>
              {isCorrect 
                ? 'Ottimo lavoro! Hai risposto correttamente.' 
                : `La risposta corretta era: ${currentQuestion.answer}`
              }
            </p>
          </div>
          <button className="next-button" onClick={handleNextQuestion}>
            {currentQuestionIndex < questions.length - 1 ? 'Prossima Domanda' : 'Vedi Risultati'}
          </button>
        </div>
      )}

      {/* Progress bar per il timer */}
      {config.showTimer && (
        <div className="timer-progress">
          <div 
            className="timer-progress-bar"
            style={{ 
              width: `${((config.timeLimit - timeLeft) / config.timeLimit) * 100}%` 
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default QuizGame;