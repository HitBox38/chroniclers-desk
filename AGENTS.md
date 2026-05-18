# AGENTS.md

## Cursor Cloud specific instructions

### Overview

**Chronicler's Desk** is a D&D Dungeon Master reference tool built with Next.js 15 (App Router, Turbopack), React 19, Tailwind CSS 4, and shadcn/ui. It uses **Convex** as its serverless backend/database and **Clerk** for authentication.

### Required Environment Variables

Create `.env.local` with:

```
NEXT_PUBLIC_CONVEX_URL=<your-convex-deployment-url>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
CLERK_SECRET_KEY=<your-clerk-secret-key>
```

Without these, the dev server starts but returns 500 on all routes.

### Running the App

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start Next.js dev server with Turbopack on port 3000 |
| `pnpm lint` | Run ESLint |
| `pnpm build` | Production build (requires env vars) |
| `npx convex dev` | Start Convex dev backend (only needed if modifying Convex functions) |

### Key Gotchas

- The app wraps everything in `ClerkProvider` and `ConvexClientProvider` at the root layout level. Every route requires both services to be configured.
- Clerk middleware (`middleware.ts`) runs on all routes except static assets. The app is inaccessible without valid Clerk keys.
- `pnpm install` may show warnings about ignored build scripts (`@tailwindcss/oxide`, `sharp`, `unrs-resolver`). These don't block development but may affect production builds with image optimization.
- The project uses `pnpm@10.14.0` as its package manager (specified in `package.json` `packageManager` field).
- TypeScript compilation (`npx tsc --noEmit`) passes cleanly and is a good way to verify changes without needing credentials.
