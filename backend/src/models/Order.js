const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MenuItem',
          required: true,
        },
        name: String,
        quantity: { type: Number, min: 1, required: true },
        price: { type: Number, required: true },
        prepTime: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        'PAYMENT_PENDING',
        'PAYMENT_SUCCESS',
        'ORDER_CONFIRMED',
        'PREPARING',
        'READY',
        'COMPLETED',
        'CANCELLED',
      ],
      default: 'PAYMENT_PENDING',
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'wallet', 'cash'],
      required: true,
    },
    paymentId: {
      type: String,
      sparse: true,
    },
    tokenNumber: {
      type: Number,
      unique: true,
      sparse: true,
    },
    queuePosition: Number,
    estimatedTime: Number, // in minutes
    actualPrepTime: Number,
    orderType: {
      type: String,
      enum: ['dine-in', 'takeaway'],
      default: 'takeaway',
    },
    preOrderSlot: {
      type: Date,
      default: null,
    },
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    cancelReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
