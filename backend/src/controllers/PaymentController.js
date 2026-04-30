const Payment = require('../models/Payment');
const PaymentService = require('../services/PaymentService');
const Order = require('../models/Order');

class PaymentController {
  /**
   * Initiate Razorpay payment
   */
  static async initiatePayment(req, res) {
    try {
      const { orderId } = req.body;
      const userId = req.user.userId;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.userId.toString() !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const paymentData = await PaymentService.createRazorpayOrder(
        order.totalAmount,
        orderId,
        userId
      );

      res.json({
        razorpayOrderId: paymentData.razorpayOrderId,
        amount: paymentData.amount,
        paymentId: paymentData.paymentId,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Verify payment
   */
  static async verifyPayment(req, res) {
    try {
      const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
        req.body;

      const result = await PaymentService.handlePaymentSuccess(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        orderId
      );

      res.json({
        success: true,
        message: 'Payment verified',
        orderId,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Pay with wallet
   */
  static async payWithWallet(req, res) {
    try {
      const { orderId } = req.body;
      const userId = req.user.userId;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const result = await PaymentService.processWalletPayment(
        userId,
        order.totalAmount,
        orderId
      );

      res.json({
        success: true,
        message: 'Payment successful',
        orderId,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get payment history
   */
  static async getPaymentHistory(req, res) {
    try {
      const payments = await Payment.find({ userId: req.user.userId })
        .populate('orderId', 'totalAmount status')
        .sort({ createdAt: -1 });

      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PaymentController;
