const router   = require('express').Router();
const { passport } = require('../utils/passport');
const jwt      = require('jsonwebtoken');
const { register, login, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login',    login);
router.get('/me',        auth, getMe);

// ── Google OAuth ──────────────────────────────────────────────────
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`, session: false }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { userId: req.user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/google/success?token=${token}`);
  }
);

module.exports = router;