# MillionVerifier Dashboard Backend Setup Guide

## Overview

This guide will help you set up the backend for the MillionVerifier Dashboard, which integrates with the MillionVerifier API to provide email verification services.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- MillionVerifier API account
- Clerk account for authentication
- Stripe account for payments (optional)

## Environment Setup

### 1. Create Environment File

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/millionverifier_dashboard?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# MillionVerifier API (REQUIRED - This is the main API key for all users)
MILLION_VERIFIER_API_KEY=your_millionverifier_api_key

# Stripe (for credit purchases)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Setup

1. Create a PostgreSQL database
2. Update the `DATABASE_URL` in your `.env` file
3. Run database migrations:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

## API Endpoints

### Authentication Required

All API endpoints require Clerk authentication. The user must be logged in to access these endpoints.

### Single Email Verification

- **POST** `/api/verification/single`
- **Body**: `{ "email": "test@example.com", "timeout": 20 }`
- **Response**: MillionVerifier API response with verification results

### Bulk Email Verification

- **POST** `/api/verification/bulk/upload`
- **Body**: FormData with CSV file
- **Response**: Upload result with file ID

- **GET** `/api/verification/bulk/list`
- **Query**: Optional filters (offset, limit, status, etc.)
- **Response**: List of bulk jobs

- **GET** `/api/verification/bulk/status?fileId=123`
- **Response**: Current status of bulk job

- **GET** `/api/verification/bulk/download?fileId=123&filter=all`
- **Response**: CSV file download

- **POST** `/api/verification/bulk/stop`
- **Body**: `{ "fileId": "123" }`
- **Response**: Success confirmation

- **DELETE** `/api/verification/bulk/delete`
- **Body**: `{ "fileId": "123" }`
- **Response**: Success confirmation

### Credits Management

- **GET** `/api/credits/balance`
- **Response**: Current credit balance from MillionVerifier

### Verification History

- **GET** `/api/verification/history`
- **Query**: Optional filters (page, limit, email, result, quality, dateFrom, dateTo)
- **Response**: Paginated verification history with statistics

## Database Schema

### New Tables Added

1. **VerificationHistory** - Stores individual email verification results
2. **BulkJob** - Tracks bulk verification jobs
3. **CreditTransaction** - Records credit usage and purchases

### Updated Tables

1. **User** - Standard user fields (no API key storage needed)

## Error Handling

The API includes comprehensive error handling:

- **400** - Bad Request (validation errors, missing parameters)
- **401** - Unauthorized (not logged in)
- **402** - Payment Required (insufficient credits)
- **404** - Not Found (file not found, user not found)
- **500** - Internal Server Error

## Testing

### Test API Keys

MillionVerifier provides test API keys for development:

- `API_KEY_FOR_TEST` - Returns random results
- `API_KEY_FOR_OK` - Always returns "ok" result
- `API_KEY_FOR_INVALID` - Always returns "invalid" result
- `API_KEY_FOR_ERROR` - Always returns error

### Example Usage

#### Single Verification

```javascript
const response = await fetch("/api/verification/single", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "test@example.com" }),
});
const result = await response.json();
```

#### Bulk Upload

```javascript
const formData = new FormData();
formData.append("file", csvFile);

const response = await fetch("/api/verification/bulk/upload", {
  method: "POST",
  body: formData,
});
const result = await response.json();
```

#### Get Credits

```javascript
const response = await fetch("/api/credits/balance");
const credits = await response.json();
```

## Security Considerations

1. **API Key Management**: The MillionVerifier API key is stored securely in environment variables
2. **Rate Limiting**: Consider implementing rate limiting for API endpoints
3. **File Upload Limits**: CSV files are limited to 50MB
4. **Input Validation**: All inputs are validated using Zod schemas

## Production Deployment

1. **Environment Variables**: Use secure environment variable management
2. **Database**: Use managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
3. **API Keys**: Keep MillionVerifier API key secure and rotate regularly
4. **Monitoring**: Implement logging and monitoring for API usage
5. **Backup**: Regular database backups

## Troubleshooting

### Common Issues

1. **Database Connection**: Check DATABASE_URL format
2. **API Key Issues**: Verify MILLION_VERIFIER_API_KEY is set correctly
3. **File Upload**: Ensure CSV files are properly formatted
4. **Authentication**: Check Clerk configuration

### Debug Mode

Set `NODE_ENV=development` to enable detailed error messages.

## Support

For issues related to:

- MillionVerifier API: Contact MillionVerifier support
- Clerk Authentication: Check Clerk documentation
- Database Issues: Check Prisma documentation
- Stripe Integration: Check Stripe documentation
