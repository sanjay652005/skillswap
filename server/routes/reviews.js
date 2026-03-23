const router = require('express').Router();
const { createReview, getUserReviews } = require('../controllers/reviewsController');
const auth = require('../middleware/auth');

router.post('/', auth, createReview);
router.get('/user/:userId', auth, getUserReviews);

module.exports = router;
