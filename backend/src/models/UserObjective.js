const mongoose = require('mongoose');

const userObjectiveSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  objectiveId: {
    type: String, // ID statico definito in shared/constraints
    required: true
  },
  type: {
    type: String,
    required: true
  },
  periodKey: {
    type: String,
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

// Indice composto per evitare duplicati nello stesso periodo
userObjectiveSchema.index({ userId: 1, objectiveId: 1, periodKey: 1 }, { unique: true });

module.exports = mongoose.model('UserObjective', userObjectiveSchema); 