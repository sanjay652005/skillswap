const Progress = require('../models/Progress');
const ExchangeRequest = require('../models/ExchangeRequest');

// Get or create progress for an exchange
exports.getProgress = async (req, res) => {
  try {
    const { exchangeId } = req.params;
    const exchange = await ExchangeRequest.findById(exchangeId).populate('sender receiver', 'name');
    if (!exchange) return res.status(404).json({ error: 'Exchange not found' });

    const isParticipant = [String(exchange.sender._id), String(exchange.receiver._id)].includes(String(req.user._id));
    if (!isParticipant) return res.status(403).json({ error: 'Not a participant' });

    // Determine which skill this user is tracking
    const isSender = String(exchange.sender._id) === String(req.user._id);
    const skillTracked = isSender ? exchange.skillWanted : exchange.skillOffered;

    let progress = await Progress.findOne({ exchange: exchangeId, user: req.user._id });
    if (!progress) {
      progress = await Progress.create({ exchange: exchangeId, user: req.user._id, skillTracked });
    }
    res.json(progress);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Update notes / hours / confidence
exports.updateProgress = async (req, res) => {
  try {
    const { exchangeId } = req.params;
    const { notes, hoursSpent, confidence } = req.body;
    const progress = await Progress.findOneAndUpdate(
      { exchange: exchangeId, user: req.user._id },
      { $set: { notes, hoursSpent, confidence } },
      { new: true, upsert: true }
    );
    res.json(progress);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Add goal
exports.addGoal = async (req, res) => {
  try {
    const { exchangeId } = req.params;
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Goal text required' });
    const progress = await Progress.findOneAndUpdate(
      { exchange: exchangeId, user: req.user._id },
      { $push: { goals: { text: text.trim() } } },
      { new: true, upsert: true }
    );
    res.json(progress);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Toggle goal complete
exports.toggleGoal = async (req, res) => {
  try {
    const { exchangeId, goalId } = req.params;
    const progress = await Progress.findOne({ exchange: exchangeId, user: req.user._id });
    if (!progress) return res.status(404).json({ error: 'Progress not found' });
    const goal = progress.goals.id(goalId);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    goal.completed = !goal.completed;
    goal.completedAt = goal.completed ? new Date() : null;
    await progress.save();
    res.json(progress);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Delete goal
exports.deleteGoal = async (req, res) => {
  try {
    const { exchangeId, goalId } = req.params;
    const progress = await Progress.findOneAndUpdate(
      { exchange: exchangeId, user: req.user._id },
      { $pull: { goals: { _id: goalId } } },
      { new: true }
    );
    res.json(progress);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Add milestone
exports.addMilestone = async (req, res) => {
  try {
    const { exchangeId } = req.params;
    const { title, description, dueDate } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Milestone title required' });
    const progress = await Progress.findOneAndUpdate(
      { exchange: exchangeId, user: req.user._id },
      { $push: { milestones: { title: title.trim(), description, dueDate } } },
      { new: true, upsert: true }
    );
    res.json(progress);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Toggle milestone complete
exports.toggleMilestone = async (req, res) => {
  try {
    const { exchangeId, milestoneId } = req.params;
    const progress = await Progress.findOne({ exchange: exchangeId, user: req.user._id });
    if (!progress) return res.status(404).json({ error: 'Progress not found' });
    const ms = progress.milestones.id(milestoneId);
    if (!ms) return res.status(404).json({ error: 'Milestone not found' });
    ms.completed = !ms.completed;
    ms.completedAt = ms.completed ? new Date() : null;
    await progress.save();
    res.json(progress);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Delete milestone
exports.deleteMilestone = async (req, res) => {
  try {
    const { exchangeId, milestoneId } = req.params;
    const progress = await Progress.findOneAndUpdate(
      { exchange: exchangeId, user: req.user._id },
      { $pull: { milestones: { _id: milestoneId } } },
      { new: true }
    );
    res.json(progress);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Get all progress entries for current user (dashboard)
exports.getMyProgress = async (req, res) => {
  try {
    const entries = await Progress.find({ user: req.user._id })
      .populate({ path: 'exchange', populate: { path: 'sender receiver', select: 'name' } })
      .sort({ updatedAt: -1 });
    res.json(entries);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
