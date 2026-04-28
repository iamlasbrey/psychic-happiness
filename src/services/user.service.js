// src/services/user.service.js
const config = require('../config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = config.JWT_SECRET;
const JWT_REFRESH_SECRET = config.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error(
    'JWT_SECRET and JWT_REFRESH_SECRET must be defined in .env.development',
  );
}

/**
 * Register a new user
 */
const registerUser = async (userData) => {
  const { email, password, phone, businessName, address, taxId } = userData;

  const existingUser = await User.findOne({
    where: { email },
  });

  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    email,
    passwordHash,
    phone,
    businessName,
    address,
    taxId,
  });

  const tokens = generateTokens(user.id);

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    businessName: user.businessName,
    ...tokens,
  };
};

/**
 * Login user with email and password
 */
const loginUser = async (email, password) => {
  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const tokens = generateTokens(user.id);

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    businessName: user.businessName,
    ...tokens,
  };
};

/**
 * Generate access and refresh tokens
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '24h',
  });

  const refreshToken = jwt.sign({ id: userId }, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const accessToken = jwt.sign({ id: decoded.id }, JWT_SECRET, {
      expiresIn: '24h',
    });

    return { accessToken };
  } catch (error) {
    const err = new Error('Invalid refresh token');
    err.statusCode = 401;
    throw err;
  }
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['passwordHash'] },
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  getUserById,
};
