const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const drawings = [];

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.emit('drawHistory', drawings);

  socket.on('draw', (data) => {
    drawings.push(data);
    io.emit('draw', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


