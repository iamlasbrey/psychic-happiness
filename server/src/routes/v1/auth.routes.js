const { Router } = require('express');
const { createUser, loginUser } = require('../../controllers/user.controller');
const validateRequest = require('../../middleware/validateRequest'); // 1. Import middleware
const {
  userCreateSchema,
  userLoginSchema,
  refreshTokenSchema,
} = require('../../validators/user.validators');
const router = Router();

// POST /api/v1/auth/register & /api/v1/auth/login
// validation middleware runs before the controller
router.post('/register', validateRequest(userCreateSchema), createUser);
router.post('/login', validateRequest(userLoginSchema), loginUser);

module.exports = router;
