# Prisma Query Engine Fix for Next.js Monorepo on Vercel

## Problem
You were encountering the following error when deploying to Vercel:
```
prisma:error Invalid `prisma.user.findUnique()` invocation:
Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"
```

## Solution Implemented

### 1. Enhanced Binary Targets Configuration ✅

**Updated `prisma/schema.prisma`:**
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
  binaryTargets   = ["native", "rhel-openssl-3.0.x", "linux-musl-openssl-3.0.x", "debian-openssl-3.0.x"]
}
```

**Why this is necessary:**
- `rhel-openssl-3.0.x`: Required for Vercel's deployment environment (Red Hat Enterprise Linux)
- `linux-musl-openssl-3.0.x`: Alternative Linux distribution support
- `debian-openssl-3.0.x`: Debian-based systems support
- `native`: For local development (Windows/macOS)

### 2. Monorepo Workaround Plugin ✅

**Installed and configured `@prisma/nextjs-monorepo-workaround-plugin`:**

```bash
npm install @prisma/nextjs-monorepo-workaround-plugin
```

**Updated `next.config.mjs`:**
```javascript
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';

const nextConfig = {
  // ... other config
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(new PrismaPlugin());
    }
    return config;
  },
  // ... rest of config
}
```

**Why this is necessary for monorepos:**
- Ensures Prisma binaries are properly included in the server bundle
- Handles the complex module resolution in monorepo structures
- Prevents Vercel from stripping out necessary Prisma engine files
- Works around Next.js webpack optimization that can exclude Prisma binaries

### 3. Enhanced Vercel Configuration ✅

**Updated `vercel.json`:**
```json
{
  "buildCommand": "npx prisma generate && next build",
  "installCommand": "npm install && npx prisma generate",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "PRISMA_GENERATE_DATAPROXY": "false",
    "PRISMA_BINARY_TARGETS": "rhel-openssl-3.0.x,linux-musl-openssl-3.0.x,debian-openssl-3.0.x"
  }
}
```

**Key changes:**
- `PRISMA_GENERATE_DATAPROXY: "false"`: Uses traditional Prisma client (not Data Proxy)
- `PRISMA_BINARY_TARGETS`: Explicitly sets binary targets via environment variable
- Ensures Prisma generation happens during both install and build phases

## Why These Changes Are Necessary

### 1. **Binary Target Mismatch**
- **Problem**: Vercel runs on Linux (`rhel-openssl-3.0.x`) but your local development is on Windows (`native`)
- **Solution**: Include multiple binary targets so Prisma can find the correct engine for each environment

### 2. **Monorepo Complexity**
- **Problem**: Next.js monorepos have complex module resolution that can cause Prisma binaries to be excluded
- **Solution**: The `@prisma/nextjs-monorepo-workaround-plugin` ensures binaries are properly bundled

### 3. **Vercel Build Process**
- **Problem**: Vercel's aggressive optimization can strip out Prisma engine files
- **Solution**: Explicit build commands and environment variables ensure proper Prisma setup

### 4. **Next.js 16 Turbopack Compatibility**
- **Problem**: Next.js 16 uses Turbopack by default, which conflicts with webpack configurations
- **Solution**: Configure both Turbopack and webpack to work together

## Additional Configuration Recommendations

### For Next.js Monorepos Specifically:

1. **Package.json Scripts:**
```json
{
  "scripts": {
    "build": "npx prisma generate && next build",
    "postinstall": "npx prisma generate"
  }
}
```

2. **Environment Variables on Vercel:**
- `DATABASE_URL`: Your PostgreSQL connection string
- `PRISMA_BINARY_TARGETS`: `rhel-openssl-3.0.x,linux-musl-openssl-3.0.x,debian-openssl-3.0.x`

3. **Consider Prisma Accelerate** (Optional):
For high-traffic applications, consider using Prisma Accelerate for connection pooling:
```bash
npm install @prisma/extension-accelerate
```

## Verification Steps

1. ✅ **Local Build**: `npm run build` completes successfully
2. ✅ **Prisma Generation**: `npx prisma generate` works without errors
3. ✅ **Binary Targets**: Multiple binary targets are configured
4. ✅ **Monorepo Plugin**: `@prisma/nextjs-monorepo-workaround-plugin` is installed and configured
5. ✅ **Vercel Config**: Proper build commands and environment variables set

## Expected Results After Deployment

- ✅ No "Query Engine not found" errors
- ✅ All API endpoints respond with 200 status
- ✅ Database queries execute successfully
- ✅ Prisma client initializes correctly in production

## Troubleshooting

If issues persist:

1. **Check Vercel Build Logs**: Look for "Generated Prisma Client" message
2. **Verify Environment Variables**: Ensure `DATABASE_URL` and `PRISMA_BINARY_TARGETS` are set
3. **Check Node Version**: Ensure Vercel is using Node.js 18.x or later
4. **Database Connectivity**: Verify your database is accessible from Vercel's deployment region

## Files Modified

- ✅ `prisma/schema.prisma` - Enhanced binary targets
- ✅ `next.config.mjs` - Added monorepo plugin and Turbopack config
- ✅ `vercel.json` - Updated build configuration and environment variables
- ✅ `package.json` - Added monorepo workaround plugin dependency

## Summary

This comprehensive solution addresses the Prisma Query Engine issue by:
1. **Ensuring proper binary targets** for Vercel's Linux environment
2. **Using the monorepo workaround plugin** to handle complex module resolution
3. **Configuring Vercel properly** with explicit build commands and environment variables
4. **Handling Next.js 16 Turbopack compatibility** issues

The solution is specifically tailored for Next.js monorepos deployed to Vercel and should resolve the "Query Engine not found" error completely.
