const express = require('express');
const router = express.Router();
const TrophyController = require('../controllers/trophyController');
const { authenticateToken } = require('../utils/authMiddleware');
const TrophyService = require('../services/trophyService');

// Endpoint di test per verificare lo stato dei modelli
router.get('/test', authenticateToken, (req, res) => {
  try {
    const models = {
      Trophy: require('../models/Trophy'),
      UserTrophy: require('../models/UserTrophy'),
      Objective: require('../models/Objective'),
      UserObjective: require('../models/UserObjective'),
      Progress: require('../models/Progress'),
      User: require('../models/user')
    };

    const modelStatus = {};
    for (const [name, model] of Object.entries(models)) {
      modelStatus[name] = {
        exists: !!model,
        type: typeof model,
        isModel: model && typeof model === 'function'
      };
    }

    res.json({
      success: true,
      message: 'Test endpoint funzionante',
      models: modelStatus,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel test endpoint',
      error: error.message
    });
  }
});



// Applica middleware di autenticazione a tutte le routes
router.use(authenticateToken);

// Ottieni trofei dell'utente
router.get('/trophies', TrophyController.getUserTrophies);

// Ottieni obiettivi attivi
router.get('/objectives', TrophyController.getUserObjectives);

// Ottieni statistiche complete
router.get('/stats', TrophyController.getUserStats);

// Controlla e assegna nuovi trofei
router.post('/check-trophies', TrophyController.checkTrophies);

// Aggiorna progresso obiettivi
router.post('/update-progress', TrophyController.updateObjectiveProgress);

// Riscatta ricompensa obiettivo
router.post('/claim-reward', TrophyController.claimObjectiveReward);

// Ottieni leaderboard
router.get('/leaderboard', TrophyController.getLeaderboard);

module.exports = router; 