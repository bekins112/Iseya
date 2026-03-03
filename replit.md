# Iṣéyá - Job Marketplace Platform

## Overview

Iṣéyá is a job marketplace platform connecting casual workers (applicants) with employers for short-term or part-time job opportunities. It features role-based access, allowing applicants to browse and apply for jobs, and employers to post and manage listings. The platform aims to streamline the process of finding and offering casual work, fostering a dynamic marketplace.

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
- **Architecture**: Page-based with shared components, custom hooks for API abstraction, and role-based UI rendering. Includes an onboarding flow for new users.

### Backend
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Session Management**: express-session with connect-pg-simple
- **Authentication**: Replit Auth (OpenID Connect) via Passport.js
- **API**: Routes defined in `server/routes.ts` with shared contracts in `shared/routes.ts` using Zod for validation. Storage layer (`server/storage.ts`) abstracts database operations.

### Data Storage
- **Database**: PostgreSQL
- **Key Tables**: `users` (profiles, roles, subscription), `jobs` (listings), `applications`, `sessions`, `notifications`, `notification_reads`, `platform_settings`, `verification_requests`.

### Authentication & Access Control
- Replit Auth for OAuth/OpenID Connect. Sessions stored in PostgreSQL.
- New users are directed to onboarding.
- **Applicant Gating**: Non-verified applicants can apply but cannot cancel/withdraw applications or respond to offers. Contact info and CVs are masked from employers for unverified applicants.
- **Employer Gating**: Free-tier employers have job posting limits (1 job) and cannot manage jobs, view applicant lists, update application status, or send offers.
- **Admin Dashboard**: Role-based access with configurable permissions (`canViewStats`, `canManageUsers`, `canManageJobs`, `canManageApplications`, `canManageAdmins`, `canManageSubscriptions`, `canManageTransactions`, `canManageTickets`, `canManageReports`, `canManageVerifications`, `canManageNotifications`, `canManageSettings`).

### Subscription System
- Tracks `subscriptionStatus` (`free`, `standard`, `premium`, `enterprise`).
- Employer subscription plans determine job posting limits and access to features.
- Prices are dynamic, configurable by admin, with per-tier discounts.
- Supports Paystack and Flutterwave for payments.

### Email System
- Uses Mailjet for transactional emails (e.g., welcome, application notifications, subscription updates).
- All emails use branded HTML templates.
- Email verification is currently disabled but infrastructure remains.

### Applicant Verification System
- Applicants can submit government-issued ID and pay a fee for verification.
- Verification is valid for 30 days and provides benefits like a verified badge, priority in application listings, and background checks.
- Admin reviews and approves/rejects verification requests.

### Notification System
- Admin can send notifications to all users, specific roles (applicant/employer), or individual users.
- Users see a notification bell in the sidebar header with unread count badge.
- Click bell opens dropdown with recent notifications, mark as read, mark all read.
- Admin has dedicated "Notifications" management page at `/admin/notifications` with form to create and list to manage.
- Tables: `notifications` (id, title, message, type, targetRole, targetUserId, createdBy, createdAt) and `notification_reads` (id, notificationId, userId, readAt).
- Components: `NotificationBell` (client/src/components/NotificationBell.tsx), `AdminNotifications` (client/src/pages/AdminNotifications.tsx).
- API routes: GET/POST `/api/notifications`, GET `/api/notifications/unread-count`, POST `/api/notifications/:id/read`, POST `/api/notifications/read-all`, GET/POST/DELETE `/api/admin/notifications`.

### Login Security
- Implements image-based CAPTCHA on the login form for bot protection.

## External Dependencies

### Database
- **PostgreSQL**: Primary data store.
- **Drizzle ORM**: Type-safe database queries.

### Authentication
- **Replit Auth**: OpenID Connect provider.

### UI Component Libraries
- **shadcn/ui**: Accessible components based on Radix UI.
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