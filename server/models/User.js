const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  username: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  bio: { type: String, default: '', maxlength: 500 },
  avatar: { type: String, default: '' },
  skillsOffered: [{ type: String, trim: true }],
  skillsWanted:  [{ type: String, trim: true }],
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'weekends', 'evenings', 'flexible'],
    default: 'flexible'
  },
  githubLink:   { type: String, default: '' },
  linkedinLink: { type: String, default: '' },
  leetcodeLink: { type: String, default: '' },
  isOnline:  { type: Boolean, default: false },
  lastSeen:  { type: Date, default: Date.now },
  socketId:  { type: String, default: '' },
  rating:    { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },

  // ── Gamification (optional - feature on hold) ─────────────────
  xp:    { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: { type: Array, default: [] },
  stats: {
    type: Object, default: () => ({
      exchangesCompleted: 0,
      projectsCompleted: 0,
      complimentsGiven: 0,
      complimentsReceived: 0,
      joinRequestsAccepted: 0,
      loginStreak: 0
    })
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(p) {
  return bcrypt.compare(p, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
