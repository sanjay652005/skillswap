const router = require('express').Router();
const { chat, getSuggestions, getLearningPath, reviewCode } = require('../controllers/aiController');
const auth = require('../middleware/auth');

router.post('/chat',          auth, chat);
router.get('/suggestions',    auth, getSuggestions);
router.post('/learning-path', auth, getLearningPath);
router.post('/review-code',   auth, reviewCode);

module.exports = router;
