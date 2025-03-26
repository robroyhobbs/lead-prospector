#!/bin/bash

# Setup script for Domain Prospector on Replit

echo "Setting up Domain Prospector..."

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Install Python dependencies for AIGNE
echo "Installing Python dependencies for AIGNE..."
pip install requests beautifulsoup4 pandas numpy

# Create necessary directories
mkdir -p data
mkdir -p logs

# Set up Replit Database
echo "Setting up Replit Database..."
# This is handled automatically by Replit

# Create a .env.local file (will be replaced with Replit Secrets)
echo "Creating environment file template..."
cat > .env.local.example << EOL
# Environment Variables
# Copy this file to .env.local and fill in the values

# Groq API Key (for LLM integration)
GROQ_API_KEY=your_groq_api_key_here
EOL

echo "Setup complete!"
echo "Next steps:"
echo "1. Add your GROQ_API_KEY to Replit Secrets when available"
echo "2. Run 'npm run dev' to start the development server"

