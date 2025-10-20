const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
app.use(cors());

// Serve frontend static files if you want to host frontend from backend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // in production, restrict to your domain
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

let users = {}; // socketId -> username

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  // When a user sets their username
  socket.on('setUsername', (username) => {
    users[socket.id] = username || 'Anonymous';
    // notify everyone
    io.emit('userList', Object.values(users));
    socket.broadcast.emit('systemMessage', `${users[socket.id]} joined the chat`);
  });

  // When a message is sent
  socket.on('sendMessage', (msg) => {
    const username = users[socket.id] || 'Anonymous';
    const payload = {
      id: socket.id,
      username,
      text: msg,
      time: new Date().toISOString()
    };
    io.emit('newMessage', payload);
  });

  // Typing indicator
  socket.on('typing', (isTyping) => {
    const username = users[socket.id] || 'Anonymous';
    socket.broadcast.emit('typing', { username, isTyping });
  });

  // On disconnect
  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      delete users[socket.id];
      socket.broadcast.emit('systemMessage', `${username} left the chat`);
      io.emit('userList', Object.values(users));
    }
    console.log('Client disconnected', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
