# Iṣéyá - Job Marketplace Platform

## Overview
Iṣéyá is a job marketplace platform connecting casual workers with employers for short-term or part-time job opportunities. It aims to streamline casual work, offering features like role-based access, job browsing and application for workers, and job posting and management for employers. The platform seeks to foster a dynamic marketplace, enhance user experience, and provide robust administrative controls.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Frameworks & Libraries**: React 18 with TypeScript, Wouter for routing, TanStack React Query for state management, Tailwind CSS with shadcn/ui (New York variant) for styling, Framer Motion for animations, and Vite for building.
- **Architecture**: Page-based with shared components, custom hooks for API abstraction, and role-based UI rendering, including an onboarding flow. Features a consistent header and footer across all public pages, a dynamic landing page, and dedicated role-specific pages (`/for-employers`, `/for-applicants`, `/for-agents`).
- **UI/UX**: Emphasizes consistent styling, accessibility, and dynamic content presentation.

### Backend
- **Framework & Database ORM**: Express.js with TypeScript, Drizzle ORM with PostgreSQL.
- **API**: Organized routes with shared contracts and Zod for validation. Database operations are abstracted through a storage layer.
- **Session Management**: `express-session` with `connect-pg-simple` for PostgreSQL-stored sessions.
- **Authentication**: Replit Auth (OpenID Connect) via Passport.js, supplemented by custom email/password authentication with bcrypt hashing and CAPTCHA protection. Includes Google OAuth integration and a secure password reset flow.
- **Role-Based Access Control**: Granular permissions for users, employers, agents, and administrators. New users undergo an onboarding process. Features include agent job posting capabilities with credit-based or subscription models, and configurable gating for unverified applicants and free-tier employers via admin settings. Sub-admin permissions cover every admin menu item with dedicated keys (e.g. `canManageHiringCompanies`, `canManageGoogleSettings`, `canManageActivityLogs`) so super-admins can grant fine-grained access per area.
- **Admin Features**: Comprehensive admin dashboard for managing users (CRUD, suspension, data export), jobs, applications, subscriptions, transactions, tickets, reports, verifications, notifications, internal ads, and platform settings. Admin can rate applicants and manage external support tickets. Includes an **Activity Logs** system that tracks all user and admin actions (logins, registrations, job CRUD, application status changes, verification reviews, settings updates) with filtering by category, pagination, detail view with metadata, and log clearing.

### Data Storage
- **Database**: PostgreSQL.
- **Key Tables**: `users`, `jobs`, `applications`, `sessions`, `notifications`, `platform_settings`, `tickets`, `internal_ads`, `newsletter_subscribers`, and more for comprehensive platform functionality.

### Subscription System
- Supports `free`, `standard`, `premium`, `enterprise` tiers with dynamic, admin-configurable pricing, job posting limits, and interview credits.
- Integrates Paystack and Flutterwave for payment processing.
- Includes a user transaction history and robust interview credit tracking for premium tiers.
- Features an applicant recommendation system for premium employers, based on a comprehensive scoring model.

### Communication & Notification
- **Email System**: Uses Resend for transactional emails (e.g., welcome, application status, password reset, support tickets), all using branded HTML templates.
- **Notification System**: In-app notifications for various events (application status changes, offers, interview scheduling, ticket updates) with unread counts and management options. Admin can send notifications to specific users or roles.

### Core Features
- **Counter-Offer System**: Allows applicants to submit counter-offers to job offers, with a defined workflow for employer response and status updates.
- **Facebook Auto-Posting**: Premium/Enterprise employer job posts are automatically shared to the Iṣéyá Facebook Page via the Graph API, running asynchronously.
- **Location System**: Jobs and user profiles utilize a 3-level Nigerian location system (State, City/Town, Address/Area).
- **Profile Management**: Centralized `/profile` page for all users to manage personal details. Applicants can manage CVs, job history, and preferences; employers manage company details.
- **Applicant Verification System**: Allows applicants to submit government ID for verification, providing a verified badge and priority. Admin review and approval system.
- **Support Ticket System**: Users can submit and track support tickets with a conversation thread for user-admin communication. External support tickets from the contact form are also integrated.
- **Legal & Policy Pages**: Comprehensive legal pages including Terms of Use, Cookie Policy, Privacy Policy (NDPR compliant), Disclaimer, and Copyright.
- **Internal Ads & Popups**: Admin-managed system for creating and scheduling promotional banners and popups with targeting, custom styling, and scheduling options.
- **Security**: Image-based CAPTCHA on login forms for bot protection.

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
- **Resend**: Transactional email delivery.

### Social Media
- **Facebook Graph API**: For automated job posting.