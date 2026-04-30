const Order = require('../models/Order');
const QueueEngine = require('../services/QueueEngine');
const EstimatedTimeEngine = require('../services/EstimatedTimeEngine');

class QueueController {
  /**
   * Get queue status (customer view)
   */
  static async getQueueStatus(req, res) {
    try {
      const order = await Order.findById(req.params.orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check authorization
      if (
        order.userId.toString() !== req.user.userId &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const ordersAhead = await QueueEngine.getOrdersAhead(order._id);

      res.json({
        orderId: order._id,
        tokenNumber: order.tokenNumber,
        status: order.status,
        queuePosition: order.queuePosition,
        ordersAhead,
        estimatedTime: EstimatedTimeEngine.formatEstimate(order.estimatedTime),
        estimatedTimeMinutes: order.estimatedTime,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get full queue (admin view)
   */
  static async getFullQueue(req, res) {
    try {
      const activeOrders = await Order.find({
        status: { $nin: ['COMPLETED', 'CANCELLED'] },
      })
        .populate('userId', 'name email')
        .populate('items.itemId', 'name')
        .sort({ createdAt: 1 })
        .lean();

      const queue = activeOrders.map((order, index) => ({
        orderId: order._id,
        tokenNumber: order.tokenNumber,
        customerName: order.userId.name,
        status: order.status,
        queuePosition: index + 1,
        items: order.items.map((i) => `${i.quantity}x ${i.name}`).join(', '),
        totalAmount: order.totalAmount,
        estimatedTime: order.estimatedTime,
        createdAt: order.createdAt,
      }));

      res.json({ totalOrders: queue.length, queue });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get queue statistics
   */
  static async getQueueStats(req, res) {
    try {
      const totalActive = await Order.countDocuments({
        status: { $nin: ['COMPLETED', 'CANCELLED'] },
      });

      const preparing = await Order.countDocuments({ status: 'PREPARING' });
      const ready = await Order.countDocuments({ status: 'READY' });
      const pending = await Order.countDocuments({
        status: { $in: ['ORDER_CONFIRMED', 'PAYMENT_SUCCESS'] },
      });

      const avgWaitTime = await Order.aggregate([
        {
          $match: {
            status: 'COMPLETED',
            completedAt: { $exists: true },
          },
        },
        {
          $project: {
            waitTime: {
              $divide: [
                { $subtract: ['$completedAt', '$createdAt'] },
                60000,
              ], // convert to minutes
            },
          },
        },
        {
          $group: {
            _id: null,
            avgWaitTime: { $avg: '$waitTime' },
          },
        },
      ]);

      res.json({
        totalActive,
        preparing,
        ready,
        pending,
        avgWaitTime: avgWaitTime[0]?.avgWaitTime || 0,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = QueueController;
