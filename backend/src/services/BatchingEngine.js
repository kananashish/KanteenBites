const Order = require('../models/Order');

class BatchingEngine {
  /**
   * Group similar items across orders for batch processing
   * This helps optimize kitchen workflow
   */
  static async createItemBatches(orders) {
    const batches = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const itemKey = item.itemId.toString();
        if (!batches[itemKey]) {
          batches[itemKey] = {
            itemId: itemKey,
            itemName: item.name,
            prepTime: item.prepTime,
            quantity: 0,
            orders: [],
          };
        }
        batches[itemKey].quantity += item.quantity;
        batches[itemKey].orders.push(order._id);
      });
    });

    return Object.values(batches);
  }

  /**
   * Adjust estimated time based on batching logic
   * If items are batched together, prep time can be optimized
   */
  static adjustEstimatedTime(itemPrepTimes, batchOptimization = 0.8) {
    if (itemPrepTimes.length === 0) return 0;

    const maxPrepTime = Math.max(...itemPrepTimes);
    const totalPrepTime = itemPrepTimes.reduce((a, b) => a + b, 0);

    // Batching reduces total prep time (items can be made in parallel)
    const optimizedTime = maxPrepTime + (totalPrepTime - maxPrepTime) * batchOptimization;

    return Math.ceil(optimizedTime);
  }

  /**
   * Get pending items for kitchen (grouped by batch)
   */
  static async getPendingBatches() {
    const orders = await Order.find({
      status: { $in: ['ORDER_CONFIRMED', 'PREPARING'] },
    })
      .populate('items.itemId')
      .sort({ createdAt: 1 })
      .lean();

    const batches = this.createItemBatches(orders);
    return batches.sort((a, b) => b.quantity - a.quantity); // Sort by quantity descending
  }

  /**
   * Mark batch as completed
   */
  static async completeBatch(itemId, orderIds) {
    const updates = orderIds.map((orderId) => ({
      updateOne: {
        filter: { _id: orderId },
        update: { status: 'READY' },
      },
    }));

    if (updates.length > 0) {
      await Order.bulkWrite(updates);
    }

    return updates.length;
  }
}

module.exports = BatchingEngine;
