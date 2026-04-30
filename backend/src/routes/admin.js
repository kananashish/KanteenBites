const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * Get dashboard statistics
 */
router.get('/dashboard/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today },
      status: { $nin: ['CANCELLED'] },
    });

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          status: 'COMPLETED',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
        },
      },
    ]);

    const activeOrders = await Order.countDocuments({
      status: { $nin: ['COMPLETED', 'CANCELLED'] },
    });

    const totalUsers = await User.countDocuments({ role: 'customer' });

    res.json({
      todayOrders,
      todayRevenue: todayRevenue[0]?.total || 0,
      activeOrders,
      totalUsers,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get top items
 */
router.get('/analytics/top-items', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const topItems = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.itemId',
          count: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'item',
        },
      },
    ]);

    res.json(topItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get hourly stats
 */
router.get('/analytics/hourly', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const hourlyStats = await Order.aggregate([
      {
        $match: {
          status: { $nin: ['CANCELLED'] },
        },
      },
      {
        $project: {
          hour: { $hour: '$createdAt' },
          totalAmount: 1,
        },
      },
      {
        $group: {
          _id: '$hour',
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(hourlyStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
