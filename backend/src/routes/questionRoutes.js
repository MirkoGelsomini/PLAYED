const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticateToken } = require('../utils/authMiddleware');

// Middleware per verificare che l'utente sia un docente
const requireTeacher = (req, res, next) => {
  if (req.user.role !== 'docente') {
    return res.status(403).json({ error: 'Accesso negato. Solo i docenti possono accedere a questa funzionalità.' });
  }
  next();
};

/**
 * Rotte per le domande
 */

// Richiedi una domanda al sistema SAGE
// POST /api/questions/request
router.post('/request', authenticateToken, requireTeacher, questionController.requestFromSage);

// Salva una domanda nel database
// POST /api/questions
router.post('/', authenticateToken, requireTeacher, questionController.saveQuestion);

// Approva una domanda
// PUT /api/questions/:id/approve
router.put('/:id/approve', authenticateToken, requireTeacher, questionController.approveQuestion);

// Approva tutte le domande in sospeso
// PUT /api/questions/approve-all
router.put('/approve-all', authenticateToken, requireTeacher, questionController.approveAllPendingQuestions);

// Ottieni le domande di un docente
// GET /api/questions/teacher
router.get('/teacher', authenticateToken, requireTeacher, questionController.getQuestionsByTeacher);

// Elimina una domanda
// DELETE /api/questions/:id
router.delete('/:id', authenticateToken, requireTeacher, questionController.deleteQuestion);

// ============================================================================
// ROTTE PER ALLIEVI (richiedono solo autenticazione)
// ============================================================================

// Ottieni le domande per school level e classe (DEVE VENIRE PRIMA DI /:id)
// GET /api/questions/school-level?schoolLevel=prim&class=1&type=quiz&category=storia&minDifficulty=1&maxDifficulty=5
router.get('/school-level', authenticateToken, questionController.getQuestionsBySchoolLevel);

// Ottieni una domanda specifica per ID (DEVE VENIRE DOPO LE ROTTE SPECIFICHE)
// GET /api/questions/:id
router.get('/:id', authenticateToken, questionController.getQuestionById);

module.exports = router; 