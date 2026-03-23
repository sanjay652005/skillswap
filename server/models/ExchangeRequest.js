const mongoose = require('mongoose');

const exchangeRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillOffered: { type: String, required: true, trim: true },
  skillWanted: { type: String, required: true, trim: true },
  message: { type: String, default: '', maxlength: 500 },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
    default: 'pending'
  },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'ExchangeWorkspace' }
}, { timestamps: true });

module.exports = mongoose.model('ExchangeRequest', exchangeRequestSchema);
