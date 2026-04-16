const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const { passport, configureGoogleStrategy } = require('./config/passport');
configureGoogleStrategy();

// security headers & CORS
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  }),
);

// helpers
app.use(express.json());
app.use(cookieParser());

// passport initialization (no sessions in our token-based flow)
app.use(passport.initialize());

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
