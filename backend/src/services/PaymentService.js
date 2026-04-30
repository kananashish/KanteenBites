const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

class PaymentService {
  /**
   * Create Razorpay order for payment
   */
  static async createRazorpayOrder(amount, orderId, userId) {
    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: orderId.toString(),
        notes: {
          orderId: orderId.toString(),
          userId: userId.toString(),
        },
      });

      // Save payment record
      const payment = new Payment({
        orderId,
        userId,
        amount,
        currency: 'INR',
        method: 'razorpay',
        razorpayOrderId: razorpayOrder.id,
        status: 'pending',
      });

      await payment.save();

      return {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        paymentId: payment._id,
      };
    } catch (error) {
      throw new Error(`Razorpay order creation failed: ${error.message}`);
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  static verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    return expectedSignature === razorpaySignature;
  }

  /**
   * Handle successful payment
   */
  static async handlePaymentSuccess(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    orderId
  ) {
    try {
      // Verify signature
      if (!this.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
        throw new Error('Payment signature verification failed');
      }

      // Update payment record
      const payment = await Payment.findOne({ razorpayOrderId });
      if (!payment) {
        throw new Error('Payment record not found');
      }

      payment.status = 'completed';
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      await payment.save();

      // Update order status
      const order = await Order.findById(orderId);
      if (order) {
        order.status = 'PAYMENT_SUCCESS';
        order.paymentId = razorpayPaymentId;
        await order.save();
      }

      return { success: true, payment };
    } catch (error) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  /**
   * Process wallet payment
   */
  static async processWalletPayment(userId, amount, orderId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.walletBalance < amount) {
        throw new Error('Insufficient wallet balance');
      }

      // Deduct from wallet
      user.walletBalance -= amount;
      await user.save();

      // Create payment record
      const payment = new Payment({
        orderId,
        userId,
        amount,
        currency: 'INR',
        method: 'wallet',
        status: 'completed',
      });
      await payment.save();

      // Update order
      const order = await Order.findById(orderId);
      if (order) {
        order.status = 'PAYMENT_SUCCESS';
        order.paymentId = payment._id.toString();
        await order.save();
      }

      return { success: true, payment };
    } catch (error) {
      throw new Error(`Wallet payment failed: ${error.message}`);
    }
  }

  /**
   * Process refund
   */
  static async processRefund(paymentId, reason = 'Order cancelled') {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.method === 'razorpay') {
        const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
          amount: payment.amount * 100,
          notes: { reason },
        });

        payment.status = 'refunded';
        payment.refundId = refund.id;
        payment.refundAmount = payment.amount;
        payment.refundReason = reason;
        await payment.save();

        return { success: true, refund };
      } else if (payment.method === 'wallet') {
        // Add back to wallet
        const user = await User.findById(payment.userId);
        user.walletBalance += payment.amount;
        await user.save();

        payment.status = 'refunded';
        payment.refundAmount = payment.amount;
        payment.refundReason = reason;
        await payment.save();

        return { success: true, refunded: true };
      }
    } catch (error) {
      throw new Error(`Refund processing failed: ${error.message}`);
    }
  }
}

module.exports = PaymentService;
