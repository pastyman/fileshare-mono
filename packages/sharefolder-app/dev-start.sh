#!/bin/bash

# Development startup script for ShareFolder app
# Signaling now lives on sharefolder-web (port 3010)

export NODE_ENV=development
export CONNECTION_ENDPOINT=http://localhost:3010/connections
export SIGNALING_BASE=http://localhost:3010
export WEB_BASE=http://localhost:3010

echo "Starting ShareFolder app in development mode..."
echo "API Endpoint: $CONNECTION_ENDPOINT"
echo "Signaling: $SIGNALING_BASE"
echo "Environment: $NODE_ENV"

npm run start
