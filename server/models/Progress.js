const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  text:        { type: String, required: true, trim: true },
  completed:   { type: Boolean, default: false },
  completedAt: { type: Date },
  createdAt:   { type: Date, default: Date.now }
});

const milestoneSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  completed:   { type: Boolean, default: false },
  completedAt: { type: Date },
  dueDate:     { type: Date },
  createdAt:   { type: Date, default: Date.now }
});

const progressSchema = new mongoose.Schema({
  exchange:    { type: mongoose.Schema.Types.ObjectId, ref: 'ExchangeRequest', required: true },
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillTracked:{ type: String, required: true },
  goals:       [goalSchema],
  milestones:  [milestoneSchema],
  notes:       { type: String, default: '', maxlength: 2000 },
  rating:      { type: Number, min: 1, max: 5, default: null },
  hoursSpent:  { type: Number, default: 0 },
  confidence:  { type: Number, min: 1, max: 5, default: null }, // self-rated confidence 1-5
}, { timestamps: true });

progressSchema.index({ exchange: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
