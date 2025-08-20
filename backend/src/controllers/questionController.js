const questionService = require('../services/questionService');
const mongoose = require('mongoose');
const { 
  QUESTION_CONSTRAINTS,
  validateQuestionData,
  validateQuestionType,
  validateQuestionCategory,
  validateQuestionSchoolLevel,
  validateQuestionClass,
} = require('../../../shared/constraints');

/**
 * Controller per gestire le domande
 */

class QuestionController {
  /**
   * Richiede una domanda al sistema SAGE
   * POST /api/questions/request
   */
  async requestFromSage(req, res) {
    try {
      const { type, category, schoolLevel, class: classLevel, difficulty } = req.body;

      // Validazione input usando le costanti centralizzate
      const requestData = {
        type,
        category,
        schoolLevel,
        class: classLevel,
        difficulty,
        question: 'placeholder' // Aggiungiamo un placeholder per la validazione
      };

      const validation = validateQuestionData(requestData);
      if (!validation.isValid) {
        return res.status(400).json({
          error: validation.errors.join('; ')
        });
      }

      // Richiesta a SAGE
      const sageResponse = await questionService.requestFromSage({
        type,
        category,
        schoolLevel,
        class: classLevel,
        difficulty
      });

      
      // Controlla se la risposta ha la struttura prevista
      if (!sageResponse || typeof sageResponse !== 'object') {
        console.error('Risposta SAGE non è un oggetto valido');
        return res.status(500).json({
          success: false,
          message: 'Risposta non valida dal sistema SAGE',
          data: sageResponse
        });
      }
      
      const { status, data } = sageResponse;
      
      let message;
      let success = true;
      
      // Converti lo status in numero se è una stringa
      const statusNum = parseInt(status);
      
      switch (statusNum) {
        case 1:
          message = 'Domanda richiesta con successo';
          break;
        case 2:
          message = 'Fonti non disponibili per questa richiesta';
          success = false;
          break;
        case 3:
          message = 'Il sistema LLM non ha risposto o errore nel parsing della risposta';
          success = false;
          break;
        case 4:
          message = 'Input non valido fornito al sistema SAGE';
          success = false;
          break;
        case 5:
          message = 'Errore interno del server SAGE';
          success = false;
          break;
        default:
          message = `Status code sconosciuto dalla risposta di SAGE: ${status} (tipo: ${typeof status})`;
          success = false;
      }

      res.json({
        success,
        message,
        data: sageResponse,
        sageStatus: statusNum
      });

    } catch (error) {
      console.error('Errore nella richiesta a SAGE:', error);
      res.status(500).json({
        error: error.message || 'Errore nella richiesta a SAGE'
      });
    }
  }

  /**
   * Salva una domanda nel database
   * POST /api/questions
   */
  async saveQuestion(req, res) {
    try {
      const questionData = req.body;
      const userId = req.user.id;

      // Validazione usando le costanti centralizzate
      const validation = validateQuestionData(questionData);
      if (!validation.isValid) {
        return res.status(400).json({
          error: validation.errors.join('; ')
        });
      }

      // Salva la domanda
      const savedQuestion = await questionService.saveQuestion(questionData, userId);

      res.status(201).json({
        success: true,
        message: 'Domanda salvata con successo',
        data: savedQuestion
      });

    } catch (error) {
      console.error('Errore nel salvataggio della domanda:', error);
      res.status(500).json({
        error: error.message || 'Errore nel salvataggio della domanda'
      });
    }
  }

  /**
   * Approva una domanda
   * PUT /api/questions/:id/approve
   */
  async approveQuestion(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!id) {
        return res.status(400).json({
          error: 'ID domanda richiesto'
        });
      }

