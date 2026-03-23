const Review = require('../models/Review');
const User = require('../models/User');
const { createNotification } = require('./notificationsController');

let _io = null;
exports.setIo = (io) => { _io = io; };

exports.createReview = async (req, res) => {
  try {
    const { revieweeId, referenceId, referenceType, rating, feedback, skillReviewed } = req.body;

    const existing = await Review.findOne({ reviewer: req.user._id, referenceId });
    if (existing) return res.status(400).json({ error: 'Already reviewed this collaboration' });

    const review = new Review({
      reviewer: req.user._id,
      reviewee: revieweeId,
      referenceId, referenceType, rating, feedback, skillReviewed
    });
    await review.save();

    const reviews = await Review.find({ reviewee: revieweeId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(revieweeId, { rating: avgRating, reviewCount: reviews.length });

    await createNotification(_io, {
      recipient: revieweeId,
      sender: req.user._id,
      type: 'compliment',
      title: `New Compliment ⭐`.repeat(Math.min(rating, 5)).slice(0, 20) || 'New Compliment',
      body: `${req.user.name} gave you ${rating} star${rating > 1 ? 's' : ''}: "${feedback.slice(0, 60)}${feedback.length > 60 ? '...' : ''}"`,
      link: '/profile'
    });

    await review.populate('reviewer reviewee', 'name avatar');
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
