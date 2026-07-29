const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate routes by verifying JWT token.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (Bearer TOKEN)
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify the token using your secret
      const decoded = jwt.verify(token, config.JWT_SECRET);

      // 3. Find the user associated with the token's ID
      // Exclude the password field
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });

      if (!req.user) {
        // User associated with token not found (maybe deleted?)
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      // 4. Token is valid, user found, proceed to the next middleware/controller
      return next();
    } catch (error) {
      logger.error('Token verification error:', error);
      res.status(401); // Unauthorized
      throw new Error('Not authorized, token failed');
    }
  }

  // If we reached this point and `token` is still undefined, no usable header was found
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

module.exports = { authenticate };
