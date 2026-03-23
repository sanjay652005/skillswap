const User = require('../models/User');
const ExchangeRequest = require('../models/ExchangeRequest');

const normalize = s => s.toLowerCase().trim();

const AVAILABILITY_OVERLAP = {
  'full-time':  ['full-time', 'part-time', 'flexible'],
  'part-time':  ['full-time', 'part-time', 'evenings', 'weekends', 'flexible'],
  'weekends':   ['weekends', 'flexible', 'part-time'],
  'evenings':   ['evenings', 'flexible', 'part-time'],
  'flexible':   ['full-time', 'part-time', 'weekends', 'evenings', 'flexible'],
};

// ── AI Matching Engine ────────────────────────────────────────────
exports.getAIMatches = async (req, res) => {
  try {
    const me = await User.findById(req.user._id).select('-password');
    const candidates = await User.find({ _id: { $ne: me._id } }).select('-password').limit(100);

    const scored = candidates.map(u => {
      const myWanted     = (me.skillsWanted   || []).map(normalize);
      const myOffered    = (me.skillsOffered  || []).map(normalize);
      const theirOffered = (u.skillsOffered   || []).map(normalize);
      const theirWanted  = (u.skillsWanted    || []).map(normalize);

      // 1. Skill match (50%)
      const iCanLearn    = myWanted.filter(s => theirOffered.includes(s));
      const theyCanLearn = theirWanted.filter(s => myOffered.includes(s));
      const totalPossible = Math.max(myWanted.length + theirWanted.length, 1);
      const skillScore = ((iCanLearn.length + theyCanLearn.length) / totalPossible) * 100;

      // 2. Availability (20%)
      const compatible = AVAILABILITY_OVERLAP[me.availability] || [];
      const availScore = compatible.includes(u.availability) ? 100 : 30;

      // 3. Rating (20%)
      const ratingScore = ((u.rating || 0) / 5) * 100;

      // 4. Activity (10%)
      const daysSince = (Date.now() - new Date(u.lastSeen)) / (1000 * 60 * 60 * 24);
      const activityScore = Math.max(0, 100 - daysSince * 10);

      // Weighted score
      const matchScore = Math.min(99, Math.round(
        skillScore    * 0.5 +
        availScore    * 0.2 +
        ratingScore   * 0.2 +
        activityScore * 0.1
      ));

      // Reasons
      const reasons = [];
      if (iCanLearn.length > 0)    reasons.push(`You can learn ${iCanLearn.slice(0,2).join(', ')} from them`);
      if (theyCanLearn.length > 0) reasons.push(`They want to learn ${theyCanLearn.slice(0,2).join(', ')} from you`);
      if (compatible.includes(u.availability)) reasons.push(`Availability matches (${u.availability})`);
      if (u.rating >= 4)           reasons.push(`Highly rated (${u.rating.toFixed(1)}★)`);
      if (u.isOnline)              reasons.push('Currently online');
      if (reasons.length === 0)    reasons.push('Complementary skill sets');

      return { user: u, matchScore, reasons, iCanLearn, theyCanLearn };
    });

    // Sort by score, return top 10 with score > 0
    const matches = scored
      .filter(m => m.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Trust / Reputation Score ──────────────────────────────────────
exports.getTrustScore = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const exchanges = await ExchangeRequest.find({
      $or: [{ sender: userId }, { receiver: userId }]
    });

    const completed   = exchanges.filter(e => e.status === 'completed').length;
    const cancelled   = exchanges.filter(e => e.status === 'cancelled').length;
    const total       = exchanges.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

    // Trust score formula
    const ratingComponent      = ((user.rating || 0) / 5) * 40;
    const completionComponent  = completionRate * 0.35;
    const activityComponent    = Math.min(completed * 5, 15);
    const reliabilityComponent = Math.max(0, 10 - cancellationRate * 0.1);

    const trustScore = Math.min(99, Math.round(
      ratingComponent + completionComponent + activityComponent + reliabilityComponent
    ));

    // Trust level label
    let trustLevel, trustColor;
    if (trustScore >= 80)      { trustLevel = 'Elite';    trustColor = '#f59e0b'; }
    else if (trustScore >= 60) { trustLevel = 'Trusted';  trustColor = '#34d399'; }
    else if (trustScore >= 40) { trustLevel = 'Rising';   trustColor = '#60a5fa'; }
    else                       { trustLevel = 'New';      trustColor = '#94a3b8'; }

    res.json({
      trustScore,
      trustLevel,
      trustColor,
      stats: {
        totalExchanges: total,
        completedExchanges: completed,
        completionRate,
        cancellationRate,
        avgRating: user.rating || 0,
        reviewCount: user.reviewCount || 0,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
