# SaaS Setup Guide

This document outlines the setup for your SaaS application with Prisma (PostgreSQL), Clerk authentication, and Stripe payments.

## 🗄️ Database Setup (PostgreSQL + Prisma)

### 1. Install PostgreSQL

**Windows:**

- Download from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)
- Install and set a password for the `postgres` user

**macOS:**

```bash
brew install postgresql
brew services start postgresql
```

**Linux:**

```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### 2. Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE saas_db;

# Exit psql
\q
```

### 3. Update .env file

Update your `.env` file with your actual PostgreSQL credentials:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/saas_db?schema=public"
```

### 4. Run Prisma Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init

# (Optional) View database in Prisma Studio
npx prisma studio
```

## 🔐 Clerk Authentication Setup

### 1. Create Clerk Account

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Choose "Next.js" as your framework

### 2. Get API Keys

From your Clerk dashboard:

- Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Copy `CLERK_SECRET_KEY`

### 3. Update .env file

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/auth/v1/login"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/auth/v1/register"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
```

### 4. Configure Webhooks in Clerk

1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy the webhook signing secret to `.env`:

```env
WEBHOOK_SECRET="whsec_..."
```

## 💳 Stripe Payments Setup

### 1. Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account (use test mode for development)

### 2. Get API Keys

From Stripe Dashboard → Developers → API keys:

- Copy `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Copy `Secret key` → `STRIPE_SECRET_KEY`

### 3. Update .env file

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

### 4. Configure Webhooks in Stripe

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret to `.env`:

```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 5. Create Products in Stripe

1. Go to Stripe Dashboard → Products
2. Create subscription products (e.g., Basic, Pro, Enterprise)
3. Note the Price IDs for your app

## 🚀 Running the Application

### Development

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── webhooks/      # Clerk & Stripe webhooks
│   │   ├── (main)/
│   │   │   ├── auth/          # Authentication pages
│   │   │   └── dashboard/     # Dashboard pages
│   │   └── layout.tsx         # Root layout with ClerkProvider
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── stripe.ts          # Stripe client
│   ├── middleware.ts          # Clerk middleware for route protection
│   └── types/                 # TypeScript types
└── .env                       # Environment variables
```

## 🔄 Database Models

### User

- Synchronized with Clerk authentication
- Stores email, username, name, avatar
- Can belong to multiple organizations

### Organization

- Represents a team/organization
- Has one owner (User)
- Can have multiple members (Membership)
- Stores Stripe subscription information

### Membership

- Many-to-Many relation between User and Organization
- Roles: member, admin, owner

### Subscription

- Tracks subscription history
- Linked to User and Organization
- Stores Stripe subscription details

## 🎯 Next Steps

1. **Set up your database** and run migrations
2. **Configure Clerk** and test authentication
3. **Set up Stripe** and create products
4. **Test webhooks** using Stripe CLI for local development
5. **Customize the UI** to match your brand
6. **Build features** on top of this foundation

## 🧪 Testing Webhooks Locally

### Stripe CLI

```bash
# Install Stripe CLI
# Download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Clerk Webhooks (Local Development)

For local development, use ngrok or similar to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3000

# Use the ngrok URL in Clerk webhook settings
```

## 📚 Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

## 🐛 Troubleshooting

### Database Connection Issues

- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists

### Clerk Authentication Not Working

- Verify API keys in .env
- Check middleware configuration
- Ensure ClerkProvider is in root layout

### Stripe Webhook Not Working

- Verify webhook secret in .env
- Check webhook endpoint in Stripe dashboard
- Test locally with Stripe CLI

### Prisma Client Not Generated

- Run `npx prisma generate`
- Check schema.prisma syntax
- Ensure DATABASE_URL is set

---

**Happy Coding! 🚀**
