const ExchangeRequest  = require('../models/ExchangeRequest');
const ExchangeWorkspace = require('../models/ExchangeWorkspace');
const { createNotification } = require('./notificationsController');
const { sendExchangeRequestEmail } = require('../utils/email');

let _io = null;
exports.setIo = (io) => { _io = io; };

exports.sendRequest = async (req, res) => {
  try {
    const { receiverId, skillOffered, skillWanted, message } = req.body;
    const existing = await ExchangeRequest.findOne({
      sender: req.user._id, receiver: receiverId,
      status: { $in: ['pending', 'accepted'] }
    });
    if (existing) return res.status(400).json({ error: 'Exchange request already exists' });

    const exchange = new ExchangeRequest({
      sender: req.user._id, receiver: receiverId, skillOffered, skillWanted, message
    });
    await exchange.save();
    await exchange.populate(['sender', 'receiver']);

    await createNotification(_io, {
      recipient: receiverId,
      sender: req.user._id,
      type: 'exchange_request',
      title: 'New Exchange Request',
      body: `${req.user.name} wants to exchange ${skillOffered} for ${skillWanted}`,
      link: '/exchanges'
    });

    // Send email notification (non-blocking)
    if (exchange.receiver?.email) {
      sendExchangeRequestEmail(
        exchange.receiver.email,
        exchange.receiver.name,
        req.user.name,
        skillWanted
      ).catch(() => {});
    }

    res.status(201).json(exchange);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getMyExchanges = async (req, res) => {
  try {
    const exchanges = await ExchangeRequest.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    }).populate('sender receiver workspace').sort('-createdAt');
    res.json(exchanges);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.respondToRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const exchange = await ExchangeRequest.findById(req.params.id).populate('sender receiver');
    if (!exchange) return res.status(404).json({ error: 'Exchange not found' });
    if (exchange.receiver._id.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Not authorized' });

    exchange.status = status;

    if (status === 'accepted') {
      const workspace = new ExchangeWorkspace({
        exchange: exchange._id,
        participants: [exchange.sender._id, exchange.receiver._id],
        skillOffered: exchange.skillOffered,
        skillWanted: exchange.skillWanted
      });
      await workspace.save();
      exchange.workspace = workspace._id;

      await createNotification(_io, {
        recipient: exchange.sender._id,
        sender: req.user._id,
        type: 'exchange_accepted',
        title: 'Exchange Request Accepted! 🎉',
        body: `${req.user.name} accepted your exchange request`,
        link: '/exchanges'
      });
    } else if (status === 'declined') {
      await createNotification(_io, {
        recipient: exchange.sender._id,
        sender: req.user._id,
        type: 'exchange_declined',
        title: 'Exchange Request Declined',
        body: `${req.user.name} declined your exchange request`,
        link: '/exchanges'
      });
    }

    await exchange.save();
    await exchange.populate(['sender', 'receiver', 'workspace']);
    res.json(exchange);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getWorkspace = async (req, res) => {
  try {
    const workspace = await ExchangeWorkspace.findById(req.params.id).populate('participants exchange');
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    const isParticipant = workspace.participants.some(p => p._id.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ error: 'Not a participant' });
    res.json(workspace);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getWorkspaceStats = async (req, res) => {
  try {
    const Message = require('../models/Message');
    const Task    = require('../models/Task');
    const workspace = await ExchangeWorkspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ error: 'Not found' });
    const [msgCount, taskCount, doneTasks] = await Promise.all([
      Message.countDocuments({ roomId: req.params.id }),
      Task.countDocuments({ workspace: req.params.id }),
      Task.countDocuments({ workspace: req.params.id, status: 'done' })
    ]);
    res.json({ messages: msgCount, tasks: taskCount, doneTasks });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.addResource = async (req, res) => {
  try {
    const { title, url, type, content } = req.body;
    const workspace = await ExchangeWorkspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    workspace.resources.push({ title, url, type, content, addedBy: req.user._id });
    await workspace.save();
    res.json(workspace);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.cancelRequest = async (req, res) => {
  try {
    const exchange = await ExchangeRequest.findById(req.params.id);
    if (!exchange) return res.status(404).json({ error: 'Exchange not found' });
    if (exchange.sender.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Only sender can cancel' });
    if (exchange.status !== 'pending')
      return res.status(400).json({ error: 'Can only cancel pending requests' });
    exchange.status = 'cancelled';
    await exchange.save();
    res.json(exchange);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.completeExchange = async (req, res) => {
  try {
    const exchange = await ExchangeRequest.findById(req.params.id);
    if (!exchange) return res.status(404).json({ error: 'Exchange not found' });
    exchange.status = 'completed';
    await exchange.save();
    await exchange.populate(['sender', 'receiver']);
    res.json(exchange);
  } catch (error) { res.status(500).json({ error: error.message }); }
};
