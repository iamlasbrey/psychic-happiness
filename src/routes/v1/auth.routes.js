const { Router } = require('express');
const { createUser, loginUser } = require('../../controllers/user.controller');
const validateRequest = require('../../middleware/validateRequest'); // 1. Import middleware
const {
  userCreateSchema,
  userLoginSchema,
} = require('../../validators/user.validators');
const { passport } = require('../../config/passport');
const router = Router();

// Redirect user to Google's consent screen
router.get(
  '/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
  }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
  }),
  (req, res) => {
    const { token } = req.user;
    // For SPAs — redirect to the frontend with the token
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  },
);

// POST /api/v1/auth/register & /api/v1/auth/login
// validation middleware runs before the controller
router.post('/register', validateRequest(userCreateSchema), createUser);
router.post('/login', validateRequest(userLoginSchema), loginUser);

module.exports = router;
