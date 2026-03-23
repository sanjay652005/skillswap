const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const ProjectWorkspace = require('../models/ProjectWorkspace');

module.exports = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`🔌 User connected: ${socket.user.name} (${socket.id})`);

    // Mark user online
    await User.findByIdAndUpdate(socket.user._id, { isOnline: true, socketId: socket.id });

    // Broadcast online status
    socket.broadcast.emit('user_online', { userId: socket.user._id, name: socket.user.name });

    // ─── CHAT ROOMS ───────────────────────────────────────────────
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`📥 ${socket.user.name} joined room: ${roomId}`);
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
    });

    socket.on('send_message', async (data) => {
      try {
        const { content, roomId, roomType, messageType, codeLanguage } = data;
        const message = new Message({
          sender: socket.user._id,
          content, roomId, roomType,
          messageType: messageType || 'text',
          codeLanguage: codeLanguage || ''
        });
        await message.save();
        await message.populate('sender', 'name avatar');

        io.to(roomId).emit('new_message', message);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ─── TYPING INDICATORS ────────────────────────────────────────
    socket.on('typing_start', ({ roomId }) => {
      socket.to(roomId).emit('user_typing', {
        userId: socket.user._id,
        name: socket.user.name,
        roomId
      });
    });

    socket.on('typing_stop', ({ roomId }) => {
      socket.to(roomId).emit('user_stop_typing', {
        userId: socket.user._id,
        roomId
      });
    });

    // ─── LIVE CODE COLLABORATION ──────────────────────────────────
    socket.on('join_code_session', (workspaceId) => {
      socket.join(`code_${workspaceId}`);
    });

    socket.on('code_change', async (data) => {
      const { workspaceId, content, language, cursor } = data;
      // Broadcast to all others in the code session
      socket.to(`code_${workspaceId}`).emit('code_updated', {
        content, language, cursor,
        editedBy: { id: socket.user._id, name: socket.user.name }
      });

      // Save to DB (debounced in real app)
      try {
        await ProjectWorkspace.findByIdAndUpdate(workspaceId, {
          'liveCode.content': content,
          'liveCode.language': language,
          'liveCode.lastEditedBy': socket.user._id,
          'liveCode.lastEditedAt': new Date()
        });
      } catch (err) {
        console.error('Code save error:', err);
      }
    });

    socket.on('cursor_change', (data) => {
      socket.to(`code_${data.workspaceId}`).emit('cursor_updated', {
        ...data,
        user: { id: socket.user._id, name: socket.user.name }
      });
    });

    // ─── EXCHANGE / PROJECT NOTIFICATIONS ─────────────────────────
    socket.on('exchange_request_sent', (data) => {
      // Notify the receiver
      io.to(data.receiverSocketId).emit('new_exchange_request', data);
    });

    socket.on('project_invite_sent', (data) => {
      io.to(data.receiverSocketId).emit('new_project_invite', data);
    });

    // ─── DISCONNECT ───────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`🔌 User disconnected: ${socket.user.name}`);
      await User.findByIdAndUpdate(socket.user._id, {
        isOnline: false,
        lastSeen: new Date(),
        socketId: ''
      });
      socket.broadcast.emit('user_offline', { userId: socket.user._id });
    });
  });
};
