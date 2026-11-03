const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const os = require('os');
const dotenv = require('dotenv');
const apiRouter = require('./routes/api');

dotenv.config();

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 5000;
const app = express();

function getLanIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Security & utility middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow audio media streaming
}));

app.use(cors({
  origin: '*', // Allow client connections
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length', 'Content-Type'],
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static media (sample audio and covers)
app.use('/media', express.static(path.join(__dirname, '../media')));

// Mount API routes
app.use('/api/v1', apiRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'spotify-clone-express-api',
    runtime: 'express.js (node)',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Global error handling middleware
app.use((err, _req, res, _next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, HOST, () => {
  const lanIp = getLanIp();
  console.log(`[Spotify Clone Express API] Running locally: http://localhost:${PORT}`);
  console.log(`[Spotify Clone Express API] Running on network: http://${lanIp}:${PORT}`);
  console.log(`[Spotify Clone Express API] Audio Stream URL pattern: http://${lanIp}:${PORT}/api/v1/tracks/stream/:id`);
});

module.exports = app;
