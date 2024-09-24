#!/bin/bash

# Log file for standard output
LOG_FILE="/var/log/install_deps.log"

# Exit script on first error
set -e

# Function to handle errors
function error_exit {
    echo "Error: $1"  # Output error to terminal
    exit 1
}

{
    echo "Installing Git, Node.js 20.17.0, npm, and PM2..."
    sudo apt update -y
    sudo apt install -y git curl build-essential ufw

    # Install Node.js 20.x from NodeSource
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs=20.17.0-1nodesource1

    # Ensure we have the correct version of Node.js
    echo "Verifying Node.js installation..."
    node_version=$(node -v)
    if [ "$node_version" != "v20.17.0" ]; then
        error_exit "Error: Node.js version is $node_version, but 20.17.0 is required."
    fi
    npm -v

    # Install PM2 globally if not installed
    if ! command -v pm2 &> /dev/null; then
        echo "PM2 not found, installing it globally..."
        sudo npm install -g pm2
    fi

    # Install unzip
    if ! command -v unzip &> /dev/null; then
        echo "unzip not found, installing it globally..."
        sudo apt install unzip -y
    fi

    # Install Nginx if not already installed
    if ! command -v nginx &> /dev/null; then
        echo "Nginx not found. Installing Nginx..."
        sudo apt install nginx -y
    fi

} | tee -a $LOG_FILE

echo "Server dependencies installed successfully!"
