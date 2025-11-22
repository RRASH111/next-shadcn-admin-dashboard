# Prisma Deployment Fix for Vercel

## Problem Summary

The application was experiencing internal server errors (500) on Vercel deployment with the error:

```
prisma:error Invalid 'prisma.user.findUnique()' invocation:
Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"
```

## Root Causes Identified

1. **Prisma 6.x Compatibility Issues**: Prisma 6.18.0 had issues with binary target generation
2. **Custom Prisma Config File**: The `prisma.config.ts` file was interfering with schema configuration
3. **Missing Binary Targets**: The Prisma client wasn't configured properly for Vercel's deployment environment
4. **Command Path Issues**: The `prisma` command wasn't found during Vercel builds

## Solution Implemented

### 1. Downgraded Prisma Version

- **From**: Prisma 6.18.0
- **To**: Prisma 5.7.1
- **Reason**: More stable binary target handling and better compatibility with Vercel

### 2. Updated `prisma/schema.prisma`

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
  binaryTargets   = ["native", "rhel-openssl-3.0.x"]
}
```

### 3. Updated `package.json` Scripts

```json
{
  "scripts": {
    "build": "npx prisma generate && next build",
    "postinstall": "npx prisma generate"
  }
}
```

### 4. Updated `vercel.json`

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
    "PRISMA_GENERATE_DATAPROXY": "true"
  }
}
```

### 5. Fixed TypeScript Errors

- Added explicit type annotations for reduce functions in API routes
- Fixed implicit `any` type errors in:
  - `src/app/api/credits/balance/route.ts`
  - `src/app/api/verification/history/route.ts`
  - `src/app/api/verification/single/route.ts`

### 6. Removed Custom Prisma Config

- Deleted `prisma.config.ts` as it was incompatible with Prisma 5.7.1
- This file was causing build failures and is not needed for the standard configuration

## Verification Steps

1. ✅ Prisma client generates successfully
2. ✅ Build process completes without errors
3. ✅ All API routes compile correctly
4. ✅ TypeScript compilation passes

## Deployment Instructions

1. **Commit all changes**:

   ```bash
   git add .
   git commit -m "fix: Resolve Prisma Query Engine deployment issues"
   git push
   ```

2. **Environment Variables Required on Vercel**:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `CLERK_SECRET_KEY`: Your Clerk secret key
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

3. **Verify Deployment**:
   - Check Vercel deployment logs for successful Prisma generation
   - Test API endpoints (`/api/credits/balance`, `/api/verification/bulk/list`)
   - Monitor for any 500 errors in production logs

## Key Changes Made

### Files Modified:

- ✅ `prisma/schema.prisma` - Updated generator configuration
- ✅ `package.json` - Updated Prisma version and build scripts
- ✅ `vercel.json` - Updated build configuration
- ✅ `src/app/api/credits/balance/route.ts` - Fixed TypeScript errors
- ✅ `src/app/api/verification/history/route.ts` - Fixed TypeScript errors
- ✅ `src/app/api/verification/single/route.ts` - Fixed TypeScript errors
- ❌ `prisma.config.ts` - **DELETED** (incompatible with Prisma 5.7.1)

### Packages Updated:

- `prisma`: 6.18.0 → 5.7.1
- `@prisma/client`: 6.18.0 → 5.7.1

## Why This Fix Works

1. **Prisma 5.7.1 Stability**: This version has more reliable binary target handling
2. **Explicit Binary Targets**: Specifying `rhel-openssl-3.0.x` ensures Vercel's runtime is supported
3. **Data Proxy Mode**: Using `PRISMA_GENERATE_DATAPROXY=true` enables serverless-friendly mode
4. **Explicit npx Commands**: Using `npx prisma` ensures the command is found during builds
5. **Preview Features**: Driver adapters provide better serverless compatibility

## Troubleshooting

If you still encounter issues:

1. **Check Environment Variables**: Ensure `DATABASE_URL` is set correctly in Vercel
2. **Check Build Logs**: Look for "Generated Prisma Client" message
3. **Verify Database Connection**: Ensure your database is accessible from Vercel
4. **Check Node Version**: Ensure Vercel is using Node.js 18.x or later

## Additional Notes

- The binary targets are automatically downloaded during Vercel's build process
- Local development uses the Windows binary (`native`)
- Production uses the RHEL binary (`rhel-openssl-3.0.x`)
- The `postinstall` script ensures Prisma client is generated after `npm install`

## Success Criteria

✅ No "Query Engine not found" errors in production  
✅ All API endpoints respond with 200 status  
✅ Database queries execute successfully  
✅ Build completes in under 3 minutes

## Contact

If issues persist, check:

- [Prisma Deployment Docs](https://www.prisma.io/docs/guides/deployment/deploying-to-vercel)
- [Vercel Support](https://vercel.com/support)
