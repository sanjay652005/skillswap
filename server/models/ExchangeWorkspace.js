const mongoose = require('mongoose');

const exchangeWorkspaceSchema = new mongoose.Schema({
  exchange: { type: mongoose.Schema.Types.ObjectId, ref: 'ExchangeRequest', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  skillOffered: { type: String, required: true },
  skillWanted: { type: String, required: true },
  sessions: [{
    startTime: Date,
    endTime: Date,
    duration: Number, // minutes
    notes: String
  }],
  resources: [{
    title: String,
    url: String,
    type: { type: String, enum: ['link', 'file', 'code', 'note'] },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('ExchangeWorkspace', exchangeWorkspaceSchema);
