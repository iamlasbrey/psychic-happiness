// src/controllers/user.controller.js
const asyncHandler = require('express-async-handler');
const userService = require('../services/user.service');

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
  const { email, name, password } = req.body;

  // the request has already been validated by Joi, redundant checks removed
  const user = await userService.registerUser(email, name, password);

  // some clients prefer to receive a token upon signup; we can issue one here if
  // desired (omitted for now).
  res.status(201).json({
    status: 'success',
    message: 'User created successfully',
    data: { user },
  });
});

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
  getMyProfile,
};
