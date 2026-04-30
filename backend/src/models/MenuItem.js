const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['breakfast', 'lunch', 'snacks', 'beverages', 'desserts'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    prepTime: {
      type: Number, // in minutes
      required: true,
      min: 1,
    },
    image: {
      type: String,
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      default: null, // null means unlimited
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    tags: [String], // vegetarian, vegan, gluten-free, etc.
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    orderCount: {
      type: Number,
      default: 0,
    },
    availableFrom: {
      type: String, // HH:mm format
      default: '07:00',
    },
    availableUpto: {
      type: String, // HH:mm format
      default: '21:00',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
