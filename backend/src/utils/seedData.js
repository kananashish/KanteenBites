const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const { hashPassword } = require('../utils/password');

async function seedData() {
  try {
    console.log('🌱 Seeding database...');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kanteen-bites';
    
    await mongoose.connect(mongoUri);

    // Clear existing data
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('✓ Cleared existing data');

    // Create admin user
    const adminPassword = await hashPassword('admin123');
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@kanteenbites.com',
      password: adminPassword,
      role: 'admin',
      walletBalance: 0,
    });
    console.log('✓ Created admin user');

    // Create sample users
    const userPassword = await hashPassword('user123');
    await User.create([
      {
        name: 'Rahul Kumar',
        email: 'rahul@college.com',
        studentId: 'CSE001',
        password: userPassword,
        role: 'customer',
        walletBalance: 500,
      },
      {
        name: 'Priya Singh',
        email: 'priya@college.com',
        studentId: 'ECE002',
        password: userPassword,
        role: 'customer',
        walletBalance: 300,
      },
    ]);
    console.log('✓ Created sample users');

    // Create menu items
    const menuItems = [
      // Breakfast
      {
        name: 'Aloo Paratha',
        description: 'Crispy potato-filled flatbread with butter',
        category: 'breakfast',
        price: 50,
        prepTime: 10,
        stock: 30,
        tags: ['vegetarian'],
      },
      {
        name: 'Idli & Sambar',
        description: 'Soft idlis with spicy sambar',
        category: 'breakfast',
        price: 40,
        prepTime: 8,
        stock: 40,
        tags: ['vegetarian', 'vegan'],
      },
      {
        name: 'Veggie Sandwich',
        description: 'Fresh vegetable sandwich with cheese',
        category: 'breakfast',
        price: 60,
        prepTime: 5,
        stock: 25,
        tags: ['vegetarian'],
      },

      // Lunch
      {
        name: 'Biryani',
        description: 'Fragrant basmati rice with vegetables',
        category: 'lunch',
        price: 120,
        prepTime: 15,
        stock: 20,
        tags: ['vegetarian'],
      },
      {
        name: 'Paneer Tikka',
        description: 'Grilled paneer with yogurt marinade',
        category: 'lunch',
        price: 100,
        prepTime: 12,
        stock: 25,
        tags: ['vegetarian'],
      },
      {
        name: 'Dal Makhani',
        description: 'Creamy lentils with butter and cream',
        category: 'lunch',
        price: 90,
        prepTime: 10,
        stock: 30,
        tags: ['vegetarian', 'vegan'],
      },

      // Snacks
      {
        name: 'Maggi',
        description: 'Quick instant noodles',
        category: 'snacks',
        price: 30,
        prepTime: 5,
        stock: 50,
        tags: ['vegetarian'],
      },
      {
        name: 'French Fries',
        description: 'Crispy golden fries',
        category: 'snacks',
        price: 40,
        prepTime: 6,
        stock: 40,
        tags: ['vegetarian', 'vegan'],
      },
      {
        name: 'Samosa (2 pcs)',
        description: 'Crispy potato samosas',
        category: 'snacks',
        price: 25,
        prepTime: 4,
        stock: 60,
        tags: ['vegetarian', 'vegan'],
      },
      {
        name: 'Pakora',
        description: 'Crispy vegetable fritters',
        category: 'snacks',
        price: 35,
        prepTime: 5,
        stock: 45,
        tags: ['vegetarian', 'vegan'],
      },

      // Beverages
      {
        name: 'Chai',
        description: 'Hot Indian tea with spices',
        category: 'beverages',
        price: 20,
        prepTime: 3,
        stock: 100,
        tags: ['vegetarian', 'vegan'],
      },
      {
        name: 'Coffee',
        description: 'Hot brewed coffee',
        category: 'beverages',
        price: 25,
        prepTime: 3,
        stock: 100,
        tags: ['vegetarian', 'vegan'],
      },
      {
        name: 'Fresh Juice',
        description: 'Freshly squeezed orange juice',
        category: 'beverages',
        price: 45,
        prepTime: 4,
        stock: 30,
        tags: ['vegetarian', 'vegan'],
      },

      // Desserts
      {
        name: 'Gulab Jamun',
        description: 'Soft fried milk solids in sugar syrup',
        category: 'desserts',
        price: 35,
        prepTime: 2,
        stock: 25,
        tags: ['vegetarian', 'vegan'],
      },
      {
        name: 'Ice Cream',
        description: 'Vanilla ice cream',
        category: 'desserts',
        price: 40,
        prepTime: 1,
        stock: 40,
        tags: ['vegetarian'],
      },
      {
        name: 'Kheer',
        description: 'Rice pudding with cardamom',
        category: 'desserts',
        price: 45,
        prepTime: 3,
        stock: 20,
        tags: ['vegetarian'],
      },
    ];

    await MenuItem.create(menuItems);
    console.log('✓ Created 16 menu items');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@kanteenbites.com / admin123');
    console.log('User: rahul@college.com / user123');
    console.log('User: priya@college.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedData();
