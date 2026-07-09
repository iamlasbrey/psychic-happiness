// src/controllers/user.controller.js
const asyncHandler = require('express-async-handler');
const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');
const { serializeUser } = require('../utils/userSerializer');
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

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  const result = await userService.refreshAccessToken(token);

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: result,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { phoneNumber, password } = req.body;

  // validation already performed by middleware
  const loginResult = await userService.loginUser(phoneNumber, password);

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
  res.status(200).json({
    status: 'success',
    message: 'Account fetched',
    data: { user: serializeUser(req.user) },
  });
});

module.exports = {
  getUser,
  createUser,
  loginUser,
  refreshToken,
  getMyProfile,
};
