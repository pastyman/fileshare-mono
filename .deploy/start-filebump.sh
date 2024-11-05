APP_NAME="filebump"  # The name of the app within the Nx monorepo
DESTINATION_FULLPATH_DIR="./app/filebump"
APP_PORT=3000  # Port the Node.js app will run on, modify as needed

# Start or reload the application with PM2
cd $DESTINATION_FULLPATH_DIR
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