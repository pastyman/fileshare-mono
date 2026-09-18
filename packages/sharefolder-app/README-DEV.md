# ShareFolder App - Development Guide

## Environment Configuration for Local Development

Signaling and connection polling are served by **sharefolder-web** (Next.js API routes) on port 3010. The separate `sharefolder-api` package is no longer required.

### Default Configuration

By default (production builds), the app uses:
- **Web / signaling**: `https://sharefolder.io`
- **Connections**: `https://sharefolder.io/connections`

### Development Configuration

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
export CONNECTION_ENDPOINT=http://localhost:3010/connections
export SIGNALING_BASE=http://localhost:3010
export WEB_BASE=http://localhost:3010
npm run start
```

### Environment Variables

- **`NODE_ENV`**: Set to `development` to enable development mode
- **`CONNECTION_ENDPOINT`**: Override connections polling URL
- **`SIGNALING_BASE`**: Override signaling base (`/host`, `/api/ice`, `/api/send`, …)
- **`WEB_BASE`**: Override share link base URL

### Prerequisites

```bash
# From monorepo root — web includes signaling API routes
npx nx serve sharefolder-web

# In another terminal
npx nx serve sharefolder-app
```

The app polls `http://localhost:3010/connections` and registers hosts at `http://localhost:3010/host`.
