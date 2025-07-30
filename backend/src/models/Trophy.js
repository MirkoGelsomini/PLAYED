const mongoose = require('mongoose');

const trophySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['achievement', 'milestone', 'special', 'seasonal', 'challenge', 'level'],
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary', 'mythic'],
    required: true
  },
  points: {
    type: Number,
    required: true,
    default: 0
  },
  requirements: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  unlockedAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Trophy', trophySchema); 