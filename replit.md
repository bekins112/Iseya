# Iṣéyá - Job Marketplace Platform

## Overview

Iṣéyá is a job marketplace platform connecting casual workers (applicants) with employers posting short-term or part-time job opportunities. The application features role-based access where applicants can browse and apply for jobs while employers can post and manage job listings. Built with a modern React frontend and Express backend, using PostgreSQL for data persistence and Replit Auth for authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Build Tool**: Vite with custom plugins for Replit integration

The frontend follows a page-based architecture with shared components. Key patterns:
- Custom hooks (`use-auth.ts`, `use-casual.ts`) abstract API calls and state
- Role-based UI rendering (applicant vs employer dashboards)
- Onboarding flow for new users to set role and profile details

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session storage
- **Authentication**: Replit Auth (OpenID Connect) integrated via Passport.js

API routes are defined in `server/routes.ts` with a shared route contract in `shared/routes.ts` using Zod for validation. The storage layer (`server/storage.ts`) abstracts all database operations.

### Data Storage
- **Database**: PostgreSQL (provisioned via Replit)
- **Schema Location**: `shared/schema.ts` and `shared/models/auth.ts`
- **Key Tables**:
  - `users` - User profiles with role (applicant/employer/admin), subscription status
  - `jobs` - Job postings linked to employer users
  - `applications` - Job applications linking applicants to jobs
  - `sessions` - Server-side session storage for authentication

### Authentication Flow
- Replit Auth handles OAuth/OpenID Connect login
- Sessions stored in PostgreSQL via `connect-pg-simple`
- User data upserted on first login via `authStorage.upsertUser()`
- Protected routes use `isAuthenticated` middleware
- New users redirected to `/onboarding` to complete profile

### Build System
- Development: `tsx` runs TypeScript directly with Vite dev server
- Production: Custom build script bundles server with esbuild, client with Vite
- Database migrations: `drizzle-kit push` for schema synchronization

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Authentication
- **Replit Auth**: OpenID Connect provider (configured via `ISSUER_URL`, defaults to `https://replit.com/oidc`)
- **Required Environment Variables**:
  - `DATABASE_URL` - PostgreSQL connection string
  - `SESSION_SECRET` - Secret for session encryption
  - `REPL_ID` - Replit identifier for OAuth client

### UI Component Libraries
- **shadcn/ui**: Pre-built accessible components based on Radix UI primitives
- **Radix UI**: Headless UI primitives for dialogs, dropdowns, forms, etc.
- **Lucide React**: Icon library

### Key NPM Packages
- `@tanstack/react-query` - Data fetching and caching
- `react-hook-form` with `@hookform/resolvers` - Form handling with Zod validation
- `drizzle-zod` - Generate Zod schemas from Drizzle table definitions
- `framer-motion` - Animation library
- `date-fns` - Date formatting utilities

## Subscription System

### Current Implementation
- Subscription status tracked in `users.subscriptionStatus` field ('free', 'standard', 'premium', 'enterprise')
- Subscription page at `/subscription` for employers to view/upgrade plans
- Payment verification page at `/subscription/verify` (Paystack callback)
- **Basic (Free)**: ₦0 - No job postings, browse platform only
- **Standard**: ₦9,999/month - Post up to 3 jobs
- **Premium**: ₦24,999/month - Post up to 10 jobs, priority listing, verified badge
- **Enterprise**: ₦44,999/month - Unlimited job postings, top priority, dedicated support

### Job Posting Limits
- Enforced server-side in job creation route
- Basic (free): 0 jobs, Standard: 3 jobs, Premium: 10 jobs, Enterprise: unlimited
- Counts only active jobs (deactivated jobs don't count against limit)

### Paystack Payment Integration
- Payment initialization: `POST /api/subscription/initialize` (requires auth)
- Payment verification: `GET /api/subscription/verify?reference=xxx`
- Webhook: `POST /api/subscription/webhook`
- Subscription status: `GET /api/subscription/status`
- **Required Secrets**:
  - `PAYSTACK_SECRET_KEY` - Starts with 'sk_test_' or 'sk_live_'
  - `PAYSTACK_PUBLIC_KEY` - Starts with 'pk_test_' or 'pk_live_'
  - Get keys from: https://dashboard.paystack.com/#/settings/developers

## Email Verification System

### Current Status: DISABLED
- Email verification has been temporarily disabled per user request
- All enforcement removed: no frontend redirect to `/verify-email`, no backend 403 checks
- Registration no longer generates/sends verification codes
- Schema fields (`emailVerified`, `emailVerificationCode`, `emailVerificationExpiry`) remain in database for future use
- Verification API routes (`POST /api/auth/send-verification`, `POST /api/auth/verify-email`) still exist but are not enforced
- **To re-enable**: Add email verification checks back in `client/src/App.tsx`, `server/routes.ts` (job create + application create), and registration flow in `server/auth.ts`
- **Email module**: `server/email.ts` uses Resend API (requires `RESEND_API_KEY` secret)

### Login Security
- Image-based CAPTCHA on login form using svg-captcha (server-side validated)
- Server generates distorted text image, user must type the characters they see
- CAPTCHA stored in session and validated on the server during login (not bypassable)
- Fresh CAPTCHA loaded on page load and after each failed attempt

## Employer Company Profile Fields
- `companyName`, `businessCategory`, `companyLogo` (original)
- `companyAddress`, `companyCity`, `companyState` (Nigerian states)
- `isRegisteredCompany` (boolean), `companyRegNo` (CAC registration number, shown when registered)

## Admin Dashboard System

### Admin Roles and Permissions
- **Primary Admin**: Full access to all platform features (no permissions record needed)
- **Sub-Admin**: Configurable access based on permissions record in `admin_permissions` table

### Permission Levels
Each sub-admin can be granted any combination of these permissions:
- `canViewStats` - View platform statistics and analytics
- `canManageUsers` - View, edit roles, and verify users
- `canManageJobs` - View, edit, activate/deactivate, and delete job postings
- `canManageApplications` - View all applications across the platform
- `canManageAdmins` - Create and manage other sub-admin accounts

### Admin Pages
- `/admin` - Dashboard with platform overview and stats
- `/admin/statistics` - Detailed analytics with breakdowns by role, category, and status
- `/admin/users` - User management with search and role filtering
- `/admin/jobs` - Job management with activate/deactivate and delete options
- `/admin/subscriptions` - Employer subscription management (upgrade/downgrade, set end dates)
- `/admin/tickets` - Support ticket management with assignment, priority, and status workflow
- `/admin/reports` - User and job reports review with action tracking
- `/admin/sub-admins` - Sub-admin creation and permission management

### Admin API Routes (all require admin role)
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List all users with optional role/search filters
- `PATCH /api/admin/users/:id` - Update user role/verification
- `GET /api/admin/jobs` - List all jobs
- `PATCH /api/admin/jobs/:id` - Update job status
- `DELETE /api/admin/jobs/:id` - Delete job
- `GET /api/admin/applications` - List all applications
- `GET /api/admin/admins` - List all admin users with permissions
- `POST /api/admin/admins` - Create new sub-admin with permissions
- `PATCH /api/admin/admins/:userId/permissions` - Update sub-admin permissions
- `DELETE /api/admin/admins/:userId` - Remove admin privileges
- `GET /api/admin/my-permissions` - Get current admin's permissions

### Setting Up the First Admin
To make yourself an admin, update your user role in the database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```
