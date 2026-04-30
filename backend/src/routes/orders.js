const express = require('express');
const OrderController = require('../controllers/OrderController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, OrderController.createOrder);
router.get('/:id', authMiddleware, OrderController.getOrder);
router.get('/', authMiddleware, OrderController.getUserOrders);
router.post('/:id/confirm', authMiddleware, OrderController.confirmOrder);
router.patch('/:id/status', authMiddleware, adminMiddleware, OrderController.updateOrderStatus);
router.post('/:id/cancel', authMiddleware, OrderController.cancelOrder);

module.exports = router;
