// src/services/user.service.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models/index'); // Your Sequelize User model

/**
 * Gets a user by ID (Keep this function)
 */
const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: ['id', 'email', 'name', 'googleId', 'createdAt'], // Exclude password
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

/**
 * Registers a new user with email and password
 */
const registerUser = async ({
  name,
  email,
  password,
  whatsappNumber,
  businessName,
  role = 'user',
}) => {
  const user = await User.findOne({
    where: { email: email, whatsappNumber: whatsappNumber },
  });

  // Only check email if it was actually provided
  if (email) {
    const existingEmail = await User.findOne({
      where: { email },
    });

    if (existingEmail) {
      throw new Error('A user with this email already exists');
    }
  }

  if (!businessName) {
    throw new Error('businessName is required');
  }

  if (!password || password.length < 6) {
    throw new Error(
      'Password is required and must be at least 6 characters long',
    );
  }

  // 2. Hash the password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // 3. Create the user in the database
  const newUser = await User.create({
    whatsappNumber,
    businessName,
    name: name || businessName,
    email: email || null,
    password: hashedPassword,
    role,
    emailVerified: false, // default
    phoneVerified: false,
    isActive: true,
    onboardingCompleted: false,
    subscriptionPlan: 'free',
  });

  // 4. Return the new user (excluding the password)
  // We use .toJSON() to get a plain object, then delete the password
  const userJson = newUser.toJSON();
  delete userJson.password;
  return userJson;
};

const loginUser = async (email, password) => {
  const existingUser = await User.findOne({ where: { email } });
  if (!existingUser) {
    const error = new Error(`This email doesn't exist`);
    error.statusCode = 401; // Use 401 Unauthorized for login failures
    throw error;
  }

  // 3. Check if it's a Google-only account (no password)
  if (!existingUser.password) {
    const error = new Error(
      'This account uses Google Sign-In. Please log in with Google.',
    );
    error.statusCode = 400; // Bad Request
    throw error;
  }

  // 4. Compare submitted password with the stored hash
  const isMatch = await bcrypt.compare(password, existingUser.password);
  if (!isMatch) {
    const error = new Error('Incorrect password, please try again');
    error.statusCode = 401; // Use 401 Unauthorized for login failures
    throw error;
  }

  const payload = { id: existingUser.id }; // Include user ID in the token
  const token = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });

  // 5. Convert to plain object and remove password before returning
  const userJson = existingUser.toJSON();
  delete userJson.password; // Remove the password hash
  return { user: userJson, token }; // Return the user object without the password
};

/**
 * Handle Google OAuth sign-in/up
 *
 * The `profile` object comes from passport-google-oauth20 and contains
 * information like `id`, `emails`, and `displayName`.
 *
 * 1. Try to find a user with a matching googleId.
 * 2. If none exists but a user with the same email exists, attach the
 *    googleId to that record.
 * 3. If neither exists create a fresh user (password is null).
 * 4. Issue a JWT token and return the sanitized user object.
 */
const googleAuthUser = async (profile) => {
  const googleId = profile.id;
  const email =
    profile.emails && profile.emails.length > 0 && profile.emails[0].value;
  const name =
    profile.displayName ||
    (profile.name &&
      `${profile.name.givenName || ''} ${profile.name.familyName || ''}`) ||
    '';

  if (!email) {
    const error = new Error('Google account did not provide an email');
    error.statusCode = 400;
    throw error;
  }

  // 1. try to find by googleId
  let user = await User.scope('withInactive').findOne({ where: { googleId } });

  if (!user) {
    // 2. if a user exists with the same email, just link the googleId
    user = await User.scope('withInactive').findOne({ where: { email } });
    if (user) {
      user.googleId = googleId;
      await user.save();
    }
  }

  if (!user) {
    // 3. create a new one
    user = await User.create({
      email,
      name,
      googleId,
      password: null, // explicitly null for oauth-only account
    });
  }

  const payload = { id: user.id };
  const token = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });

  const userJson = user.toJSON();
  delete userJson.password;
  return { user: userJson, token };
};

module.exports = {
  getUserById,
  registerUser,
  loginUser,
  googleAuthUser,
};
