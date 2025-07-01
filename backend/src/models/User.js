const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['allievo', 'docente'], required: true },
  // Campi specifici per Allievo
  age: { type: Number },
  schoolLevel: { type: String }, // es: primaria, secondaria di primo grado, ecc.
  learningProfile: { type: String }, // es: preferenze, BES, ecc.
  class: { type: String }, // es: 3A, 2B, ecc.
  // Campi specifici per Docente
  subjects: [{ type: String }], // es: ['Matematica', 'Scienze']
  school: { type: String },
  teachingLevel: { type: String }, // es: primaria, secondaria di primo grado, ecc.
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 