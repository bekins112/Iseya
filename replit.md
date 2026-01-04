# CasualWorker - Job Marketplace Platform

## Overview

CasualWorker is a job marketplace platform connecting casual workers (applicants) with employers posting short-term or part-time job opportunities. The application features role-based access where applicants can browse and apply for jobs while employers can post and manage job listings. Built with a modern React frontend and Express backend, using PostgreSQL for data persistence and Replit Auth for authentication.

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