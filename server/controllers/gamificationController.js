const User = require('../models/User');
const { getLevelInfo, LEVELS, BADGES } = require('../utils/gamification');

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({})
      .select('name xp level badges stats rating reviewCount')
      .sort({ xp: -1 })
      .limit(50);

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      _id: u._id,
      name: u.name,
      xp: u.xp || 0,
      level: u.level || 1,
      levelInfo: getLevelInfo(u.xp || 0),
      badgeCount: (u.badges || []).length,
      topBadges: (u.badges || []).slice(-3),
      stats: u.stats || {},
      rating: u.rating || 0,
    }));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('name xp level badges stats rating reviewCount');

    const levelInfo = getLevelInfo(user.xp || 0);

    // Rank
    const rank = await User.countDocuments({ xp: { $gt: user.xp || 0 } }) + 1;

    res.json({
      xp: user.xp || 0,
      level: user.level || 1,
      levelInfo,
      rank,
      badges: user.badges || [],
      allBadges: BADGES.map(b => ({
        ...b,
        earned: (user.badges || []).some(ub => ub.id === b.id),
        earnedAt: (user.badges || []).find(ub => ub.id === b.id)?.earnedAt
      })),
      stats: user.stats || {},
      rating: user.rating || 0,
      reviewCount: user.reviewCount || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLevels = async (req, res) => {
  res.json(LEVELS);
};
