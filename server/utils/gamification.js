const User = require('../models/User');

const XP = {
  EXCHANGE_COMPLETED:     100,
  PROJECT_COMPLETED:      150,
  COMPLIMENT_RECEIVED:     30,
  COMPLIMENT_GIVEN:        10,
  JOIN_REQUEST_ACCEPTED:   20,
  PROFILE_COMPLETE:        50,
  LOGIN_STREAK_3:          25,
  LOGIN_STREAK_7:          75,
};

const LEVELS = [
  { level: 1, xp: 0,    title: 'Newcomer',     color: '#6b7280' },
  { level: 2, xp: 100,  title: 'Explorer',     color: '#34d399' },
  { level: 3, xp: 300,  title: 'Contributor',  color: '#60a5fa' },
  { level: 4, xp: 600,  title: 'Builder',      color: '#a78bfa' },
  { level: 5, xp: 1000, title: 'Collaborator', color: '#f59e0b' },
  { level: 6, xp: 1500, title: 'Expert',       color: '#ef4444' },
  { level: 7, xp: 2500, title: 'Mentor',       color: '#ec4899' },
  { level: 8, xp: 4000, title: 'Legend',       color: '#8b5cf6' },
];

const BADGES = [
  { id: 'first_exchange',  name: 'First Exchange',   icon: '🤝', desc: 'Complete your first skill exchange', check: s => s.exchangesCompleted >= 1 },
  { id: 'exchange_5',      name: 'Exchange Pro',      icon: '⚡', desc: 'Complete 5 skill exchanges',         check: s => s.exchangesCompleted >= 5 },
  { id: 'exchange_10',     name: 'Exchange Master',   icon: '🏅', desc: 'Complete 10 skill exchanges',        check: s => s.exchangesCompleted >= 10 },
  { id: 'first_project',   name: 'Project Starter',   icon: '🚀', desc: 'Complete your first project',        check: s => s.projectsCompleted >= 1 },
  { id: 'project_5',       name: 'Project Builder',   icon: '🏗️', desc: 'Complete 5 projects',               check: s => s.projectsCompleted >= 5 },
  { id: 'team_player',     name: 'Team Player',       icon: '👥', desc: 'Get accepted into 3 projects',       check: s => s.joinRequestsAccepted >= 3 },
  { id: 'kind_words',      name: 'Kind Words',        icon: '💛', desc: 'Give 5 compliments',                 check: s => s.complimentsGiven >= 5 },
  { id: 'well_reviewed',   name: 'Well Reviewed',     icon: '⭐', desc: 'Receive 5 compliments',             check: s => s.complimentsReceived >= 5 },
  { id: 'popular',         name: 'Popular',           icon: '🌟', desc: 'Receive 10 compliments',            check: s => s.complimentsReceived >= 10 },
  { id: 'streak_3',        name: 'On a Roll',         icon: '🔥', desc: '3-day login streak',                check: s => (s.loginStreak||0) >= 3 },
  { id: 'streak_7',        name: 'Week Warrior',      icon: '💪', desc: '7-day login streak',                check: s => (s.loginStreak||0) >= 7 },
  { id: 'level_5',         name: 'High Achiever',     icon: '🎯', desc: 'Reach level 5',                     check: (s,u) => (u.level||1) >= 5 },
  { id: 'level_8',         name: 'Legend Status',     icon: '👑', desc: 'Reach max level',                   check: (s,u) => (u.level||1) >= 8 },
];

const getLevelInfo = (xp = 0) => {
  let current = LEVELS[0];
  for (const l of LEVELS) { if (xp >= l.xp) current = l; else break; }
  const nextIdx = LEVELS.findIndex(l => l.level === current.level) + 1;
  const next = LEVELS[nextIdx] || null;
  const progress = next ? Math.round(((xp - current.xp) / (next.xp - current.xp)) * 100) : 100;
  return { ...current, next, progress, xpForNext: next ? next.xp - xp : 0 };
};

const awardXP = async (userId, action, io = null) => {
  try {
    const amount = XP[action];
    if (!amount) return;
    const user = await User.findById(userId);
    if (!user) return;
    const oldLevel = user.level || 1;
    user.xp = (user.xp || 0) + amount;
    const info = getLevelInfo(user.xp);
    user.level = info.level;

    // Check badges
    const newBadges = [];
    const existingIds = new Set((user.badges || []).map(b => b.id));
    for (const badge of BADGES) {
      if (!existingIds.has(badge.id) && badge.check(user.stats || {}, user)) {
        if (!user.badges) user.badges = [];
        user.badges.push({ id: badge.id, name: badge.name, icon: badge.icon, desc: badge.desc });
        newBadges.push(badge);
      }
    }
    await user.save();

    if (io && user.socketId) {
      io.to(user.socketId).emit('xp_gained', {
        amount, total: user.xp, action,
        leveledUp: user.level > oldLevel,
        newLevel: user.level > oldLevel ? user.level : null,
        levelTitle: info.title, newBadges
      });
    }
    return { xp: user.xp, level: user.level, newBadges };
  } catch (err) { console.error('awardXP:', err.message); }
};

const incrementStat = async (userId, statKey, action, io = null) => {
  try {
    await User.findByIdAndUpdate(userId, { $inc: { [`stats.${statKey}`]: 1 } });
    return await awardXP(userId, action, io);
  } catch (err) { console.error('incrementStat:', err.message); }
};

module.exports = { awardXP, incrementStat, getLevelInfo, LEVELS, BADGES, XP };
