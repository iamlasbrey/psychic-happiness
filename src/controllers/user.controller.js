// src/controllers/user.controller.js
const asyncHandler = require('express-async-handler');
const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');
const config = require('../config'); // Your config file with JWT_SECRET

/**
 * @desc    Get a single user by ID
 * @route   GET /api/v1/users/:id
 * @access  Public
 */
const getUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await userService.getUserById(userId);
  // userService already returns the sanitized object
  res.status(200).json({ status: 'success', data: { user } });
});

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const createUser = asyncHandler(async (req, res) => {
  // the request has already been validated by Joi, redundant checks removed
  const user = await userService.registerUser(req.body);

  // some clients prefer to receive a token upon signup; we can issue one here if
  // desired (omitted for now).
  res.status(201).json({
    status: 'success',
    message: 'User created successfully',
    data: { user },
  });
});

const googleCallback = async (req, res, next) => {
  try {
    const user = req.user;

    // Generate tokens
    const accessToken = jwt.sign({ id: user.id }, config.JWT_SECRET, {
      expiresIn: '24h',
    });

    const refreshToken = jwt.sign({ id: user.id }, config.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

    // Redirect to frontend with tokens (or return JSON)
    // For testing, return JSON:
    res.json({
      success: true,
      message: 'Google login successful',
      data: {
        id: user.id,
        email: user.email,
        businessName: user.businessName,
        accessToken,
        refreshToken,
      },
    });

    // In production, redirect to frontend:
    // res.redirect(`http://localhost:3000?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_REFRESH_SECRET);
    } catch (error) {
      const err = new Error('Invalid or expired refresh token');
      err.statusCode = 401;
      throw err;
    }

    // Verify user still exists
    const user = await userService.getUserById(decoded.id);

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    // Generate new access token
    const accessToken = jwt.sign({ id: decoded.id }, config.JWT_SECRET, {
      expiresIn: '24h',
    });

    // Optionally generate new refresh token
    const newRefreshToken = jwt.sign(
      { id: decoded.id },
      config.JWT_REFRESH_SECRET,
      {
        expiresIn: '7d',
      },
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // validation already performed by middleware
  const loginResult = await userService.loginUser(email, password);

  res.status(200).json({
    status: 'success',
    message: 'User logged in successfully',
    data: loginResult,
  });
});

/**
 * @desc    Get current logged-in user's profile
 * @route   GET /api/v1/users/profile/me
 * @access  Private
 */
const getMyProfile = asyncHandler(async (req, res) => {
  // `protect` middleware ensures req.user exists or has already thrown an error
  res.status(200).json({
    status: 'success',
    message: 'Account fetched',
    data: { user: req.user },
  });
});

module.exports = {
  getUser,
  createUser,
  loginUser,
  refreshToken,
  googleCallback,
  getMyProfile,
};
