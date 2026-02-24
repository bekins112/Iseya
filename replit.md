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
- **Basic (Free)**: ₦0 - Post 1 job, browse platform
- **Standard**: ₦9,999/month - Post up to 5 jobs
- **Premium**: ₦24,999/month - Post up to 10 jobs, priority listing, verified badge
- **Enterprise**: ₦44,999/month - Unlimited job postings, top priority, dedicated support

### Job Posting Limits
- Enforced server-side in job creation route
- Basic (free): 1 job, Standard: 5 jobs, Premium: 10 jobs, Enterprise: unlimited
- Counts only active jobs (deactivated jobs don't count against limit)

### Payment Gateways
Users choose between Paystack and Flutterwave at checkout via a dialog.

#### Paystack
- Payment initialization: `POST /api/subscription/initialize` (requires auth)
- Payment verification: `GET /api/subscription/verify?reference=xxx`
- Webhook: `POST /api/subscription/webhook` (HMAC-SHA512 signature verification)
- **Required Secrets**: `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`

#### Flutterwave
- Payment initialization: `POST /api/subscription/flutterwave/initialize` (requires auth)
- Payment verification: `GET /api/subscription/flutterwave/verify?transaction_id=xxx`
- Webhook: `POST /api/subscription/flutterwave/webhook` (verif-hash header verification)
- Callback redirect includes `?gateway=flutterwave` to distinguish from Paystack
- Amounts sent in Naira (not kobo) - Flutterwave uses whole currency units
- **Required Secrets**: `FLW_SECRET_KEY`, `FLW_PUBLIC_KEY`, `FLW_SECRET_HASH`

#### Shared
- Subscription status: `GET /api/subscription/status`

## Email System (Mailjet)

### Transactional Email via Mailjet
- **Module**: `server/email.ts` — all email functions use Mailjet API v3.1 via `node-mailjet`
- **Required Secrets**: `MJ_APIKEY_PUBLIC`, `MJ_APIKEY_PRIVATE`, `MJ_SENDER_EMAIL`
- All emails use branded HTML templates with yellow-gold Iṣéyá header
- Emails are fire-and-forget (`.catch(() => {})`) — failures are logged but don't block user actions

### Email Types Sent
| Event | Recipients | Function |
|-------|-----------|----------|
| Registration | New user | `sendWelcomeEmail` |
| Application submitted | Applicant + Employer | `sendApplicationReceivedEmail` + `sendNewApplicationNotifyEmployer` |
| Application status changed | Applicant | `sendApplicationStatusEmail` (shortlisted/rejected/accepted/offered) |
| Offer sent | Applicant | `sendOfferEmail` |
| Offer accepted/declined | Employer | `sendOfferResponseEmail` |
| Interview scheduled | Applicant | `sendInterviewScheduledEmail` |
| Subscription activated | Employer | `sendSubscriptionEmail` (Paystack + Flutterwave) |
| Verification approved | Applicant | `sendVerificationApprovedEmail` |
| Verification rejected | Applicant | `sendVerificationRejectedEmail` |
| Email verification code | User | `sendVerificationEmail` (currently disabled) |
| Password reset | User | `sendPasswordResetEmail` (available, not yet wired) |

### Email Verification (DISABLED)
- Email verification has been temporarily disabled per user request
- All enforcement removed: no frontend redirect to `/verify-email`, no backend 403 checks
- Schema fields (`emailVerified`, `emailVerificationCode`, `emailVerificationExpiry`) remain in database for future use
- Verification API routes still exist but are not enforced

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
- `/admin/verifications` - Applicant identity verification request management

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

## Applicant Verification System

### Overview
Applicants can get verified by submitting government-issued ID and paying a one-time fee of ₦9,999. Verified applicants receive a verified badge, priority in application listings, background check from the team, and are more attractive to employers.

### Verification Flow
1. Applicant navigates to `/verification` (via sidebar "Get Verified" link)
2. Submits government ID (NIN, Voter's Card, Driver's License, or International Passport) with ID number, document photo, and selfie
3. Pays ₦9,999 via Paystack or Flutterwave
4. Request moves to "under_review" status
5. Admin reviews documents at `/admin/verifications` and approves/rejects
6. On approval, user's `isVerified` field is set to `true`

### Verification Benefits
- Verified badge displayed on profile and application cards
- Applications sorted with verified applicants first
- Background check performed by admin team
- Higher employer confidence for pre-offer interviews

### API Routes
- `GET /api/verification/status` - Get current user's verification status
- `POST /api/verification/submit` - Submit verification documents (multipart form)
- `POST /api/verification/pay/paystack` - Initialize Paystack payment for verification
- `GET /api/verification/verify/paystack` - Verify Paystack payment
- `POST /api/verification/pay/flutterwave` - Initialize Flutterwave payment for verification
- `GET /api/verification/verify/flutterwave` - Verify Flutterwave payment
- `GET /api/admin/verification-requests` - Admin: list all verification requests
- `PATCH /api/admin/verification-requests/:id` - Admin: approve/reject verification

### Database Table
- `verification_requests` - Tracks verification requests with ID type, number, document URLs, status (pending/under_review/approved/rejected), admin notes, and review info

### Setting Up the First Admin
To make yourself an admin, update your user role in the database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```
