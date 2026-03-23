const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true }, // exchange or project id
  referenceType: { type: String, enum: ['exchange', 'project'], required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  feedback: { type: String, required: true, maxlength: 1000 },
  skillReviewed: { type: String, default: '' }
}, { timestamps: true });

reviewSchema.index({ reviewer: 1, referenceId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
