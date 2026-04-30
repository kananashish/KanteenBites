const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const QueueEngine = require('../services/QueueEngine');
const EstimatedTimeEngine = require('../services/EstimatedTimeEngine');
const PaymentService = require('../services/PaymentService');

class OrderController {
  /**
   * Create new order
   */
  static async createOrder(req, res) {
    try {
      const { items, orderType, paymentMethod, preOrderSlot, notes } = req.body;
      const userId = req.user.userId;

      // Validate items
      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'No items in order' });
      }

      // Check stock and calculate total
      let totalAmount = 0;
      const populatedItems = [];

      for (const item of items) {
        const menuItem = await MenuItem.findById(item.itemId);
        if (!menuItem) {
          return res.status(400).json({ error: `Item ${item.itemId} not found` });
        }

        if (!menuItem.isAvailable) {
          return res.status(400).json({ error: `Item ${menuItem.name} is not available` });
        }

        if (menuItem.stock && menuItem.stock < item.quantity) {
          return res.status(400).json({
            error: `Insufficient stock for ${menuItem.name}`,
          });
        }

        totalAmount += menuItem.price * item.quantity;
        populatedItems.push({
          itemId: menuItem._id,
          name: menuItem.name,
          quantity: item.quantity,
          price: menuItem.price,
          prepTime: menuItem.prepTime,
        });
      }

      // Create order
      const order = new Order({
        userId,
        items: populatedItems,
        totalAmount,
        orderType: orderType || 'takeaway',
        paymentMethod: paymentMethod || 'razorpay',
        preOrderSlot: preOrderSlot || null,
        notes,
        status: 'PAYMENT_PENDING',
      });

      await order.save();

      // Reduce stock
      for (const item of items) {
        const menuItem = await MenuItem.findById(item.itemId);
        if (menuItem.stock) {
          menuItem.stock -= item.quantity;
          await menuItem.save();
        }
      }

      res.status(201).json({
        orderId: order._id,
        totalAmount: order.totalAmount,
        message: 'Order created. Please proceed to payment.',
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get order by ID
   */
  static async getOrder(req, res) {
    try {
      console.log(`[DEBUG] getOrder called for ID: ${req.params.id}`);
      console.log(`[DEBUG] req.user:`, req.user);
      
      const order = await Order.findById(req.params.id)
        .populate('userId', 'name email')
        .populate('items.itemId', 'name price prepTime');

      if (!order) {
        console.log(`[DEBUG] Order not found: ${req.params.id}`);
        return res.status(404).json({ error: 'Order not found' });
      }

      console.log(`[DEBUG] Order found:`, order);

      // Check authorization
      if (
        order.userId._id.toString() !== req.user.userId &&
        req.user.role !== 'admin'
      ) {
        console.log(`[DEBUG] Authorization failed. Order userId: ${order.userId._id}, req userId: ${req.user.userId}`);
        return res.status(403).json({ error: 'Unauthorized' });
      }

      res.json(order);
    } catch (error) {
      console.error(`[ERROR] getOrder error:`, error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get user's orders
   */
  static async getUserOrders(req, res) {
    try {
      const orders = await Order.find({ userId: req.user.userId })
        .populate('items.itemId', 'name price')
        .sort({ createdAt: -1 });

      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Confirm order (after payment)
   */
  static async confirmOrder(req, res) {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.status !== 'PAYMENT_SUCCESS') {
        return res.status(400).json({ error: 'Order payment not verified' });
      }

      // Generate token number
      const tokenNumber = await QueueEngine.generateTokenNumber();
      const queuePosition = await QueueEngine.calculateQueuePosition(order._id);
      const estimatedTime = await EstimatedTimeEngine.calculateEstimatedTime(order._id);

      order.tokenNumber = tokenNumber;
      order.queuePosition = queuePosition;
      order.estimatedTime = estimatedTime;
      order.status = 'ORDER_CONFIRMED';
      await order.save();

      res.json({
        orderId: order._id,
        tokenNumber: order.tokenNumber,
        queuePosition: order.queuePosition,
        estimatedTime: EstimatedTimeEngine.formatEstimate(estimatedTime),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update order status (admin)
   */
  static async updateOrderStatus(req, res) {
    try {
      const { status } = req.body;

      const validStatuses = [
        'PREPARING',
        'READY',
        'COMPLETED',
        'CANCELLED',
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({
        orderId: order._id,
        status: order.status,
        updatedAt: order.updatedAt,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Cancel order
   */
  static async cancelOrder(req, res) {
    try {
      const { reason } = req.body;
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
        return res.status(400).json({ error: 'Order cannot be cancelled' });
      }

      // Process refund if payment was successful
      if (order.status === 'PAYMENT_SUCCESS' || order.status === 'ORDER_CONFIRMED') {
        const Payment = require('../models/Payment');
        const payment = await Payment.findOne({ orderId: order._id });
        if (payment && payment.status === 'completed') {
          await PaymentService.processRefund(payment._id, reason || 'Order cancelled');
        }
      }

      order.status = 'CANCELLED';
      order.cancelReason = reason;
      await order.save();

      res.json({ orderId: order._id, status: 'CANCELLED' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = OrderController;
