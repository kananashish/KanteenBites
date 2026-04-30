#!/bin/bash

# KanteenBites - Setup Script

echo "🍽️  Setting up KanteenBites..."

# Backend setup
echo "📦 Setting up backend..."
cd backend
npm install
cp .env.example .env
echo "✓ Backend setup complete"

# Frontend setup  
echo "📦 Setting up frontend..."
cd ../frontend
npm install
cp .env.example .env
echo "✓ Frontend setup complete"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your Razorpay credentials"
echo "2. Update backend/.env with MongoDB connection string"
echo "3. Start MongoDB: mongod"
echo "4. Start backend: cd backend && npm run dev"
echo "5. Start frontend: cd frontend && npm start"
