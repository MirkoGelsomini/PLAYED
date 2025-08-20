const Question = require('../models/Question');
const axios = require('axios');

/**
 * Servizio per gestire le domande del database
 */

class QuestionService {

  // Richiede una domanda al sistema SAGE
  async requestFromSage(requestData) {
    try {
      const sageUrl = process.env.SAGE_URL;
      
      const response = await axios.post(sageUrl, {
        type: requestData.type,
        category: requestData.category,
        classe: requestData.schoolLevel,
        anno: requestData.class,
        difficulty: requestData.difficulty
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 100000 
      });

      return response.data;
    } catch (error) {
      console.error('Errore nella richiesta a SAGE:', error.message);
      throw new Error(`Errore nella richiesta a SAGE: ${error.message}`);
    }
  }

  // Salva una domanda nel database
  async saveQuestion(questionData, createdBy) {
    try {
      // Aggiungi i campi necessari
      const question = new Question({
        ...questionData,
        createdBy,
        approved: false
      });

      const savedQuestion = await question.save();
      return savedQuestion;
    } catch (error) {
      console.error('Errore nel salvataggio della domanda:', error.message);
      throw new Error(`Errore nel salvataggio della domanda: ${error.message}`);
    }
  }

  // Approva una domanda
  async approveQuestion(questionId, approvedBy) {
    try {
      const question = await Question.findByIdAndUpdate(
        questionId,
        {
          approved: true,
          approvedBy,
          approvedAt: new Date()
        },
        { new: true }
      );

      if (!question) {
        throw new Error('Domanda non trovata');
      }

      return question;
    } catch (error) {
      console.error('Errore nell\'approvazione della domanda:', error.message);
      throw new Error(`Errore nell'approvazione della domanda: ${error.message}`);
    }
  }

  
  // Ottiene le domande filtrate per school level e classe
  async getQuestionsBySchoolLevel(schoolLevel, classLevel, type = null, category = null, minDifficulty = 1, maxDifficulty = 10) {
    try {
      const filter = {
        approved: true,
        schoolLevel,
        class: classLevel,
        difficulty: { $gte: minDifficulty, $lte: maxDifficulty }
      };

      if (type) filter.type = type;
      if (category) filter.category = category;

      const questions = await Question.find(filter)
        .sort({ difficulty: 1, createdAt: -1 })
        .populate('createdBy', 'name email');

      return questions;
    } catch (error) {
      console.error('Errore nel recupero delle domande:', error.message);
      throw new Error(`Errore nel recupero delle domande: ${error.message}`);
    }
  }

  // Ottiene tutte le domande di un docente
  async getQuestionsByTeacher(createdBy, approvedOnly = false) {
    try {
      const filter = { createdBy };
      if (approvedOnly) filter.approved = true;

      const questions = await Question.find(filter)
        .sort({ createdAt: -1 })
        .populate('approvedBy', 'name email');

      return questions;
    } catch (error) {
      console.error('Errore nel recupero delle domande del docente:', error.message);
      throw new Error(`Errore nel recupero delle domande del docente: ${error.message}`);
    }
  }

  // Ottiene una domanda per ID
  async getQuestionById(questionId) {
    try {
      const question = await Question.findById(questionId)
        .populate('createdBy', 'name email')
        .populate('approvedBy', 'name email');

      if (!question) {
        throw new Error('Domanda non trovata');
      }

      return question;
    } catch (error) {
      console.error('Errore nel recupero della domanda:', error.message);
      throw new Error(`Errore nel recupero della domanda: ${error.message}`);
    }
  }

  // Elimina una domanda
  async deleteQuestion(questionId, createdBy) {
    try {
      const question = await Question.findOneAndDelete({
        _id: questionId,
        createdBy
      });

      if (!question) {
        throw new Error('Domanda non trovata o non autorizzato');
      }

      return true;
    } catch (error) {
      console.error('Errore nell\'eliminazione della domanda:', error.message);
      throw new Error(`Errore nell'eliminazione della domanda: ${error.message}`);
    }
  }

  // Approva tutte le domande in sospeso di un docente
  async approveAllPendingQuestions(createdBy, approvedBy) {
    try {
      const result = await Question.updateMany(
        {
          createdBy,
          approved: false
        },
        {
          approved: true,
          approvedBy,
          approvedAt: new Date()
        }
      );

      return {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      };
    } catch (error) {
      console.error('Errore nell\'approvazione multipla delle domande:', error.message);
      throw new Error(`Errore nell'approvazione multipla delle domande: ${error.message}`);
    }
  }

  // Converte una risposta SAGE in formato compatibile con il nostro database
  convertSageResponse(sageResponse, schoolLevel, classLevel) {
    const { status, data } = sageResponse;
    
    if (status !== 1 || !data) {
      throw new Error(`Risposta SAGE non valida - Status: ${status}`);
    }

      const convertedData = {
      type: data.type,
      category: data.category,
      question: data.question,
      difficulty: data.difficulty,
      schoolLevel,
      class: classLevel
    };

    // Aggiungi campi specifici per tipo
    switch (data.type) {
      case 'quiz':
        convertedData.options = data.options;
        convertedData.answer = data.answer;
        break;
      case 'sorting':
        convertedData.items = data.items;
        convertedData.solution = data.solution;
        break;
      case 'matching':
        convertedData.pairs = data.pairs;
        break;
      case 'memory':
          convertedData.memoryPairs = Array.isArray(data.memoryPairs) ? data.memoryPairs : data.pairs;
        break;
      default:
        throw new Error(`Tipo di domanda non supportato: ${data.type}`);
    }

    return convertedData;
  }
}

module.exports = new QuestionService(); 