const Message = require('../models/Message');
const User    = require('../models/User');
const { createNotification } = require('./notificationsController');

let _io = null;
exports.setIo = (io) => { _io = io; };

exports.getMessages = async (req, res) => {
  try {
    const { roomId, roomType } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const messages = await Message.find({ roomId, roomType })
      .populate('sender', 'name avatar')
      .populate('mentions', 'name')
      .populate('pinnedBy', 'name')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { content, roomId, roomType, messageType, codeLanguage, mentions } = req.body;
    const message = new Message({
      sender: req.user._id,
      content, roomId, roomType,
      messageType: messageType || 'text',
      codeLanguage: codeLanguage || '',
      mentions: mentions || []
    });
    await message.save();
    await message.populate('sender', 'name avatar');
    await message.populate('mentions', 'name');

    // Notify mentioned users
    if (mentions?.length) {
      for (const uid of mentions) {
        if (String(uid) !== String(req.user._id)) {
          await createNotification(_io, {
            recipient: uid,
            sender: req.user._id,
            type: 'mention',
            title: `${req.user.name} mentioned you`,
            body: content.length > 60 ? content.slice(0,60)+'...' : content,
            link: `/messages/${req.user._id}`
          });
        }
      }
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── PIN / UNPIN ───────────────────────────────────────────────────
exports.pinMessage = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    msg.isPinned = true;
    msg.pinnedBy = req.user._id;
    msg.pinnedAt = new Date();
    await msg.save();
    await msg.populate('sender', 'name avatar');
    await msg.populate('pinnedBy', 'name');
    if (_io) _io.to(msg.roomId).emit('message_pinned', msg);
    res.json(msg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.unpinMessage = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    msg.isPinned = false;
    msg.pinnedBy = undefined;
    msg.pinnedAt = undefined;
    await msg.save();
    if (_io) _io.to(msg.roomId).emit('message_unpinned', { messageId: msg._id, roomId: msg.roomId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPinnedMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const pinned = await Message.find({ roomId, isPinned: true })
      .populate('sender', 'name avatar')
      .populate('pinnedBy', 'name')
      .sort('-pinnedAt');
    res.json(pinned);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── DIRECT MESSAGES ──────────────────────────────────────────────
const getDMRoomId = (userId1, userId2) =>
  [userId1, userId2].map(String).sort().join('_');

exports.getConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      roomType: 'direct',
      roomId: { $regex: String(req.user._id) }
    })
      .populate('sender', 'name avatar isOnline lastSeen')
      .sort('-createdAt');

    const convMap = new Map();
    for (const msg of messages) {
      const parts = msg.roomId.split('_');
      const partnerId = parts.find(p => p !== String(req.user._id));
      if (!partnerId) continue;
      if (!convMap.has(partnerId)) {
        convMap.set(partnerId, { lastMessage: msg, unread: 0 });
      }
      if (
        String(msg.sender._id) !== String(req.user._id) &&
        !msg.isRead.map(String).includes(String(req.user._id))
      ) {
        convMap.get(partnerId).unread++;
      }
    }

    const partnerIds = [...convMap.keys()];
    const partners = await User.find({ _id: { $in: partnerIds } })
      .select('name avatar isOnline lastSeen');

    const conversations = partners.map(partner => ({
      partner,
      roomId: getDMRoomId(req.user._id, partner._id),
      lastMessage: convMap.get(String(partner._id))?.lastMessage,
      unread: convMap.get(String(partner._id))?.unread || 0
    })).sort((a, b) =>
      new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0)
    );

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDMHistory = async (req, res) => {
  try {
    const roomId = getDMRoomId(req.user._id, req.params.userId);
    const messages = await Message.find({ roomId, roomType: 'direct' })
      .populate('sender', 'name avatar')
      .populate('mentions', 'name')
      .populate('pinnedBy', 'name')
      .sort('createdAt')
      .limit(100);

    await Message.updateMany(
      { roomId, roomType: 'direct', sender: { $ne: req.user._id }, isRead: { $ne: req.user._id } },
      { $addToSet: { isRead: req.user._id } }
    );

    res.json({ messages, roomId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendDM = async (req, res) => {
  try {
    const { content, toUserId, mentions } = req.body;
    const roomId = getDMRoomId(req.user._id, toUserId);

    // Parse @mentions from content if not provided
    const message = new Message({
      sender: req.user._id,
      content, roomId,
      roomType: 'direct',
      messageType: 'text',
      mentions: mentions || []
    });
    await message.save();
    await message.populate('sender', 'name avatar');
    await message.populate('mentions', 'name');

    if (_io) _io.to(roomId).emit('new_message', message);

    await createNotification(_io, {
      recipient: toUserId,
      sender: req.user._id,
      type: 'new_message',
      title: `Message from ${req.user.name}`,
      body: content.length > 60 ? content.slice(0,60)+'...' : content,
      link: `/messages/${req.user._id}`
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDMUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name avatar isOnline lastSeen skillsOffered');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── DELETE MESSAGE ────────────────────────────────────────────────
exports.deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (String(msg.sender) !== String(req.user._id))
      return res.status(403).json({ error: 'Not your message' });
    await msg.deleteOne();
    if (_io) _io.to(msg.roomId).emit('message_deleted', { messageId: msg._id, roomId: msg.roomId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── CLEAR CONVERSATION ────────────────────────────────────────────
exports.clearConversation = async (req, res) => {
  try {
    const roomId = [req.user._id, req.params.userId].map(String).sort().join('_');
    await Message.deleteMany({ roomId, roomType: 'direct' });
    if (_io) _io.to(roomId).emit('conversation_cleared', { roomId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
