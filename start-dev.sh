#!/bin/bash

# Lore Master Development Starter
# This script starts both the backend and admin frontend for development

echo "🎮 Starting Lore Master Development Environment"
echo "============================================="

# Function to check if a process is running on a port
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to start backend
start_backend() {
    echo "🔧 Starting Lore Master Backend..."
    cd /Users/herbert.asis/lore-master-backend/functions
    
    if check_port 5001; then
        echo "✅ Backend already running on port 5001"
    else
        echo "📦 Installing backend dependencies..."
        npm install
        echo "🚀 Starting backend server..."
        npm run serve &
        BACKEND_PID=$!
        echo "Backend PID: $BACKEND_PID"
        sleep 5
    fi
}

# Function to start admin frontend
start_admin() {
    echo "🎨 Starting Admin Dashboard..."
    cd /Users/herbert.asis/lore-master-backend/website/lore-master-admin
    
    if check_port 3000; then
        echo "✅ Admin dashboard already running on port 3000"
    else
        echo "📦 Installing admin dependencies..."
        npm install
        echo "🚀 Starting admin development server..."
        npm run dev &
        ADMIN_PID=$!
        echo "Admin PID: $ADMIN_PID"
    fi
}

# Function to open browsers
open_browsers() {
    echo "🌐 Opening browsers..."
    sleep 3
    
    # Open admin dashboard
    if command -v open >/dev/null 2>&1; then
        # macOS
        open http://localhost:3000
    elif command -v xdg-open >/dev/null 2>&1; then
        # Linux
        xdg-open http://localhost:3000
    else
        echo "Please open http://localhost:3000 in your browser"
    fi
}

# Function to show status
show_status() {
    echo ""
    echo "📊 Service Status:"
    echo "=================="
    
    if check_port 5001; then
        echo "✅ Backend API: http://localhost:5001"
    else
        echo "❌ Backend API: Not running"
    fi
    
    if check_port 3000; then
        echo "✅ Admin Dashboard: http://localhost:3000"
    else
        echo "❌ Admin Dashboard: Not running"
    fi
    
    echo ""
    echo "🔐 Default Admin Credentials:"
    echo "Email: admin@loremaster.com"
    echo "Password: admin123"
    echo ""
    echo "📚 Documentation:"
    echo "- Setup Guide: ./SETUP_COMPLETE.md"
    echo "- Admin README: ./README.md"
    echo ""
}

# Function to stop services
stop_services() {
    echo ""
    echo "🛑 Stopping services..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "Backend stopped"
    fi
    
    if [ ! -z "$ADMIN_PID" ]; then
        kill $ADMIN_PID 2>/dev/null
        echo "Admin dashboard stopped"
    fi
    
    # Kill any remaining processes on the ports
    pkill -f "firebase" 2>/dev/null
    pkill -f "next" 2>/dev/null
    
    echo "All services stopped"
    exit 0
}

# Trap Ctrl+C to stop services gracefully
trap stop_services INT

# Main execution
echo "🔍 Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm >/dev/null 2>&1; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites met"
echo ""

# Start services
start_backend
start_admin

# Wait a moment for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Show status
show_status

# Open browsers
read -p "🌐 Open admin dashboard in browser? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open_browsers
fi

echo ""
echo "🎮 Development environment is ready!"
echo "Press Ctrl+C to stop all services"
echo ""

# Keep script running
while true; do
    sleep 1
done
