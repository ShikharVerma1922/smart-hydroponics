// backend/test_socket.js
import { io } from 'socket.io-client';

console.log('Testing connection to http://127.0.0.1:3000...');

const socket = io('http://127.0.0.1:3000', {
  transports: ['polling', 'websocket'],
  timeout: 5000,
});

socket.on('connect', () => {
  console.log(' Socket.io connection SUCCESS! ID:', socket.id);
  socket.disconnect();
  process.exit(0);
});

socket.on('connect_error', (err) => {
  console.error(' Socket.io connect_error:', err.message);
  process.exit(1);
});

setTimeout(() => {
  console.error(' Connection timed out after 5 seconds.');
  process.exit(1);
}, 6000);