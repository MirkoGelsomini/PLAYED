const mongoose = require('mongoose');

const objectiveSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'special'],
    required: true
  },
  category: {
    type: String,
    enum: ['games', 'score', 'streak', 'variety', 'social'],
    required: true
  },
  target: {
    type: Number,
    required: true
  },
  reward: {
    type: {
      type: String,
      enum: ['points', 'trophy', 'badge', 'bonus'],
      required: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  }
});

module.exports = mongoose.model('Objective', objectiveSchema); 