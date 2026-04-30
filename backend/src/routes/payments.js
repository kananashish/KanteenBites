const express = require('express');
const PaymentController = require('../controllers/PaymentController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/initiate', authMiddleware, PaymentController.initiatePayment);
router.post('/verify', authMiddleware, PaymentController.verifyPayment);
router.post('/wallet', authMiddleware, PaymentController.payWithWallet);
router.get('/history', authMiddleware, PaymentController.getPaymentHistory);

module.exports = router;
