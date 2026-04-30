const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    preferences: {
      notificationsEnabled: { type: Boolean, default: true },
      soundAlert: { type: Boolean, default: true },
      favoriteItems: [mongoose.Schema.Types.ObjectId],
    },
    isActive: {
      type: Boolean,
      default: true,
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

module.exports = mongoose.model('User', userSchema);
