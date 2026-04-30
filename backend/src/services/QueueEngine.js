const Order = require('../models/Order');

class QueueEngine {
  /**
   * Get today's token number count
   */
  static async getTodayTokenCount() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const count = await Order.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      tokenNumber: { $exists: true, $ne: null },
    });

    return count;
  }

  /**
   * Generate unique token for the day
   */
  static async generateTokenNumber() {
    const count = await this.getTodayTokenCount();
    return count + 1;
  }

  /**
   * Calculate queue position for a new order
   */
  static async calculateQueuePosition(newOrderId) {
    const activeOrders = await Order.find({
      status: { $nin: ['COMPLETED', 'CANCELLED'] },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })
      .sort({ createdAt: 1 })
      .lean();

    const position = activeOrders.findIndex((o) => o._id.toString() === newOrderId.toString());
    return position >= 0 ? position + 1 : activeOrders.length + 1;
  }

  /**
   * Get orders ahead of a specific order
   */
  static async getOrdersAhead(orderId) {
    const order = await Order.findById(orderId).lean();
    if (!order) return 0;

    const ordersAhead = await Order.countDocuments({
      _id: { $ne: orderId },
      createdAt: { $lt: order.createdAt },
      status: { $nin: ['COMPLETED', 'CANCELLED'] },
    });

    return ordersAhead;
  }

  /**
   * Recalculate all queue positions (called when order status changes)
   */
  static async recalculateQueue() {
    const activeOrders = await Order.find({
      status: { $nin: ['COMPLETED', 'CANCELLED'] },
    })
      .sort({ createdAt: 1 })
      .lean();

    const updates = activeOrders.map((order, index) => ({
      updateOne: {
        filter: { _id: order._id },
        update: { queuePosition: index + 1 },
      },
    }));

    if (updates.length > 0) {
      await Order.bulkWrite(updates);
    }

    return activeOrders.length;
  }
}

module.exports = QueueEngine;
