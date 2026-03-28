const router = require('express').Router();
const { getAllUsers, getUserById, updateProfile, getOnlineUsers, getSuggestions, getPublicStats } = require('../controllers/usersController');
const auth = require('../middleware/auth');

router.get('/stats', getPublicStats); // public - no auth
router.get('/', auth, getAllUsers);
router.get('/online', auth, getOnlineUsers);
router.get('/suggestions', auth, getSuggestions);
router.get('/:id', auth, getUserById);
router.put('/profile', auth, updateProfile);

module.exports = router;