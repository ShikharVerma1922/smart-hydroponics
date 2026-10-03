import cors from 'cors';
import express from 'express';
import { createPlaygroundRouter } from './playground.router.js';

/**
 * Example only: add the two marked lines to your existing server instead of copying this file.
 * The router has its own JSON parser, so it works regardless of where it is mounted.
 */
const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000' }));

const playground = createPlaygroundRouter(); // <- 1. create (opens its own isolated MQTT connection)
app.use('/api/playground', playground.router); // <- 2. mount

const port = Number(process.env.PORT ?? 5000);
const server = app.listen(port, () => console.log(`API listening on :${port}`));

function shutdown() {
  playground.shutdown();
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
