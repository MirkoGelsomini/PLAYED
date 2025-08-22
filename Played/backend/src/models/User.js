const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['allievo', 'docente'], required: true },
  // Campi specifici per Allievo
  schoolLevel: { 
    type: String, 
    enum: ['prim', 'sec1', 'sec2']
  },
  class: { type: String }, // es: 1, 2, 3, 4, 5
  // Campi specifici per Docente
  subjects: [{ type: String }], // es: ['Matematica', 'Scienze']
  school: { type: String },
  teachingLevel: { type: String }, // es: primaria, secondaria di primo grado, ecc.
  avatar: { type: String, default: '' }, // URL o nome file dell'avatar
  // Campi per sistema di trofei e statistiche
  totalPoints: { type: Number, default: 0 },
  gamesCompleted: { type: Number, default: 0 },
  dailyStreak: { type: Number, default: 0 },
  lastPlayedDate: { type: Date },
  trophyCount: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  experienceToNextLevel: { type: Number, default: 100 } // Questo sarà aggiornato dinamicamente
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 