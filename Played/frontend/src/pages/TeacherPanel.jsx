import React, { useState, useEffect } from 'react';
import { useAuth } from '../core/AuthContext';
import axios from 'axios';
import '../styles/TeacherPanel.css';

// Utilità per estrarre messaggi di errore in modo sicuro
const extractErrorMessage = (error, fallback = 'Errore sconosciuto') => {
  return typeof error.response?.data?.error === 'string' 
    ? error.response.data.error 
    : fallback;
};

// Utilità per estrarre messaggi in modo sicuro
const extractMessage = (message, fallback = 'Operazione completata') => {
  return typeof message === 'string' ? message : fallback;
};

export default function TeacherPanel() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: 'quiz',
    category: 'matematica',
    schoolLevel: 'prim',
    class: 1,
    difficulty: 3
  });
  const [loading, setLoading] = useState(false);
  const [sageResponse, setSageResponse] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Verifica che l'utente sia un docente
  useEffect(() => {
    if (user && user.role !== 'docente') {
      setError('Accesso negato. Solo i docenti possono accedere a questa pagina.');
    }
  }, [user]);

  // Carica le domande del docente
  useEffect(() => {
    if (user && user.role === 'docente') {
      loadQuestions();
    }
  }, [user]);

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const response = await axios.get('/api/questions/teacher');
      setQuestions(response.data.data || []);
    } catch (error) {
      console.error('Errore nel caricamento delle domande:', error);
      setError(extractErrorMessage(error, 'Errore nel caricamento delle domande'));
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Converti in numero i campi class e difficulty
    if (name === 'class' || name === 'difficulty') {
      processedValue = parseInt(value, 10);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleRequestQuestion = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setSageResponse(null);

    try {
      const response = await axios.post('/api/questions/request', formData);
      const { success, message, data, sageStatus } = response.data;
      
      if (success && sageStatus === 1) {
        // Status 1 = success - mostra la domanda
        setSageResponse(data.data);
        setSuccess(extractMessage(message, 'Domanda generata con successo'));
      } else {
        // Altri status code - mostra errore appropriato
        let errorMessage = extractMessage(message, 'Errore nella richiesta a SAGE');
        switch (sageStatus) {
          case 2:
            errorMessage = 'Fonti non disponibili per questa combinazione di parametri. Prova con categoria o difficoltà diverse.';
            break;
          case 3:
            errorMessage = 'Il sistema AI non è riuscito a generare una risposta valida. Riprova.';
            break;
          case 4:
            errorMessage = 'I parametri forniti non sono validi per il sistema SAGE.';
            break;
          case 5:
            errorMessage = 'Errore interno del sistema SAGE. Riprova più tardi.';
            break;
          default:
            errorMessage = extractMessage(message, 'Errore sconosciuto nella richiesta a SAGE');
        }
        setError(errorMessage);
        setSageResponse(null);
      }
    } catch (error) {
      console.error('Errore nella richiesta:', error);
      setError(extractErrorMessage(error, 'Errore di connessione con il server'));
      setSageResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async () => {
    if (!sageResponse) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepara i dati per il salvataggio
      const questionData = {
        type: sageResponse.type,
        category: sageResponse.category,
        question: sageResponse.question,
        difficulty: parseInt(sageResponse.difficulty, 10),
        schoolLevel: formData.schoolLevel,
        class: parseInt(formData.class, 10)
      };

      // Aggiungi campi specifici per tipo
      switch (sageResponse.type) {
        case 'quiz':
          questionData.options = sageResponse.options;
          questionData.answer = sageResponse.answer;
          break;
        case 'sorting':
          questionData.items = sageResponse.items;
          questionData.solution = sageResponse.solution;
          break;
        case 'matching':
          questionData.pairs = sageResponse.pairs;
          break;
        case 'memory':
          questionData.memoryPairs = sageResponse.pairs;
          break;
      }

      await axios.post('/api/questions', questionData);

      setSuccess('Domanda salvata con successo!');
      setSageResponse(null);
      loadQuestions(); // Ricarica la lista
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      setError(extractErrorMessage(error, 'Errore nel salvataggio della domanda'));
    } finally {
      setLoading(false);
    }
  };

  const handleApproveQuestion = async (questionId) => {
    try {
      await axios.put(`/api/questions/${questionId}/approve`);
      setSuccess('Domanda approvata con successo!');
      loadQuestions(); // Ricarica la lista
    } catch (error) {
      console.error('Errore nell\'approvazione:', error);
      setError(extractErrorMessage(error, 'Errore nell\'approvazione della domanda'));
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa domanda?')) return;

    try {
      await axios.delete(`/api/questions/${questionId}`);
      setSuccess('Domanda eliminata con successo!');
      loadQuestions(); // Ricarica la lista
    } catch (error) {
      console.error('Errore nell\'eliminazione:', error);
      setError(extractErrorMessage(error, 'Errore nell\'eliminazione della domanda'));
    }
  };

  const handleApproveAllPending = async () => {
    const pendingQuestions = questions.filter(q => !q.approved);
    if (pendingQuestions.length === 0) {
      setError('Non ci sono domande in sospeso da approvare');
      return;
    }

    if (!window.confirm(`Sei sicuro di voler approvare tutte le ${pendingQuestions.length} domande in sospeso?`)) return;

    try {
      setLoading(true);
      const response = await axios.put('/api/questions/approve-all');
      setSuccess(extractMessage(response.data.message, 'Domande approvate con successo'));
      loadQuestions(); // Ricarica la lista
    } catch (error) {
      console.error('Errore nell\'approvazione multipla:', error);
      setError(extractErrorMessage(error, 'Errore nell\'approvazione multipla delle domande'));
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionPreview = () => {
    if (!sageResponse) return null;

    return (
      <div className="question-preview">
        <h3>Anteprima Domanda Generata da SAGE</h3>
        <div className="preview-content">
          <p><strong>Tipo:</strong> {sageResponse.type}</p>
          <p><strong>Categoria:</strong> {sageResponse.category}</p>
          <p><strong>Difficoltà:</strong> {sageResponse.difficulty}</p>
          <p><strong>Livello:</strong> {formData.schoolLevel} - Classe {formData.class}</p>
          <div className="question-text">
            <p><strong>Domanda:</strong></p>
            <div className="question-content">{sageResponse.question}</div>
          </div>
          
          {sageResponse.type === 'quiz' && (
            <div>
              <p><strong>Opzioni:</strong></p>
              <ul>
                {sageResponse.options?.map((option, index) => (
                  <li key={index} className={option === sageResponse.answer ? 'correct-answer' : ''}>
                    {option} {option === sageResponse.answer && '✓'}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {sageResponse.type === 'sorting' && (
            <div>
              <p><strong>Elementi:</strong></p>
              <ul>
                {sageResponse.items?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {sageResponse.type === 'matching' && (
            <div>
              <p><strong>Coppie:</strong></p>
              <ul>
                {sageResponse.pairs?.map((pair, index) => (
                  <li key={index}>{pair.left} ↔ {pair.right}</li>
                ))}
              </ul>
            </div>
          )}
          
          {sageResponse.type === 'memory' && (
            <div>
              <p><strong>Coppie Memory:</strong></p>
              <ul>
                {sageResponse.pairs?.map((pair, index) => (
                  <li key={index}>{pair.front} ↔ {pair.back}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="preview-actions">
          <button 
            onClick={handleSaveQuestion} 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Salvataggio...' : 'Salva Domanda'}
          </button>
          <button 
            onClick={() => setSageResponse(null)} 
            className="btn btn-secondary"
            disabled={loading}
          >
            Scarta
          </button>
        </div>
      </div>
    );
  };

  const renderQuestionsList = () => {
    if (loadingQuestions) {
      return <div className="loading">Caricamento domande...</div>;
    }

    if (questions.length === 0) {
      return <div className="no-questions">Nessuna domanda trovata.</div>;
    }

    const pendingCount = questions.filter(q => !q.approved).length;

    return (
      <div className="questions-list">
        <div className="questions-header">
          <h3>Le tue domande ({questions.length})</h3>
          {pendingCount > 0 && (
            <button 
              onClick={handleApproveAllPending}
              className="btn btn-success approve-all-btn"
              disabled={loading}
              title={`Approva tutte le ${pendingCount} domande in sospeso`}
            >
              {loading ? 'Approvazione...' : `✓ Approva tutte (${pendingCount})`}
            </button>
          )}
        </div>
        {questions.map(question => (
          <div key={question._id} className="question-item">
            <div className="question-header">
              <span className={`status ${question.approved ? 'approved' : 'pending'}`}>
                {question.approved ? '✓ Approvata' : '⏳ In attesa'}
              </span>
              <span className="type">{question.type}</span>
              <span className="category">{question.category}</span>
              <span className="difficulty">Difficoltà: {question.difficulty}</span>
            </div>
            <div className="question-content">
              <p><strong>Domanda:</strong> {question.question}</p>
              <p><strong>Livello:</strong> {question.schoolLevel} - Classe {question.class}</p>
              
              {/* Dettagli specifici per tipo di domanda */}
              {question.type === 'quiz' && question.options && (
                <div className="question-details">
                  <div className="options-compact">
                    <span className="detail-label">Opzioni:</span>
                    {question.options.slice(0, 6).map((option, index) => (
                      <span 
                        key={index} 
                        className={`option-compact ${option === question.answer ? 'correct' : ''}`}
                      >
                        {option === question.answer ? '✓ ' : ''}{option}
                      </span>
                    ))}
                    {question.options.length > 6 && (
                      <span className="option-compact more-options">
                        +{question.options.length - 6} altre...
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {question.type === 'sorting' && question.items && (
                <div className="question-details">
                  <span className="detail-label">Elementi:</span>
                  <span className="items-compact">
                    {question.items.join(' • ')}
                  </span>
                </div>
              )}
              
              {question.type === 'matching' && question.pairs && (
                <div className="question-details">
                  <span className="detail-label">Coppie:</span>
                  <span className="pairs-compact">
                    {question.pairs.map((pair, index) => (
                      <span key={index} className="pair-compact">
                        {pair.left} ↔ {pair.right}
                      </span>
                    )).slice(0, 3).concat(question.pairs.length > 3 ? ['...'] : [])}
                  </span>
                </div>
              )}
              
              {question.type === 'memory' && question.memoryPairs && (
                <div className="question-details">
                  <span className="detail-label">Coppie Memory:</span>
                  <span className="pairs-compact">
                    {question.memoryPairs.map((pair, index) => (
                      <span key={index} className="pair-compact">
                        {pair.front} ↔ {pair.back}
                      </span>
                    )).slice(0, 3).concat(question.memoryPairs.length > 3 ? ['...'] : [])}
                  </span>
                </div>
              )}
            </div>
            <div className="question-actions">
              {!question.approved && (
                <button 
                  onClick={() => handleApproveQuestion(question._id)}
                  className="btn btn-success btn-sm"
                >
                  Approva
                </button>
              )}
              <button 
                onClick={() => handleDeleteQuestion(question._id)}
                className="btn btn-danger btn-sm"
              >
                Elimina
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (user?.role !== 'docente') {
    return (
      <div className="teacher-panel">
        <div className="error-message">
          <h2>Accesso Negato</h2>
          <p>Solo i docenti possono accedere a questa pagina.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-panel">
      <div className="panel-header">
        <h1>Pannello Docente</h1>
        <p>Genera e gestisci domande per i tuoi studenti</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="panel-content">
        <div className="request-section">
          <h2>Richiedi Nuova Domanda</h2>
          <form onSubmit={handleRequestQuestion} className="request-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Tipo di Domanda</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="quiz">Quiz</option>
                  <option value="sorting">Sorting</option>
                  <option value="matching">Matching</option>
                  <option value="memory">Memory</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="category">Categoria</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="matematica">Matematica</option>
                  <option value="italiano">Italiano</option>
                  <option value="storia">Storia</option>
                  <option value="scienze">Scienze</option>
                  <option value="geografia">Geografia</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="schoolLevel">Livello Scolastico</label>
                <select
                  id="schoolLevel"
                  name="schoolLevel"
                  value={formData.schoolLevel}
                  onChange={handleInputChange}
                  required
                >
                  <option value="prim">Scuola Primaria</option>
                  <option value="sec1">Scuola Secondaria di Primo Grado</option>
                  <option value="sec2">Scuola Secondaria di Secondo Grado</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="class">Classe</label>
                <select
                  id="class"
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  required
                >
                  {formData.schoolLevel === 'prim' && (
                    <>
                      <option value="1">Prima</option>
                      <option value="2">Seconda</option>
                      <option value="3">Terza</option>
                      <option value="4">Quarta</option>
                      <option value="5">Quinta</option>
                    </>
                  )}
                  {formData.schoolLevel === 'sec1' && (
                    <>
                      <option value="1">Prima</option>
                      <option value="2">Seconda</option>
                      <option value="3">Terza</option>
                    </>
                  )}
                  {formData.schoolLevel === 'sec2' && (
                    <>
                      <option value="1">Prima</option>
                      <option value="2">Seconda</option>
                      <option value="3">Terza</option>
                      <option value="4">Quarta</option>
                      <option value="5">Quinta</option>
                    </>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="difficulty">Difficoltà</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading ? 'Generazione domanda con SAGE...' : 'Genera Domanda con SAGE'}
            </button>
          </form>
        </div>

        {renderQuestionPreview()}

        {renderQuestionsList()}
      </div>
    </div>
  );
} 