const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: [
      'exchange_request',    // someone sent you an exchange request
      'exchange_accepted',   // your exchange was accepted
      'exchange_declined',   // your exchange was declined
      'project_invite',      // invited to a project
      'join_request',        // someone wants to join your project
      'join_accepted',       // your join request was accepted
      'join_declined',       // your join request was declined
      'new_message',         // new chat message
      'compliment',          // received a compliment/review
      'project_completed',   // project marked complete
    ],
    required: true
  },
  title:   { type: String, required: true },
  body:    { type: String, default: '' },
  link:    { type: String, default: '' },   // frontend route to navigate to
  read:    { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
