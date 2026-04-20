const { Router } = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const { createEntry } = require('../../controllers/customer.controller');

const router = Router();

router.use(authenticate); // all vault routes require auth
//create customer
router.post('/', createEntry);

module.exports = router;
