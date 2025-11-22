# ZenVerifier - Email Verification & Validation Platform

**ZenVerifier** - A powerful email verification and validation platform built with modern technologies.

<img src="https://github.com/arhamkhnz/next-shadcn-admin-dashboard/blob/main/media/dashboard.png?version=5" alt="ZenVerifier Dashboard">

ZenVerifier provides comprehensive email verification services with support for single email validation and bulk verification jobs. Built with a modern tech stack, it offers real-time verification, detailed analytics, credit-based billing, and a beautiful, intuitive interface.

## Features

### Email Verification
- **Single Email Verification**: Instantly verify individual email addresses
- **Bulk Verification**: Upload CSV files and process thousands of emails
- **Real-time Results**: Get immediate validation results with detailed metrics
- **Verification History**: Track all verifications with comprehensive filtering

### Platform Features
- **Credit-Based Billing**: Integrated Stripe payment system with flexible credit packages
- **Authentication**: Secure authentication via Clerk with user management
- **Modern Dashboard**: Real-time analytics and verification statistics
- **API Access**: RESTful API for seamless integration
- **Responsive Design**: Beautiful UI that works on all devices
- **Theme Customization**: Multiple theme presets with light/dark mode support
- **Database**: PostgreSQL with Prisma ORM for reliable data management  

> [!NOTE]
> ZenVerifier uses the **Unibox** theme with a modern purple/blue color scheme.  
> Additional color presets are available:  
>
> - Tangerine  
> - Neo Brutalism  
> - Soft Pop  
>
> You can customize themes or create new presets by modifying the CSS variables in `src/app/globals.css`.  

## Tech Stack

- **Framework**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4  
- **UI Components**: Shadcn UI  
- **Authentication**: Clerk  
- **Database**: PostgreSQL with Prisma ORM  
- **Payments**: Stripe  
- **Email Verification**: MillionVerifier API  
- **Validation**: Zod  
- **Forms & State Management**: React Hook Form, Zustand  
- **Tables & Data Handling**: TanStack Table  
- **Tooling & DX**: ESLint, Prettier, Husky  

## Pages & Features

### Available
- **Dashboard**: Overview with verification statistics and recent activity
- **Single Verification**: Verify individual email addresses
- **Bulk Verification**: Upload and process CSV files
- **Verification History**: View all past verifications with filtering
- **Bulk Jobs**: Manage and monitor bulk verification jobs
- **Billing**: Stripe integration for credit purchases and subscription management
- **Top Up**: Add credits to your account
- **Account Settings**: Manage profile and API keys
- **Authentication**: Login and registration flows

### Coming Soon
- **API Documentation**: Interactive API documentation
- **Webhooks**: Real-time notifications for verification events
- **Team Management**: Collaborate with team members
- **Advanced Analytics**: Detailed insights and reporting  

## Colocation File System Architecture

This project follows a **colocation-based architecture** each feature keeps its own pages, components, and logic inside its route folder.  
Shared UI, hooks, and configuration live at the top level, making the codebase modular, scalable, and easier to maintain as the app grows.

For a full breakdown of the structure with examples, see the [Next Colocation Template](https://github.com/arhamkhnz/next-colocation-template).

## Getting Started

### Prerequisites

Before running ZenVerifier, you'll need:
- Node.js 18+ installed
- PostgreSQL database
- Clerk account for authentication
- Stripe account for payments
- MillionVerifier API key

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/v2/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/v2/register

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# MillionVerifier
MILLIONVERIFIER_API_KEY=
```

### Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/arhamkhnz/next-shadcn-admin-dashboard.git
   cd next-shadcn-admin-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup database**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

Your app will be running at [http://localhost:3000](http://localhost:3000)

### Deploy with Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Farhamkhnz%2Fnext-shadcn-admin-dashboard)

Make sure to configure all environment variables in your Vercel project settings.

---

## Documentation

For detailed setup guides, see:
- `ENVIRONMENT_SETUP.md` - Environment configuration
- `BACKEND_SETUP.md` - Backend and database setup
- `SAAS_SETUP.md` - SaaS features and billing setup
- `STRIPE_SETUP_COMPLETE.md` - Stripe integration guide

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

See the LICENSE file for details.

---

**Built with ❤️ for seamless email verification**
