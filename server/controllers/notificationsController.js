const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name avatar')
      .sort('-createdAt')
      .limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Shared helper — call this from any controller to fire a notification
exports.createNotification = async (io, { recipient, sender, type, title, body = '', link = '' }) => {
  try {
    if (String(recipient) === String(sender)) return;
    const notif = await Notification.create({ recipient, sender, type, title, body, link });
    await notif.populate('sender', 'name avatar');

    const recipientUser = await User.findById(recipient).select('socketId');
    if (recipientUser?.socketId) {
      io.to(recipientUser.socketId).emit('new_notification', notif);
    }
    return notif;
  } catch (err) {
    console.error('Notification create error:', err.message);
  }
};
