// backend/src/server.js
import http from 'http';
import path from 'path';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { initMQTTHandler } from './mqtt/handler.js';
import mqttClient from './config/mqtt_broker.js'
import { initSocket } from './socket.js';
import { prisma } from './config/prisma.js';
import { startHeartbeatMonitor, stopHeartbeatMonitor } from './services/heartbeat.service.js';

// Route imports
import telemetryRoutes from './routes/telemetry.routes.js';
import actuatorRoutes from './routes/actuator.routes.js';
import dosingRoutes from './routes/dosing.routes.js';
import cropRoutes from './routes/crop.routes.js';
import visionRoutes from './routes/vision.routes.js';
import systemRoutes from './routes/system.routes.js';
import { createPlaygroundRouter } from './playground/playground.router.js';

const app = express();
const server = http.createServer(app);

const playground = createPlaygroundRouter(); 

initMQTTHandler();
initSocket(server);
startHeartbeatMonitor();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.resolve('uploads')));

app.use('/api/telemetry', telemetryRoutes);
app.use('/api/actuators', actuatorRoutes);
app.use('/api/dosing', dosingRoutes);
app.use('/api/crop', cropRoutes);
app.use('/api/vision', visionRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/playground', playground.router);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Hydroponics Backend running on http://localhost:${PORT}`);
});

async function gracefulShutdown(signal) {
  console.log(`\n[Shutdown] Received ${signal}. Closing connections cleanly...`);

  stopHeartbeatMonitor();

  // Close HTTP and Socket.io server
  server.close(() => {
    console.log('[Shutdown] HTTP & WebSocket server closed.');
  });

  // End MQTT connection
  if (mqttClient) {
    mqttClient.end(false, () => {
      console.log('[Shutdown] MQTT connection terminated.');
    });
  }

  // Disconnect Prisma ORM
  try {
    await prisma.$disconnect();
    console.log('[Shutdown] PostgreSQL connection closed.');
  } catch (err) {
    console.error('[Shutdown Error] Prisma disconnect:', err.message);
  }

  console.log('[Shutdown] Clean exit completed.');
  process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));