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
echo "Cloning repository $GITHUB_REPO into $REPO_DIR..."
git clone "$GITHUB_REPO" "$REPO_DIR" || error_exit "Failed to clone repository. Please check SSH access and repository URL."

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

# Ensure the app port is open on the server firewall
echo "Ensuring port $APP_PORT is open in the firewall..."
ufw allow $APP_PORT/tcp
ufw reload

# Step 5: Copy the .env file to the deployed directory
if [ -f "$ENV_FILE" ]; then
    {
        echo "Copying .env file to $DESTINATION_FULLPATH_DIR"
        cp $ENV_FILE $DESTINATION_FULLPATH_DIR/.env
    } | tee -a $LOG_FILE
else
    echo "Warning: .env file not found at $ENV_FILE. Proceeding without it." | tee -a $LOG_FILE
fi

# Step 6: Install dependencies using npm from the root of the monorepo
cd $DESTINATION_FULLPATH_DIR
echo "Installing dependencies for app..."
npm install

# Step 8: Start or reload the application with PM2
echo "Starting the application with PM2 on port $APP_PORT..."
if pm2 list | grep -q $PM2_APP_NAME; then
    echo "Application already running. Reloading..."
    pm2 reload $PM2_APP_NAME
else
    echo "Starting a new PM2 process..."
    pm2 start npm --name $PM2_APP_NAME -- start -- $APP_NAME -- -p $APP_PORT
fi

# Step 9: Save PM2 state (to reload on reboot)
echo "Saving PM2 process list..."
pm2 save

# Optional: Step 10: Nginx config reload (if using Nginx for reverse proxy)
# sudo service nginx reload

echo "Deployment complete!" | tee -a $LOG_FILE

# Step 11: Kill the SSH agent after the deployment is done
echo "Killing the SSH agent..."
ssh-agent -k





# #!/bin/bash

# # Configuration
# REPO_SSH_URL="git@github.com:pastyman/fileshare-mono.git"  # Replace with your private GitHub repo SSH URL
# APP_NAME="filebump"  # The name of the app within the Nx monorepo
# BRANCH="main"  # Branch to pull the latest code from (change if needed)
# DEPLOY_DIR="./fileshare-mono"  # Directory where the app will be deployed
# PM2_APP_NAME="filebump"  # Name for the PM2 process
# ENV_FILE="./.env"  # Full path to your .env file
# APP_PORT=3000  # Port the Node.js app will run on, modify as needed

# # SSH Key setup
# SSH_KEY_PATH="./id-github"  # Path to the private SSH key (e.g., ~/.ssh/id_rsa)

# # Log file for standard output
# LOG_FILE="/var/log/deploy_output.log"

# # Exit script on first error
# set -e

# # Function to handle errors
# function error_exit {
#     echo "Error: $1"  # Output error to terminal
#     exit 1
# }

# # Step 1: Ensure the app port is open on the server firewall
# {
#     echo "Ensuring port $APP_PORT is open in the firewall..."
#     ufw allow $APP_PORT/tcp
#     ufw reload
# } | tee -a $LOG_FILE

# # # Step 2: Create the deployment directory if it does not exist
# # {
# #     echo "Checking if $DEPLOY_DIR exists..."

# #     if [ -d "$DEPLOY_DIR" ]; then
# #         echo "$DEPLOY_DIR exists. Deleting its contents recursively..."
# #         rm -rf $DEPLOY_DIR/*
# #         echo "Contents of $DEPLOY_DIR deleted."
# #     else
# #         echo "$DEPLOY_DIR does not exist. Creating it..."
# #         mkdir -p $DEPLOY_DIR || error_exit "Failed to create directory $DEPLOY_DIR."
# #     fi
# # } | tee -a $LOG_FILE

# # Step 3: Setup SSH agent and add SSH key for GitHub access
# {
#     echo "Starting SSH agent..."
#     eval "$(ssh-agent -s)" || error_exit "Failed to start SSH agent."
    
#     echo "Adding SSH key..."
#     if [ -f "$SSH_KEY_PATH" ]; then
#         ssh-add $SSH_KEY_PATH
#         if [ $? -eq 0 ]; then
#             echo "SSH key added successfully."
#         else
#             error_exit "Failed to add SSH key. Check if the key is correct and the passphrase (if any) is valid."
#         fi
#     else
#         error_exit "SSH key not found at $SSH_KEY_PATH."
#     fi
    
#     # Test SSH connection
#     echo "Testing SSH connection to GitHub..."
#     if ! ssh -T git@github.com 2>&1 | grep -q 'successfully authenticated'; then
#         error_exit "SSH authentication failed. Please check your SSH key configuration."
#     fi
# } | tee -a $LOG_FILE

# echo "Starting deployment of $APP_NAME..." | tee -a $LOG_FILE

# # Step 4: Clone the repository
# {
#     echo "Cloning the repository..."
#     git clone $REPO_SSH_URL
#     #cd $DEPLOY_DIR
#     #git checkout $BRANCH
# } | tee -a $LOG_FILE

# # Step 5: Copy the .env file to the deployed directory
# if [ -f "$ENV_FILE" ]; then
#     {
#         echo "Copying .env file to $DEPLOY_DIR"
#         cp $ENV_FILE $DEPLOY_DIR/.env
#     } | tee -a $LOG_FILE
# else
#     echo "Warning: .env file not found at $ENV_FILE. Proceeding without it." | tee -a $LOG_FILE
# fi

# # Step 6: Install dependencies using npm from the root of the monorepo
# cd $DESTINATION_DIR
# echo "Installing dependencies for app..."
# npm install

# # Step 8: Start or reload the application with PM2
# echo "Starting the application with PM2 on port $APP_PORT..."
# if pm2 list | grep -q $PM2_APP_NAME; then
#     echo "Application already running. Reloading..."
#     pm2 reload $PM2_APP_NAME
# else
#     echo "Starting a new PM2 process..."
#     pm2 start npm --name $PM2_APP_NAME -- start -- $APP_NAME -- -p $APP_PORT
# fi

# # Step 9: Save PM2 state (to reload on reboot)
# echo "Saving PM2 process list..."
# pm2 save

# # Optional: Step 10: Nginx config reload (if using Nginx for reverse proxy)
# # sudo service nginx reload

# echo "Deployment complete!" | tee -a $LOG_FILE

# # Step 11: Kill the SSH agent after the deployment is done
# echo "Killing the SSH agent..."
# ssh-agent -k
