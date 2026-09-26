// backend/src/socket.js
import { Server } from 'socket.io';

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Adjust to process.env.FRONTEND_URL in production
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
}

// Architecture contract emission helpers
export function emitTelemetryUpdate(data) {
  if (io) io.emit('telemetry:update', data);
}

export function emitDosingEvent(data) {
  if (io) io.emit('dosing:event', data);
}

export function emitSystemLockout(data) {
  if (io) io.emit('system:lockout', data);
}

export function emitSystemAlert(data) {
  if (io) io.emit('system:alert', data);
}