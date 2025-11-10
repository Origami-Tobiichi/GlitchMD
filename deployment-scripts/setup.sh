#!/bin/bash

echo "╔══════════════════════════════════════╗"
echo "║    WhatsApp Bot Setup Script        ║"
echo "║     Integrated Koyeb + Panel        ║"
echo "╚══════════════════════════════════════╝"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Create necessary directories
echo "📁 Creating directory structure..."
mkdir -p koyeb-frontend/public
mkdir -p panel-backend/{src,lib,database,media}

# Install Koyeb Frontend dependencies
echo "📦 Installing Koyeb Frontend dependencies..."
cd koyeb-frontend
npm install
cd ..

# Install Panel Backend dependencies  
echo "📦 Installing Panel Backend dependencies..."
cd panel-backend
npm install
cd ..

echo "✅ Setup completed successfully!"
echo ""
echo "🚀 To start the system:"
echo "   Frontend: cd koyeb-frontend && npm start"
echo "   Backend:  cd panel-backend && npm start"
echo ""
echo "🔧 Or use the deployment scripts:"
echo "   ./deploy-koyeb.sh"
echo "   ./deploy-panel.sh"