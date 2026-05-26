const { Router } = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const customerRoutes = require('./customer.route');
const invoiceRoutes = require('./invoice.route');
const whatsappRoutes = require('./whatsapp.route');

const router = Router();
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/customer', customerRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/whatsapp', whatsappRoutes);

module.exports = router;
