# ShareFolder App - Development Guide

## Environment Configuration for Local Development

The ShareFolder app can be configured to use different API endpoints for development vs production.

### Default Configuration

By default, the app uses the production API endpoint:
- **Production API**: `https://api.sharefolder.io/connections`

### Development Configuration

For local development, you can override the API endpoint to use your local API server:

#### Option 1: Using npm scripts (Recommended)

```bash
npm run dev
```

#### Option 2: Using shell script

```bash
./dev-start.sh
```

#### Option 3: Manual environment variables

```bash
export NODE_ENV=development
export CONNECTION_ENDPOINT=http://localhost:3001/connections
npm run start
```

### Environment Variables

- **`NODE_ENV`**: Set to `development` to enable development mode
- **`CONNECTION_ENDPOINT`**: Override the default API endpoint (e.g., `http://localhost:3001/connections`)

### How It Works

1. When `NODE_ENV=development`, the app reads the `CONNECTION_ENDPOINT` environment variable
2. If set, it overrides the default production endpoint
3. The app then uses the local API endpoint for connection status polling
4. All other functionality remains the same

### Prerequisites

Make sure your local API server is running on the configured endpoint before starting the app in development mode.

### Example

```bash
# Start your local API server
cd sharefolder-api
npm run dev

# In another terminal, start the app in development mode
cd sharefolder-app
npm run dev
```

The app will now poll `http://localhost:3001/connections` instead of the production API.
