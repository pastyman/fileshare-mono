#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Function to display error and exit
error_exit() {
    echo "Error: $1"
    exit 1
}

# Variables
REPO_SSH_URL="git@github.com:pastyman/fileshare-mono.git"  # Replace with your private GitHub repo SSH URL
APP_NAME="filebump"  # The name of the app within the Nx monorepo
REPO_DIR="/tmp/private-repo"  # Temporary directory to clone the repo
ZIP_FILE_PATH=".deploy/filebump.zip"  # Path to the zip file inside the repo
DESTINATION_DIR="./app"  # Destination directory where the files will be extracted (default is /app)
DESTINATION_FULLPATH_DIR="./app/filebump"
SSH_KEY_PATH="./id-github"  # Path to SSH key (configurable via environment variable)
ENV_FILE="./.env"  # Full path to your .env file
APP_PORT=3000  # Port the Node.js app will run on, modify as needed
NGINX_CONF="/etc/nginx/sites-available/nodeapp"  # Nginx config file location
NGINX_ENABLED="/etc/nginx/sites-enabled/nodeapp"
SWAP_SIZE="4G"

# Start the SSH agent and add the SSH key
echo "Starting SSH agent..."
eval "$(ssh-agent -s)" || error_exit "Failed to start SSH agent."

echo "Adding SSH key..."
if [ -f "$SSH_KEY_PATH" ]; then
    ssh-add "$SSH_KEY_PATH"
    if [ $? -eq 0 ]; then
        echo "SSH key added successfully."
    else
        error_exit "Failed to add SSH key. Check if the key is correct and the passphrase (if any) is valid."
    fi
else
    error_exit "SSH key not found at $SSH_KEY_PATH."
fi

# Ensure the destination directory exists and is empty
if [ -d "$DESTINATION_DIR" ]; then
    echo "Destination directory $DESTINATION_DIR exists. Emptying the directory..."
    rm -rf "$DESTINATION_DIR"/*
else
    echo "Creating destination directory $DESTINATION_DIR..."
    mkdir -p "$DESTINATION_DIR"
fi

# Cleanup any previous repo clone
if [ -d "$REPO_DIR" ]; then
    echo "Cleaning up previous repository at $REPO_DIR..."
    rm -rf "$REPO_DIR"
fi

# Clone the private repo
echo "Cloning repository $REPO_SSH_URL into $REPO_DIR..."
git clone "$REPO_SSH_URL" "$REPO_DIR" || error_exit "Failed to clone repository. Please check SSH access and repository URL."

# Check if the zip file exists in the cloned repo
ZIP_FILE="$REPO_DIR/$ZIP_FILE_PATH"
if [ ! -f "$ZIP_FILE" ]; then
    error_exit "Zip file $ZIP_FILE_PATH not found in the repository!"
fi

# Extract the zip file
echo "Extracting $ZIP_FILE to $DESTINATION_DIR..."
unzip -o "$ZIP_FILE" -d "$DESTINATION_DIR" || error_exit "Failed to extract zip file."

# Cleanup
echo "Cleaning up cloned repository..."
rm -rf "$REPO_DIR"

# Copy the .env file to the deployed directory
echo "Copying .env file to $DESTINATION_FULLPATH_DIR"
cp $ENV_FILE $DESTINATION_FULLPATH_DIR/.env

# Add Swap if it's not already present
echo "Checking for swap space..."
if ! sudo swapon --show | grep -q "/swapfile"; then
    echo "No swap file detected. Creating a $SWAP_SIZE swap file."

    # Create swap file
    sudo fallocate -l $SWAP_SIZE /swapfile || error_exit "Failed to allocate swap file."
    
    # Set proper permissions
    sudo chmod 600 /swapfile || error_exit "Failed to set permissions on the swap file."
    
    # Format the swap file
    sudo mkswap /swapfile || error_exit "Failed to set up the swap file."
    
    # Enable swap
    sudo swapon /swapfile || error_exit "Failed to activate swap file."

    # Make swap permanent across reboots
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab || error_exit "Failed to add swap to /etc/fstab."

    echo "Swap file created and activated."
else
    echo "Swap space already exists."
fi

# Install dependencies using npm from the root of the monorepo
cd $DESTINATION_FULLPATH_DIR
echo "Installing dependencies for app..."
npm install 2>&1 | tee /dev/tty || error_exit "npm install failed."

# Start or reload the application with PM2
echo "Starting the application with PM2 on port $APP_PORT..."
if pm2 list | grep -q $APP_NAME; then
    echo "Application already running. Reloading..."
    pm2 reload $APP_NAME
else
    echo "Starting a new PM2 process..."
    pm2 start npm --name $APP_NAME -- start -- $APP_NAME -- -p $APP_PORT
fi

# Save PM2 state (to reload on reboot)
echo "Saving PM2 process list..."
pm2 save

# Modify default Nginx configuration to proxy requests to Node.js app
echo "Modifying default Nginx configuration to proxy to Node.js app..."
sudo tee /etc/nginx/sites-available/default > /dev/null <<EOL
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Serve static files if needed
    # location /static/ {
    #     alias /path/to/static/files;
    # }
}
EOL

# Test Nginx configuration and restart Nginx
echo "Testing and restarting Nginx..."
sudo nginx -t && sudo systemctl restart nginx || error_exit "Nginx configuration failed."

echo "Deployment complete!" | tee -a $LOG_FILE

# Step 11: Kill the SSH agent after the deployment is done
echo "Killing the SSH agent..."
ssh-agent -k
