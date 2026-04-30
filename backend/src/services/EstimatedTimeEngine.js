const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

class EstimatedTimeEngine {
  /**
   * Calculate estimated time for an order based on queue
   * Factors: items ahead, prep times, batching
   */
  static async calculateEstimatedTime(orderId) {
    const order = await Order.findById(orderId).populate('items.itemId').lean();
    if (!order) return 0;

    // Get all orders ahead in queue
    const ordersAhead = await Order.find({
      createdAt: { $lt: order.createdAt },
      status: { $nin: ['COMPLETED', 'CANCELLED'] },
    })
      .populate('items.itemId')
      .lean();

    // Calculate total prep time of items ahead
    let totalPrepTime = 0;
    const itemsAhead = {};

    ordersAhead.forEach((o) => {
      o.items.forEach((item) => {
        const itemKey = item.itemId._id.toString();
        if (!itemsAhead[itemKey]) {
          itemsAhead[itemKey] = {
            prepTime: item.itemId.prepTime,
            quantity: 0,
          };
        }
        itemsAhead[itemKey].quantity += item.quantity;
      });
    });

    // Calculate time: assume parallel cooking (max prep time + buffer)
    const prepTimes = Object.values(itemsAhead).map((i) => i.prepTime);
    if (prepTimes.length > 0) {
      totalPrepTime = Math.max(...prepTimes) + 3; // Add 3 min buffer
    }

    // Add current order's prep time
    const currentMaxPrepTime = Math.max(...order.items.map((i) => i.prepTime || 0), 0);
    totalPrepTime += currentMaxPrepTime;

    return Math.ceil(totalPrepTime);
  }

  /**
   * Get estimated times for multiple orders
   */
  static async getEstimatedTimeForMultiple(orderIds) {
    const times = {};
    for (const orderId of orderIds) {
      times[orderId] = await this.calculateEstimatedTime(orderId);
    }
    return times;
  }

  /**
   * Format estimated time as human-readable string
   */
  static formatEstimate(minutes) {
    if (minutes === 0) return 'Ready in ~2 mins';
    if (minutes < 2) return 'Ready in ~2 mins';
    if (minutes < 60) return `Ready in ~${minutes} mins`;
    const hours = Math.ceil(minutes / 60);
    return `Ready in ~${hours} hour${hours > 1 ? 's' : ''}`;
  }
}

module.exports = EstimatedTimeEngine;
