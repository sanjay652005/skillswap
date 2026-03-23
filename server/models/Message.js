const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:     { type: String, required: true, maxlength: 5000 },
  roomId:      { type: String, required: true },
  roomType:    { type: String, enum: ['exchange', 'project', 'direct'], required: true },
  messageType: { type: String, enum: ['text', 'code', 'resource', 'system'], default: 'text' },
  codeLanguage:{ type: String, default: '' },
  isRead:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  editedAt:    Date,
  isPinned:    { type: Boolean, default: false },
  pinnedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pinnedAt:    Date,
  mentions:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ roomId: 1, isPinned: 1 });

module.exports = mongoose.model('Message', messageSchema);
