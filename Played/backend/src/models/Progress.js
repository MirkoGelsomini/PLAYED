const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Modello per gestire i progressi degli utenti
 */

const progressSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  game: { type: String, required: true }, 
  sessionId: { type: String, required: true },
  score: { type: Number, required: true },
  level: { type: Number, required: true }, 
  completed: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  details: { type: Schema.Types.Mixed }, 
  answeredQuestions: [{ type: String }], 
  wrongAnsweredQuestions: [{ type: String }],
  maxUnlockedLevel: { type: Number, default: 1 },
  correctAnswersPerLevel: { type: Schema.Types.Mixed, default: {} },
});

module.exports = mongoose.model('Progress', progressSchema); 