const { Router } = require('express');
const { getUser, getMyProfile } = require('../../controllers/user.controller');
const { authenticate } = require('../../middleware/auth.middleware');

const router = Router();

// explicit profile endpoint comes first to avoid accidental param matching
// GET /api/v1/users/profile/me (private)
router.get('/profile/me', authenticate, getMyProfile);

// GET /api/v1/users/:id (public)
router.get('/:id', authenticate, getUser);

module.exports = router;
