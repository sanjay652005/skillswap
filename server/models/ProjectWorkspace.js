const mongoose = require('mongoose');

const projectWorkspaceSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  liveCode: {
    content: { type: String, default: '// Start coding here...' },
    language: { type: String, default: 'javascript' },
    lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastEditedAt: Date
  },
  resources: [{
    title: String,
    url: String,
    type: { type: String, enum: ['link', 'file', 'code', 'note'] },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('ProjectWorkspace', projectWorkspaceSchema);
