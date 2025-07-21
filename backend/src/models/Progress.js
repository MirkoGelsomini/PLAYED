const mongoose = require('mongoose');
const { Schema } = mongoose;

const progressSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  game: { type: String, required: true }, 
  sessionId: { type: String, required: true },
  score: { type: Number, required: true },
  level: { type: Number, required: true }, // livello o difficoltà
  completed: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  details: { type: Schema.Types.Mixed }, 
  answeredQuestions: [{ type: String }], // ID delle domande a cui si è risposto
});

module.exports = mongoose.model('Progress', progressSchema); 