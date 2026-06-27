const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const redis = require('../src/config/redis');

// security headers & CORS
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  }),
);

// Before routes/server.listen():
redis.connect().catch((err) => {
  console.error('[Redis] Startup failed:', err.message);
  // Optional: process.exit(1) if Redis is critical for your app
});

// helpers
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Import main router
const mainRouter = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');

// Use main router with /api prefix
app.use('/api', mainRouter);

// A simple root route for testing
app.get('/', (req, res) => {
  res.send('Server is alive!');
});

app.use(errorHandler);
module.exports = app;
