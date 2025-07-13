const mongoose = require('mongoose');

const userObjectiveSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  objectiveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Objective',
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  rewardClaimed: {
    type: Boolean,
    default: false
  },
  claimedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indice composto per evitare duplicati
userObjectiveSchema.index({ userId: 1, objectiveId: 1 }, { unique: true });

module.exports = mongoose.model('UserObjective', userObjectiveSchema); 