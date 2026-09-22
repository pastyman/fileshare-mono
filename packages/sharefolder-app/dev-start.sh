#!/bin/bash

# Development startup script for ShareFolder app
# Signaling talks to local sharefolder-web; share links use the public tunnel URL.

export NODE_ENV=development
export CONNECTION_ENDPOINT=http://localhost:3010/connections
export SIGNALING_BASE=http://localhost:3010
export WEB_BASE=https://sharefolder.io

echo "Starting ShareFolder app in development mode..."
echo "API Endpoint: $CONNECTION_ENDPOINT"
echo "Signaling: $SIGNALING_BASE"
echo "Web links: $WEB_BASE"
echo "Environment: $NODE_ENV"

npm run start
