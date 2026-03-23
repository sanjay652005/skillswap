const router = require('express').Router();
const auth   = require('../middleware/auth');
const { getAIMatches, getTrustScore } = require('../controllers/matchingController');

router.get('/matches',       auth, getAIMatches);
router.get('/trust/:id',     auth, getTrustScore);
router.get('/trust',         auth, getTrustScore);

module.exports = router;
