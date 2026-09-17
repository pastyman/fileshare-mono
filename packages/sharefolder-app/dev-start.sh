#!/bin/bash

# Development startup script for ShareFolder app
# This script sets environment variables for local development

export NODE_ENV=development
export CONNECTION_ENDPOINT=http://localhost:3001/connections

echo "Starting ShareFolder app in development mode..."
echo "API Endpoint: $CONNECTION_ENDPOINT"
echo "Environment: $NODE_ENV"

# Start the app with the environment variables
npm run start
