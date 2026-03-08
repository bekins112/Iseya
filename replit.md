# Iṣéyá - Job Marketplace Platform

## Overview
Iṣéyá is a job marketplace platform designed to connect casual workers with employers for short-term or part-time job opportunities. The platform aims to streamline the process of finding and offering casual work, fostering a dynamic marketplace with features like role-based access, job browsing and application for workers, and job posting and management for employers.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **Styling**: Tailwind CSS with shadcn/ui (New York variant)
- **Animations**: Framer Motion
- **Build Tool**: Vite
- **Architecture**: Page-based with shared components, custom hooks for API abstraction, and role-based UI rendering, including an onboarding flow.
- **Landing Page**: Features a banner carousel, job search/filter bar, recently posted jobs grid, "How It Works" section, testimonials, and footer.
- **UI/UX**: Consistent styling across legal pages, cookie consent banner with framer-motion animations, newsletter subscription bar.

### Backend
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Session Management**: express-session with connect-pg-simple
- **Authentication**: Replit Auth (OpenID Connect) via Passport.js
- **API**: Routes defined in `server/routes.ts` with shared contracts in `shared/routes.ts` using Zod for validation. Database operations are abstracted by a storage layer (`server/storage.ts`).

### Data Storage
- **Database**: PostgreSQL
- **Key Tables**: `users`, `jobs`, `applications`, `sessions`, `notifications`, `notification_reads`, `platform_settings`, `verification_requests`, `tickets`, `ticket_messages`, `internal_ads`, `newsletter_subscribers`.

### Authentication & Access Control
- Custom email/password authentication with bcrypt hashing, CAPTCHA protection, and Google OAuth via Passport.js. Sessions are PostgreSQL-stored.
- **Password Reset**: Forgot password flow with email-based reset tokens (1-hour expiry). Pages: `/forgot-password`, `/reset-password?token=...`. API: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`.
- **Admin Login**: Dedicated admin login page at `/admin/login` with separate email/password/CAPTCHA form. Redirects to `/admin/dashboard` on success.
- New users complete an onboarding process.
- **Gating**: Non-verified applicants have restricted application management and masked contact info. Free-tier employers have job posting limits and restricted job/applicant management.
- **Admin Dashboard**: Role-based access with granular permissions for managing users, jobs, applications, subscriptions, transactions, tickets, reports, verifications, notifications, ads/popups, and settings. Admin can bypass ownership checks for application management.
- **Admin User Management**: Full CRUD on `/admin/users` — view details (profile, contact, subscription, company info), edit (basic info, role, verification, subscription tier/expiry), suspend/unsuspend with reason, and permanently delete users (cascading deletion of all related records). Suspended users are blocked from login and existing sessions are invalidated.
- **User Suspension**: `isSuspended`, `suspendedAt`, `suspendedReason` columns on users table. Suspension blocks login and destroys active sessions via `isAuthenticated` middleware check.

### Subscription System
- Supports `free`, `standard`, `premium`, `enterprise` tiers with varying job posting limits and feature access.
- Dynamic, admin-configurable pricing with per-tier discounts, job posting limits, and interview credits (all managed from Platform Settings).
- Payment gateways: Paystack and Flutterwave.
- **Transaction History**: Users can view their transaction history. Failed/pending transactions are recorded and can be resolved by admins.
- **Interview Credits**: Premium/Enterprise employers receive interview credits, tracked against billing periods. Admin-scheduled interviews count against employer credits.
- **Applicant Recommendations**: Premium/Enterprise employers receive "Iṣéyá Recommendations" based on applicant scoring (verification, CV, bio, experience, location, profile photo, phone, age, gender, job history, admin rating). Scores categorize applicants into "Excellent", "Good", "Fair", "Basic" match levels.
- **Admin Assessment**: Admins can rate applicants (1-5 stars) and add notes post-interview/background check, displayed on applicant and recommendation cards.

### Email System
- Uses Mailjet for transactional emails (e.g., welcome, application notifications, subscription updates).
- All emails use branded HTML templates.

### Facebook Auto-Posting
- When premium or enterprise employers post jobs, they are automatically shared to the Iṣéyá Facebook Page via the Graph API.
- Requires `FACEBOOK_PAGE_ACCESS_TOKEN` and `FACEBOOK_PAGE_ID` environment variables.
- Posts include job title, location, category, type, salary, employer name, description excerpt, apply link, and hashtags.
- Runs asynchronously (non-blocking) — job creation succeeds regardless of Facebook API result.
- Implementation: `server/facebook.ts`, triggered from job creation route in `server/routes.ts`.

### Profile Management
- Centralized `/profile` page for all user profile management.
- **All users**: First name, last name, role, location, bio, profile photo.
- **Applicants**: Gender, age, phone, email, expected salary range, preferred job types/categories, CV upload, job history.
- **Employers**: Company name, business category, company email, company phone, company address, CAC registration.
- Applicants can select multiple preferred job types and categories, stored as text array columns, for future job alerts.

### Applicant Verification System
- Applicants can submit government ID and pay a fee for verification, valid for 30 days. Provides a verified badge, priority, and background checks.
- Admin reviews and approves/rejects requests.

### Notification System
- Admin can send notifications to all users, specific roles, or individuals.
- Users receive in-app notifications with unread counts and management options (mark as read, mark all read).
- **Automated Workflow Notifications**: System sends notifications for application status changes, offers, interview scheduling, and support ticket updates.

### Support Ticket System
- Users can submit and track support tickets via a `/support` page.
- Features a conversation thread for user-admin communication.
- New message indicators and in-app notifications for ticket updates.
- Admin manages tickets from `/admin/tickets`, including status/priority editing and replying.

### Legal & Policy Pages
- Comprehensive legal pages: `/terms` (Terms of Use), `/cookies` (Cookie Policy), `/privacy` (Privacy Policy - NDPR compliant), `/disclaimer`, `/copyright`.
- Registration requires agreement to Terms of Use. Optional newsletter subscription.

### Internal Ads & Popups
- Admin can create, manage, and schedule promotional banners and popups via `/admin/ads` (gated by `canManageAds` permission, separate from Platform Settings).
- Ads have: title, content, type (banner/popup), target pages (landing, browse-jobs, job-details), optional CTA link, custom colors, priority, scheduling (start/end dates), active toggle, optional artwork/media image upload (stored in `uploads/ads/`).
- Banners display as dismissible horizontal bars at the top of page content areas. Popups display as centered modal dialogs.
- Dismissals are tracked per-session (sessionStorage per ad ID).
- Components: `InternalAd.tsx` (AdBanner, AdPopup), `PageAds.tsx` (fetches & renders ads for a page).

### Login Security
- Implements image-based CAPTCHA on the login form for bot protection.

## External Dependencies

### Database
- **PostgreSQL**: Primary data store.
- **Drizzle ORM**: Type-safe database queries.

### Authentication
- **Replit Auth**: OpenID Connect provider.

### UI Component Libraries
- **shadcn/ui**: Accessible components.
- **Radix UI**: Headless UI primitives.
- **Lucide React**: Icon library.

### Payment Gateways
- **Paystack**: Payment processing.
- **Flutterwave**: Payment processing.

### Email Service
- **Mailjet**: Transactional email delivery.

### Key NPM Packages
- `@tanstack/react-query`: Data fetching and caching.
- `react-hook-form` with `@hookform/resolvers`: Form handling and validation.
- `drizzle-zod`: Zod schemas from Drizzle.
- `framer-motion`: Animations.
- `date-fns`: Date utilities.
- `svg-captcha`: CAPTCHA generation.
- `node-mailjet`: Mailjet API client.