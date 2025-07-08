#!/bin/bash
echo "Starting UAM API deployment script..."

# Build the application
echo "Building the application..."
npm run build

# Start the application
echo "Starting the application..."
npm start
