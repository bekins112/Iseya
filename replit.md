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
- **Landing Page**: Features banner carousel, job search/filter bar (search, category, location, job type), recently posted jobs grid (up to 6 cards fetched from API), stats, "How It Works" tabs, testimonials, and footer.

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
- **Interview Credits**: Premium employers get 3 interview credits per billing period, Enterprise gets 5. Standard/Free get 0. Credits are tracked via `interviewCreditsUsed` field and counted from interviews created since billing period start.
- **Applicant Recommendations**: Premium/Enterprise employers see "Iṣéyá Recommendations" on ManageApplicants page. Applicants are scored (0-100+) based on: verification status (30pts), CV upload (15pts), bio (10pts), relevant experience (10pts), location match (10pts), profile photo (5pts), phone (5pts), location (5pts), gender match (5pts), age range match (5pts), job history (5pts each, max 15pts). Match levels: Excellent (60+), Good (40+), Fair (20+), Basic.
- API: `GET /api/interview-credits` returns credits info, `GET /api/jobs/:jobId/recommended-applicants` returns scored applicants.

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
- **Automatic job workflow notifications**:
  - Applicant applies → employer gets "New Application Received" notification.
  - Employer updates application status (shortlisted/rejected/accepted) → applicant gets "Application [Status]" notification.
  - Applicant withdraws application → employer gets "Application Withdrawn" notification.
  - Employer sends offer → applicant gets "You Received a Job Offer!" notification with salary.
  - Applicant accepts/declines offer → employer gets "Offer Accepted/Declined" notification.
  - Employer schedules interview → applicant gets "Interview Scheduled" notification with details.
- Tables: `notifications` (id, title, message, type, targetRole, targetUserId, createdBy, createdAt) and `notification_reads` (id, notificationId, userId, readAt).
- Components: `NotificationBell` (client/src/components/NotificationBell.tsx), `AdminNotifications` (client/src/pages/AdminNotifications.tsx).
- API routes: GET/POST `/api/notifications`, GET `/api/notifications/unread-count`, POST `/api/notifications/:id/read`, POST `/api/notifications/read-all`, GET/POST/DELETE `/api/admin/notifications`.

### Support Ticket System
- Applicants and employers can submit support tickets from their dashboard via `/support` page.
- Users can track ticket status (open, in progress, resolved, closed) and view admin responses.
- **Conversation thread**: Both users and admin can exchange messages in a chat-like interface within each ticket.
- **New message indicators**: Unread reply counts shown on ticket list items (pulsing badge) with ring highlight. Fetched via `/api/tickets/unread-counts`.
- **Notifications**: In-app notifications sent when tickets are created, updated, or replied to.
- Ticket creation sends email confirmation to the user and notification email to the primary admin.
- Admin manages all tickets from `/admin/tickets` with status/priority editing and reply capability.
- Tables: `tickets`, `ticket_messages` (conversation thread with sender role tracking and read status).
- Email templates: `sendTicketCreatedEmail` (user confirmation), `sendTicketAdminNotifyEmail` (admin alert).
- Components: `Support` (client/src/pages/Support.tsx), `AdminTickets` (client/src/pages/AdminTickets.tsx).
- API routes: POST `/api/tickets`, GET `/api/tickets/my`, GET `/api/tickets/unread-counts`, GET/POST `/api/tickets/:id/messages`, GET/PATCH `/api/admin/tickets`, GET `/api/admin/tickets/:id`.

### Terms of Use & Newsletter
- Terms of Use page at `/terms` with comprehensive legal sections.
- Registration form includes mandatory "agree to Terms of Use" checkbox (blocks submit if unchecked).
- Optional newsletter subscription checkbox on registration.
- `subscribedToNewsletter` field in users table tracks opt-in.
- EmployerSignup page links to Terms of Use and Disclaimer.

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