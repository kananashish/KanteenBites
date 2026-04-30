# KanteenBites - Smart College Canteen Management System

A production-grade real-time ordering and queue management system for college canteens. Eliminates physical queues, reduces uncertainty, and optimizes canteen operations.

## 🎯 Key Features

### Student/Customer App
- **Minimal UI** - Order in under 10 seconds
- **Real-time tracking** - Know exact position in queue and estimated wait time
- **Smart ordering** - Menu with availability, stock, and prep time
- **Multiple payment methods** - Razorpay, wallet, cash
- **Pre-ordering** - Schedule orders for specific time slots
- **Order history** - Track past orders and quick reorder

### Admin Panel
- **Live order feed** - Real-time order updates
- **Queue management** - Full visibility into queue system
- **Inventory control** - Toggle availability, manage stock
- **Kitchen view** - Batched items for optimized prep flow
- **Analytics dashboard** - Peak hours, trending items, revenue

## 🏗️ System Architecture

### Backend Services

1. **Queue Engine** - FIFO queue with daily token generation
2. **Batching Engine** - Groups similar items across orders for optimized kitchen prep
3. **Estimated Time Engine** - Calculates realistic wait times based on queue and batching
4. **Payment Service** - Razorpay integration with refund handling
5. **Inventory Management** - Real-time stock tracking and auto-updates

### Tech Stack

**Backend:**
- Node.js + Express
- MongoDB
- Socket.io (real-time)
- Razorpay (payments)

**Frontend:**
- React
- React Router
- Socket.io Client
- Minimal CSS (no external UI framework)

## 📁 Project Structure

```
kanteen-bites/
├── backend/
│   ├── src/
│   │   ├── models/           # MongoDB schemas
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/           # API routes
│   │   ├── services/         # Core business logic
│   │   ├── middleware/       # Auth, error handling
│   │   ├── utils/            # Helpers (JWT, password)
│   │   ├── config/           # Database config
│   │   └── server.js         # Entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/            # Route pages
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React context (Auth, Cart)
│   │   ├── utils/            # API client
│   │   ├── styles/           # Global CSS
│   │   ├── App.jsx           # Router setup
│   │   └── index.js          # Entry point
│   ├── public/
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Razorpay account (for payments)

### Installation

1. **Clone and setup:**
```bash
cd backend
npm install
cp .env.example .env

cd ../frontend
npm install
cp .env.example .env
```

2. **Configure backend (.env):**
```
MONGODB_URI=mongodb://localhost:27017/kanteen-bites
JWT_SECRET=your-secret-key
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
ADMIN_EMAIL=admin@kanteenbites.com
ADMIN_PASSWORD=admin123
```

3. **Configure frontend (.env):**
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. **Start services:**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Backend runs on `http://localhost:5000`
Frontend runs on `http://localhost:3000`

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/categories` - Get categories
- `GET /api/menu/:id` - Get item details

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/confirm` - Confirm order (after payment)
- `POST /api/orders/:id/cancel` - Cancel order
- `PATCH /api/orders/:id/status` - Update status (admin)

### Queue
- `GET /api/queue/status/:orderId` - Get queue position
- `GET /api/queue/admin/full` - Full queue (admin)
- `GET /api/queue/admin/stats` - Queue statistics (admin)

### Payments
- `POST /api/payments/initiate` - Start payment
- `POST /api/payments/verify` - Verify Razorpay payment
- `POST /api/payments/wallet` - Pay with wallet

### Admin
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/analytics/top-items` - Top selling items
- `GET /api/admin/analytics/hourly` - Hourly statistics

## 🔄 Real-time Features (Socket.io)

- `order_update` - Order status changes
- `queue_update` - Queue position updates
- `menu_update` - Menu item availability changes
- `payment_update` - Payment status

## 💾 Database Schema Overview

**Users:** Profile, wallet, preferences
**MenuItems:** Name, price, category, stock, prep time
**Orders:** Items, status, payment, queue info
**Payments:** Payment method, Razorpay details, refunds
**Wallet:** Balance, transaction history
**Analytics:** Daily metrics, hourly data, item rankings

## 🔐 Security Features

- JWT-based authentication
- Password hashing (bcrypt)
- Admin-only routes
- Idempotent payment handling
- Server-side validation
- Secure payment signature verification

## 📈 Performance Considerations

1. **Queue Optimization** - Batching engine reduces prep time
2. **Real-time Updates** - Socket.io for instant UI updates
3. **Stock Management** - Atomic operations to prevent overselling
4. **Caching** - Redis (optional) for queue caching
5. **Database Indexing** - Indexed fields for fast queries

## 🧪 Testing

Backend:
```bash
cd backend
npm test
```

Frontend:
```bash
cd frontend
npm test
```

## 📝 Sample Data

Run seed script to populate sample menu items:
```bash
cd backend
npm run seed
```

## 🛠️ Development Workflow

1. Backend runs with hot-reload: `npm run dev`
2. Frontend runs with hot-reload: `npm start`
3. Make changes - they auto-reload
4. Test with Postman or frontend UI
5. Commit when tests pass

## 🚨 Common Issues

**MongoDB connection fails:**
- Ensure MongoDB is running: `mongod`
- Check connection string in .env

**Razorpay not working:**
- Verify API keys in .env
- Check webhook configuration

**Socket.io connection errors:**
- Ensure backend is running
- Check CORS configuration

## 🎯 Future Enhancements

- [ ] Loyalty points system
- [ ] Item recommendations (ML)
- [ ] Peak hour surge pricing
- [ ] Dietary preference filtering
- [ ] Multi-canteen support
- [ ] Advanced analytics dashboard
- [ ] Payment gateway integration (more options)
- [ ] Mobile app (React Native)

## 👨‍💼 Admin Credentials

Default:
- Email: `admin@kanteenbites.com`
- Password: `admin123`

Change in production!

## 📞 Support

For issues or features, create an issue or contact the development team.

## 📄 License

MIT

---

**Built with ❤️ for college canteens**
