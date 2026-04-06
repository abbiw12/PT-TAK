#!/bin/bash

# PT TAK Mobile Development Setup Script
# This script helps set up your development environment for mobile builds

echo "🚀 PT TAK Mobile Development Setup"
echo "===================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install Node.js 16 or higher"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found!"
    exit 1
fi
echo "✅ npm $(npm -v)"

# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo ""
echo "🍎 For iOS development:"
echo "   1. Install Xcode from App Store"
echo "   2. Run: npm run ios:build"
echo "   3. Build and run from Xcode"
echo ""
echo "🤖 For Android development:"
echo "   1. Install Android Studio"
echo "   2. Run: npm run android:build"
echo "   3. Build and run from Android Studio"
echo ""
echo "📝 See MOBILE_BUILD_GUIDE.md for detailed instructions"
echo ""