      // Validazione ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          error: 'ID domanda non valido'
        });
      }

      const approvedQuestion = await questionService.approveQuestion(id, userId);

      res.json({
        success: true,
        message: 'Domanda approvata con successo',
        data: approvedQuestion
      });

    } catch (error) {
      console.error('Errore nell\'approvazione della domanda:', error);
      res.status(500).json({
        error: error.message || 'Errore nell\'approvazione della domanda'
      });
    }
  }

  /**
   * Ottiene le domande per school level e classe
   * GET /api/questions/school-level
   */
  async getQuestionsBySchoolLevel(req, res) {
    try {
      const { schoolLevel, class: classLevel, type, category, minDifficulty, maxDifficulty } = req.query;

      // Validazione parametri obbligatori
      if (!schoolLevel || !classLevel) {
        return res.status(400).json({
          error: 'Parametri obbligatori: schoolLevel, class'
        });
      }

      // Validazione school level
      if (!validateQuestionSchoolLevel(schoolLevel)) {
        return res.status(400).json({
          error: `School level non valido. Valori ammessi: ${QUESTION_CONSTRAINTS.SCHOOL_LEVEL.VALID_VALUES.join(', ')}`
        });
      }

      // Validazione classe
      if (!validateQuestionClass(schoolLevel, classLevel)) {
        const validClasses = QUESTION_CONSTRAINTS.CLASS.VALID_VALUES[schoolLevel];
        return res.status(400).json({
          error: `Classe ${classLevel} non valida per il livello scolastico ${schoolLevel}. Valori ammessi: ${validClasses ? validClasses.join(', ') : 'nessuno'}`
        });
      }

      // Validazione tipo (opzionale)
      if (type && !validateQuestionType(type)) {
        return res.status(400).json({
          error: `Tipo non valido. Valori ammessi: ${QUESTION_CONSTRAINTS.TYPES.VALID_VALUES.join(', ')}`
        });
      }

      // Validazione categoria (opzionale)
      if (category && !validateQuestionCategory(category)) {
        return res.status(400).json({
          error: `Categoria non valida. Valori ammessi: ${QUESTION_CONSTRAINTS.CATEGORIES.VALID_VALUES.join(', ')}`
        });
      }

      // Conversione e validazione difficoltà
      const minDiff = minDifficulty ? parseInt(minDifficulty) : QUESTION_CONSTRAINTS.DIFFICULTY.MIN;
      const maxDiff = maxDifficulty ? parseInt(maxDifficulty) : QUESTION_CONSTRAINTS.DIFFICULTY.MAX;

      if (minDiff < QUESTION_CONSTRAINTS.DIFFICULTY.MIN || minDiff > QUESTION_CONSTRAINTS.DIFFICULTY.MAX) {
        return res.status(400).json({
          error: `Difficoltà minima deve essere tra ${QUESTION_CONSTRAINTS.DIFFICULTY.MIN} e ${QUESTION_CONSTRAINTS.DIFFICULTY.MAX}`
        });
      }

      if (maxDiff < QUESTION_CONSTRAINTS.DIFFICULTY.MIN || maxDiff > QUESTION_CONSTRAINTS.DIFFICULTY.MAX) {
        return res.status(400).json({
          error: `Difficoltà massima deve essere tra ${QUESTION_CONSTRAINTS.DIFFICULTY.MIN} e ${QUESTION_CONSTRAINTS.DIFFICULTY.MAX}`
        });
      }

      if (minDiff > maxDiff) {
        return res.status(400).json({
          error: 'La difficoltà minima non può essere maggiore di quella massima'
        });
      }

      const questions = await questionService.getQuestionsBySchoolLevel(
        schoolLevel,
        classLevel,
        type,
        category,
        minDiff,
        maxDiff
      );

      res.json({
        success: true,
        data: questions,
        count: questions.length
      });

    } catch (error) {
      console.error('Errore nel recupero delle domande:', error);
      res.status(500).json({
        error: error.message || 'Errore nel recupero delle domande'
      });
    }
  }

  /**
   * Ottiene le domande di un docente
   * GET /api/questions/teacher
   */
  async getQuestionsByTeacher(req, res) {
    try {
      const userId = req.user.id;
      const { approvedOnly } = req.query;

      const questions = await questionService.getQuestionsByTeacher(
        userId,
        approvedOnly === 'true'
      );

      res.json({
        success: true,
        data: questions,
        count: questions.length
      });

    } catch (error) {
      console.error('Errore nel recupero delle domande del docente:', error);
      res.status(500).json({
        error: error.message || 'Errore nel recupero delle domande del docente'
      });
    }
  }

  /**
   * Ottiene una domanda per ID
   * GET /api/questions/:id
   */
  async getQuestionById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          error: 'ID domanda richiesto'
        });
      }

      // Validazione ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          error: 'ID domanda non valido'
        });
      }

      const question = await questionService.getQuestionById(id);

      res.json({
        success: true,
        data: question
      });

    } catch (error) {
      console.error('Errore nel recupero della domanda:', error);
      res.status(500).json({
        error: error.message || 'Errore nel recupero della domanda'
      });
    }
  }

  /**
   * Elimina una domanda
   * DELETE /api/questions/:id
   */
  async deleteQuestion(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!id) {
        return res.status(400).json({
          error: 'ID domanda richiesto'
        });
      }

      // Validazione ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          error: 'ID domanda non valido'
        });
      }

      await questionService.deleteQuestion(id, userId);

      res.json({
        success: true,
        message: 'Domanda eliminata con successo'
      });

    } catch (error) {
      console.error('Errore nell\'eliminazione della domanda:', error);
      res.status(500).json({
        error: error.message || 'Errore nell\'eliminazione della domanda'
      });
    }
  }

  /**
   * Approva tutte le domande in sospeso
   * PUT /api/questions/approve-all
   */
  async approveAllPendingQuestions(req, res) {
    try {
      const userId = req.user.id;

      const result = await questionService.approveAllPendingQuestions(userId, userId);

      res.json({
        success: true,
        message: `${result.modifiedCount} domande approvate con successo`,
        data: {
          approvedCount: result.modifiedCount,
          totalPendingFound: result.matchedCount
        }
      });

    } catch (error) {
      console.error('Errore nell\'approvazione multipla delle domande:', error);
      res.status(500).json({
        error: error.message || 'Errore nell\'approvazione multipla delle domande'
      });
    }
  }
}

module.exports = new QuestionController(); 