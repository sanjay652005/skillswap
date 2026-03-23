const router = require('express').Router();
const { getLeaderboard, getMyStats, getLevels } = require('../controllers/gamificationController');
const auth = require('../middleware/auth');

router.get('/leaderboard', auth, getLeaderboard);
router.get('/me',          auth, getMyStats);
router.get('/levels',      auth, getLevels);

module.exports = router;
