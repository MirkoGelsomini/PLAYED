const mongoose = require('mongoose');

/**
 * Modello per gestire le domande
 */

const questionSchema = new mongoose.Schema({
  // Campi base della domanda
  type: {
    type: String,
    required: true,
    enum: ['quiz', 'sorting', 'matching', 'memory']
  },
  category: {
    type: String,
    required: true,
    enum: ['matematica', 'italiano', 'storia', 'scienze', 'geografia']
  },
  question: {
    type: String,
    required: true
  },
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  
  // Campi per school level e classe
  schoolLevel: {
    type: String,
    required: true,
    enum: ['prim', 'sec1', 'sec2']
  },
  class: {
    type: Number,
    required: true
  },
  
  // Campi specifici per tipo di domanda
  // Per QUIZ
  options: {
    type: [String],
    required: function() { return this.type === 'quiz'; }
  },
  answer: {
    type: String,
    required: function() { return this.type === 'quiz'; }
  },
  
  // Per SORTING
  items: {
    type: [String],
    required: function() { return this.type === 'sorting'; }
  },
  solution: {
    type: [String],
    required: function() { return this.type === 'sorting'; }
  },
  
  // Per MATCHING e MEMORY
  pairs: {
    type: [{
      left: String,
      right: String
    }],
    required: function() { return this.type === 'matching'; }
  },
  
  // Per MEMORY
  memoryPairs: {
    type: [{
      front: String,
      back: String
    }],
    required: function() { return this.type === 'memory'; }
  },
  
  // Metadati
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indici per performance
questionSchema.index({ type: 1, category: 1, schoolLevel: 1, class: 1, difficulty: 1 });
questionSchema.index({ approved: 1, schoolLevel: 1, class: 1 });
questionSchema.index({ createdBy: 1 });

// Validazione per classe in base al school level
questionSchema.pre('validate', function(next) {
  const validClasses = {
    'prim': [1, 2, 3, 4, 5],
    'sec1': [1, 2, 3],
    'sec2': [1, 2, 3, 4, 5]
  };
  
  if (this.schoolLevel && this.class) {
    const allowedClasses = validClasses[this.schoolLevel];
    if (!allowedClasses || !allowedClasses.includes(this.class)) {
      return next(new Error(`Classe ${this.class} non valida per il livello scolastico ${this.schoolLevel}`));
    }
  }
  
  next();
});

module.exports = mongoose.model('Question', questionSchema); 