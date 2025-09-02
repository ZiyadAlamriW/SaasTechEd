#!/bin/bash

# Quick Start Script for Development
echo "🚀 Starting School Management System Development Environment"
echo "============================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found. Creating from example..."
    cp backend/env.example backend/.env
    echo "📝 Please update backend/.env with your database credentials"
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  frontend/.env not found. Creating from example..."
    cp frontend/.env.example frontend/.env
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your Supabase DATABASE_URL"
echo "2. Update frontend/.env with your API URL"
echo "3. Run: npm run db:push (to apply database schema)"
echo "4. Run: npm run dev (to start development servers)"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3001"
echo "   Backend:  http://localhost:3000"
echo "   Health:   http://localhost:3000/health"
echo ""
echo "📚 Documentation:"
echo "   - SUPABASE_SETUP.md"
echo "   - RENDER_DEPLOYMENT.md"
echo "   - DEPLOYMENT_GUIDE.md"
