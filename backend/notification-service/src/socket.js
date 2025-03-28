const socketIo = require('socket.io');

let io;

const initSocket = (server) => {
  io = socketIo(server);
  
  io.on('connection', (socket) => {
    console.log('A client connected');

    // Emit an event to the client
    socket.emit('message', 'Connected to WebSocket server');

    socket.on('disconnect', () => {
      console.log('A client disconnected');
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getIo };