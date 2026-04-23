// src/config/index.js
// central configuration loader
const path = require('path');
const dotenv = require('dotenv');

// Ensure NODE_ENV has a default so we pick the correct file/path
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Attempt to load a `.env` file matching the environment (development, test, production, etc.)
// In some deployments (eg. production on Heroku) environment variables are injected
// and there may be no file at all, so we catch and ignore that case.
const envFile = `.env.${process.env.NODE_ENV}`;
const envPath = path.resolve(__dirname, '..', '..', envFile);
const result = dotenv.config({ path: envPath });

if (result.error) {
  if (process.env.NODE_ENV === 'development') {
    // during development the file should exist so failing loudly helps
    throw new Error(`⚠️  Couldn't find ${envFile} file. Did you create it?`);
  }
  // otherwise we silently continue; variables may be provided by the host
}

// Export the loaded config
module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
  LOG_LEVEL: process.env.LOG_LEVEL,

  DB_URI: process.env.DB_URI,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,

  // Google OAuth configuration (used by passport)
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  CLIENT_URL: process.env.CLIENT_URL,
};
