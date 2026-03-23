const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const { skill, availability, search } = req.query;
    let query = { _id: { $ne: req.user._id } };

    if (skill) query.skillsOffered = { $in: [new RegExp(skill, 'i')] };
    if (availability) query.availability = availability;
    if (search) query.$or = [
      { name: new RegExp(search, 'i') },
      { skillsOffered: { $in: [new RegExp(search, 'i')] } },
      { skillsWanted: { $in: [new RegExp(search, 'i')] } }
    ];

    const users = await User.find(query).select('-password').limit(50);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'bio', 'skillsOffered', 'skillsWanted', 'availability', 'githubLink', 'linkedinLink', 'leetcodeLink', 'avatar'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOnlineUsers = async (req, res) => {
  try {
    const users = await User.find({ isOnline: true, _id: { $ne: req.user._id } }).select('name avatar isOnline skillsOffered');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const me = req.user;
    // Find users who offer what I want and want what I offer
    const suggestions = await User.find({
      _id: { $ne: me._id },
      $or: [
        { skillsOffered: { $in: me.skillsWanted } },
        { skillsWanted: { $in: me.skillsOffered } }
      ]
    }).select('-password').limit(10);

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Public portfolio (no auth required) ──────────────────────────
exports.getPublicPortfolio = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('-password -email -socketId');
    if (!user) return res.status(404).json({ error: 'Portfolio not found' });

    const ExchangeRequest = require('../models/ExchangeRequest');
    const Review          = require('../models/Review');
    const Project         = require('../models/Project');

    const [exchanges, reviews, projects] = await Promise.all([
      ExchangeRequest.find({
        $or: [{ sender: user._id }, { receiver: user._id }],
        status: 'completed'
      }).populate('sender receiver', 'name avatar username').limit(10),
      Review.find({ reviewed: user._id }).populate('reviewer', 'name avatar username').sort('-createdAt').limit(10),
      Project.find({ members: user._id }).select('title description status tags').limit(6)
    ]);

    res.json({ user, exchanges, reviews, projects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Check username availability ───────────────────────────────────
exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.params;
    if (!/^[a-z0-9_]{3,20}$/.test(username))
      return res.json({ available: false, reason: 'Username must be 3-20 chars, letters/numbers/underscore only' });
    const existing = await User.findOne({ username });
    res.json({ available: !existing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
