// src/routes/index.js
const { Router } = require('express');
const v1Router = require('./v1'); // Imports the v1 router

const router = Router();

// Mounts the v1 router.
// Any request starting with /api/v1 will be sent to v1Router
router.use('/v1', v1Router);

module.exports = router;