import React, { useState, useEffect, useRef } from 'react';
import './Quiz.css';
import axios from 'axios';
import { useAuth } from '../../core/AuthContext';
import { useLocation } from 'react-router-dom';

function generateSessionId(user, gameType) {
  if (window.crypto && window.crypto.randomUUID) {
    return `${user?.id || user?._id || 'anon'}-${gameType}-${window.crypto.randomUUID()}`;
  }
  // fallback
  return `${user?.id || user?._id || 'anon'}-${gameType}-${Date.now()}-${Math.floor(Math.random()*100000)}`;
}

const LEVEL_THRESHOLD = 5; // quante risposte corrette per sbloccare il livello successivo

const QuizGame = ({ config, questionIds, category, onQuestionAnswered }) => {
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
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const timerRef = useRef(null);
  const { user, isAuthenticated } = useAuth();
  const [sessionId, setSessionId] = useState(null);
  const specificQuestionLoadedRef = useRef(false);

  // Genera sessionId all'inizio della partita
  useEffect(() => {
    if (!sessionId && user) {
      setSessionId(generateSessionId(user, 'quiz'));
    }
  }, [user, sessionId]);

  // Reset flag quando cambia questionIdParam
  useEffect(() => {
    specificQuestionLoadedRef.current = false;
  }, [questionIdParam]);

  // Carica domande e livello sbloccato
  useEffect(() => {
    const loadQuestionsAndLevel = async () => {
      try {
        // Carica domande e livello
        const res = await axios.get(`/api/progress/questions?gameType=quiz`, { withCredentials: true });
        const { answeredQuestions, unansweredQuestions, maxUnlockedLevel } = res.data;
        
        // Filtra domande per livello sbloccato E categoria
         const availableQuestions = [...answeredQuestions, ...unansweredQuestions];
        const filteredQuestions = availableQuestions.filter(q => 
          q.difficulty <= maxUnlockedLevel && 
          q.category === category
        );
        
        if (filteredQuestions.length === 0) {
          return;
        }
        
        setQuestions(filteredQuestions);
        setMaxUnlockedLevel(maxUnlockedLevel);
        
        // Se c'è un questionId specifico, trova quella domanda
        if (questionIdParam) {
           const specificQuestion = filteredQuestions.find(q => (q.id || q._id)?.toString() === questionIdParam);
          if (specificQuestion) {
            setQuestions([specificQuestion]);
            setCurrentQuestionIndex(0);
            specificQuestionLoadedRef.current = true;
          } else {
            specificQuestionLoadedRef.current = false;
          }
        } else {
          specificQuestionLoadedRef.current = false;
        }
        
        // Calcola progresso livello corrente
         const correctPerLevel = res.data.correctAnswersPerLevel || {};
        const currentLevelProgress = correctPerLevel[maxUnlockedLevel?.toString()] || 0;
        setLevelProgress(currentLevelProgress);
      } catch (err) {
        console.error('Errore nel caricamento domande/level:', err);
      }
    };

    if (user && category) {
      loadQuestionsAndLevel();
    }
  }, [user, category, questionIdParam]);

  // Ricarica domande quando sblocchi un nuovo livello
  useEffect(() => {
    const reloadQuestionsForNewLevel = async () => {
      // Non ricaricare se è già stata caricata una domanda specifica
      if (specificQuestionLoadedRef.current && questionIdParam) {
        return;
      }
      
      if (maxUnlockedLevel > 1 && category) {
        try {
          const res = await axios.get(`/api/progress/questions?gameType=quiz`, { withCredentials: true });
          const { answeredQuestions, unansweredQuestions, maxUnlockedLevel: newMaxLevel } = res.data;
          
          // Filtra domande per nuovo livello sbloccato E categoria
          const availableQuestions = [...answeredQuestions, ...unansweredQuestions];
          const filteredQuestions = availableQuestions.filter(q => 
            q.difficulty <= newMaxLevel && 
            q.category === category
          );
          
          if (filteredQuestions.length > 0) {
            // Se c'è un questionId specifico, mantieni quella domanda
            if (questionIdParam) {
              const specificQuestion = filteredQuestions.find(q => q.id.toString() === questionIdParam);
              if (specificQuestion) {
                setQuestions([specificQuestion]);
                setCurrentQuestionIndex(0);
                specificQuestionLoadedRef.current = true;
              } else {
                setQuestions(filteredQuestions);
                specificQuestionLoadedRef.current = false;
              }
            } else {
              setQuestions(filteredQuestions);
              specificQuestionLoadedRef.current = false;
            }
          }
        } catch (err) {
          console.error('Errore nel ricaricamento domande per nuovo livello:', err);
        }
      }
    };

    reloadQuestionsForNewLevel();
  }, [maxUnlockedLevel, category, questionIdParam]);

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

  // Quando il quiz è completato, salva il progresso con il sessionId unico
  useEffect(() => {
    if (gameCompleted && !progressSaved && user && sessionId) {
      setProgressSaved(true);
    }
  }, [gameCompleted, progressSaved, user, sessionId]);

  const handleTimeout = () => {
    setIsAnswered(true);
    setIsCorrect(false);
    setShowResult(true);
  };

  // Quando l'utente risponde, aggiorna il backend e controlla se sblocca un nuovo livello
  const handleAnswerSelect = async (answer) => {
    if (isAnswered) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const correct = answer === currentQuestion.answer;
    setIsAnswered(true);
    setIsCorrect(correct);
    setSelectedAnswer(answer);
    
    if (correct) {
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
    }
    setShowResult(true);
    
    // Aggiorna progresso backend
    try {
      // Genera un sessionId per questa risposta
      const responseSessionId = generateSessionId(user, 'quiz');
      
      const resp = await axios.post('/api/progress/answer', {
        sessionId: responseSessionId,
        questionId: currentQuestion.id || currentQuestion._id,
        isCorrect: correct,
        questionDifficulty: currentQuestion.difficulty || 1
      }, { withCredentials: true });
      
      // Se il livello è aumentato, mostra animazione
      const nuovoLivello = resp.data.progress.maxUnlockedLevel;
      if (nuovoLivello > maxUnlockedLevel) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
        setMaxUnlockedLevel(nuovoLivello);
        setLevelProgress(0);
      } else {
        // Aggiorna progresso livello
        const correctPerLevel = resp.data.progress.correctAnswersPerLevel || {};
        
        // Calcola il progresso per il livello corrente
        const currentLevelProgress = correctPerLevel[maxUnlockedLevel] || correctPerLevel[maxUnlockedLevel.toString()] || 0;
        
        setLevelProgress(currentLevelProgress);
      }
        // Notifica refresh globale (Sidebar/Home/Results) solo dopo salvataggio riuscito
        if (onQuestionAnswered) onQuestionAnswered();
      } catch (err) {
      console.error('Errore aggiornamento progresso:', err);
      console.error('Dettagli errore:', err.response?.data);
    }
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
    setCorrectAnswers(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowResult(false);
    setTimeLeft(config.timeLimit || 30);
    setGameCompleted(false);
    setProgressSaved(false);
    setSessionId(generateSessionId(user, 'quiz'));
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
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    return (
      <div className="quiz-container">
        <div className="quiz-completed">
          <div className="completion-icon">🎉</div>
          <h2>Quiz Completato!</h2>
          <div className="final-score">
            <p>Hai risposto correttamente a <strong>{correctAnswers}</strong> domande su <strong>{questions.length}</strong></p>
            <p>Punteggio totale: <strong>{score}</strong></p>
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
      {/* Notifica sblocco livello */}
      {showLevelUp && (
        <div className="levelup-notification">
          <span role="img" aria-label="level up">🚀</span> Nuovo livello sbloccato! Ora puoi affrontare domande più difficili!
        </div>
      )}
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
        <div className="quiz-level-progress">
          <span>Livello sbloccato: <strong>{maxUnlockedLevel}</strong></span>
          <div className="level-progress-container">
            <div className="level-progress-bar">
              <div 
                className="level-progress-fill"
                style={{ width: `${(levelProgress / LEVEL_THRESHOLD) * 100}%` }}
              />
            </div>
            <span className="level-progress-text">
              {levelProgress}/{LEVEL_THRESHOLD} per sbloccare livello {maxUnlockedLevel + 1}
            </span>
          </div>
        </div>
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