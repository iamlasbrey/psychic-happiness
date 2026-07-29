const config = require('../config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { normalizePhoneNumber } = require('../utils/phoneNormalize');
const logger = require('../utils/logger');

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
  const {
    firstName,
    lastName,
    password,
    phoneNumber,
    businessName,
    businessRegistrationNumber,
    address,
    tin,
  } = userData;

  // 1. Normalize the phone
  const normalizedPhone = normalizePhoneNumber(phoneNumber);

  // 2. Perform INDIVIDUAL lookups
  const [userByPhone, userByTin, userByBusiness] = await Promise.all([
    User.findOne({
      where: { phoneNumber: normalizedPhone },
      attributes: ['phoneNumber'],
    }),
    tin ? User.findOne({ where: { tin }, attributes: ['tin'] }) : null,
    businessRegistrationNumber
      ? User.findOne({
          where: { businessRegistrationNumber },
          attributes: ['businessRegistrationNumber'],
        })
      : null,
  ]);

  // 3. Evaluate each individually
  if (userByPhone) {
    throw new Error('Phone number already registered');
  }

  if (userByTin) {
    throw new Error('TIN already registered');
  }

  if (userByBusiness) {
    throw new Error('Business registration number already registered');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    passwordHash,
    phoneNumber: normalizedPhone,
    firstName,
    lastName,
    businessName,
    address,
    businessRegistrationNumber,
    tin,
  });

  const tokens = generateTokens(user.id);

  return {
    id: user.id,
    phoneNumber: user.phoneNumber,
    businessName: user.businessName,
    ...tokens,
  };
};

/**
 * Login user with phone and password
 */
const loginUser = async (phoneNumber, password) => {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const user = await User.findOne({
    where: { phoneNumber: normalizedPhone },
  });

  if (!user) {
    const error = new Error('Invalid phone or password');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    const error = new Error('Invalid phone or password');
    error.statusCode = 401;
    throw error;
  }

  const tokens = generateTokens(user.id);

  return {
    id: user.id,
    phoneNumber: user.phoneNumber,
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

const refreshAccessToken = async (refreshToken) => {
  try {
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
    } catch (error) {
      const err = new Error('Invalid or expired refresh token');
      err.statusCode = 401;
      throw err;
    }

    // Verify user still exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    // Generate new access token
    const accessToken = jwt.sign({ id: decoded.id }, config.JWT_SECRET, {
      expiresIn: '24h',
    });

    // Generate new refresh token
    const newRefreshToken = jwt.sign(
      { id: decoded.id },
      config.JWT_REFRESH_SECRET,
      {
        expiresIn: '7d',
      },
    );

    logger.info('Token refreshed', { userId: decoded.id });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    logger.error('Token refresh error', { error: error.message });
    throw error;
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
