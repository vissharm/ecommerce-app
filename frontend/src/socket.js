import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

export default socket;