const mongoose = require('mongoose');

const userTrophySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trophyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trophy',
    required: true
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indice composto per evitare duplicati
userTrophySchema.index({ userId: 1, trophyId: 1 }, { unique: true });

module.exports = mongoose.model('UserTrophy', userTrophySchema); 