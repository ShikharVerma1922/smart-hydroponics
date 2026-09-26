import express from "express";
import path from 'path';
import cors from 'cors';
import "dotenv/config";
import { initMQTTHandler } from "./mqtt/handler.js";
import { initSocket } from './socket.js';
import http from 'http';

const app = express();
const server = http.createServer(app);

initMQTTHandler();

initSocket(server);

app.use(cors());
app.use(express.json());

import telemetryRoutes from './routes/telemetry.routes.js';
import actuatorRoutes from './routes/actuator.routes.js';
import dosingRoutes from './routes/dosing.routes.js';
import cropRoutes from './routes/crop.routes.js';
import visionRoutes from './routes/vision.routes.js';
import systemRoutes from './routes/system.routes.js';

app.use(express.json());

// Static file hosting for captured canopy images
app.use('/uploads', express.static(path.resolve('uploads')));

// Registered API routes matching architecture contract
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/actuators', actuatorRoutes);
app.use('/api/dosing', dosingRoutes);
app.use('/api/crop', cropRoutes);
app.use('/api/vision', visionRoutes);
app.use('/api/system', systemRoutes);

app.listen(process.env.PORT, ()=>{
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});