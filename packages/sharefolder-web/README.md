# ShareFolder Web

A modern Next.js web interface for ShareFolder, built as part of the monorepo.

## Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Monorepo Integration** with `@rtcmono/*` libraries
- **Modern React** with hooks and server components

## Getting Started

### Development

```bash
# From the root of the monorepo
npm run dev:web

# Or from this directory
npm run dev
```

The app will be available at [http://localhost:3010](http://localhost:3010).

**Note**: The web app is configured to run on port 3010 to avoid conflicts with other services in the monorepo.

### Building

```bash
# From the root of the monorepo
npm run build:web

# Or from this directory
npm run build
```

## Monorepo Integration

This app can import from the shared libraries in the monorepo:

```typescript
// Import types and interfaces
import { Connect, Messaging } from '@rtcmono/types';

// Import ORM functionality
import { getORMi } from '@rtcmono/orm';

// Import RTC client
import { RTCClient } from '@rtcmono/rtc-client';

// Import UI components
import { StyledBox, Loading } from '@rtcmono/ui-components';

// Import utility functions
import { generateUUID } from '@rtcmono/helpers';
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page
│   ├── test-libs/         # Test page for monorepo imports
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/             # Reusable components (when added)
└── lib/                    # Utility functions (when added)
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Dependencies

- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework

## Monorepo Libraries

This app integrates with the following shared libraries:

- `@rtcmono/types` - Type definitions and interfaces
- `@rtcmono/orm` - Database ORM and models  
- `@rtcmono/rtc-client` - RTC client functionality
- `@rtcmono/helpers` - Utility functions
- `@rtcmono/ui-components` - Reusable UI components

## Development Notes

- The app uses TypeScript path mapping to resolve monorepo imports
- All shared code should be placed in the `libs/` directory
- The app can import from any library using the `@rtcmono/*` namespace
- Hot reloading works for both the app and shared libraries
