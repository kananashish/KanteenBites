const express = require('express');
const QueueController = require('../controllers/QueueController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/status/:orderId', authMiddleware, QueueController.getQueueStatus);
router.get('/admin/full', authMiddleware, adminMiddleware, QueueController.getFullQueue);
router.get('/admin/stats', authMiddleware, adminMiddleware, QueueController.getQueueStats);

module.exports = router;
