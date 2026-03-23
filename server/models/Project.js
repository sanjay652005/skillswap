const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, maxlength: 2000 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'contributor', 'viewer'], default: 'contributor' },
    joinedAt: { type: Date, default: Date.now }
  }],
  techStack: [{ type: String, trim: true }],
  skillsNeeded: [{ type: String, trim: true }],
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'archived'],
    default: 'open'
  },
  githubRepo: { type: String, default: '' },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectWorkspace' },
  invites: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    sentAt: { type: Date, default: Date.now }
  }],
  // Join requests: non-members requesting to join
  joinRequests: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    sentAt: { type: Date, default: Date.now }
  }],
  isPublic: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
