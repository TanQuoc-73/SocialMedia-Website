const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/chat', require('./routes/chatRoutes'));

app.get('/', (req, res) => {
  console.log('Root endpoint accessed');
  res.json({ 
    message: 'Welcome to Chat API',
    endpoints: {
      health: '/health',
      chat: '/api/chat',
      rooms: '/api/chat/rooms'
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

module.exports = app;