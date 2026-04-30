const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    dailyMetrics: {
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      avgOrderValue: { type: Number, default: 0 },
      peakHour: String,
      avgWaitTime: { type: Number, default: 0 },
      totalCustomers: { type: Number, default: 0 },
      uniqueCustomers: { type: Number, default: 0 },
    },
    itemMetrics: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MenuItem',
        },
        name: String,
        orderCount: Number,
        totalRevenue: Number,
        rating: Number,
      },
    ],
    categoryMetrics: [
      {
        category: String,
        orderCount: Number,
        totalRevenue: Number,
      },
    ],
    hourlyData: [
      {
        hour: { type: Number, min: 0, max: 23 },
        orders: Number,
        revenue: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analytics', analyticsSchema);
