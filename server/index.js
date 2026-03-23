const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// DB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/exchanges', require('./routes/exchanges'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/notifications',  require('./routes/notifications'));
app.use('/api/progress',       require('./routes/progress'));
app.use('/api/upload',         require('./routes/upload'));
app.use('/api/matching',       require('./routes/matching'));
app.use('/uploads', require('express').static(require('path').join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Socket.io
require('./socket/socketHandler')(io);

// Pass io to controllers that need it
const exchangesController = require('./controllers/exchangesController');
const projectsController  = require('./controllers/projectsController');
const reviewsController   = require('./controllers/reviewsController');
const messagesController  = require('./controllers/messagesController');
exchangesController.setIo(io);
projectsController.setIo(io);
reviewsController.setIo(io);
messagesController.setIo(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = { app, io };
