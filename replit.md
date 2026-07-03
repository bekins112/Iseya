# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (v3 compat via `"zod"` import), `drizzle-zod`
- **Build**: esbuild (ESM bundle)

## Artifacts

### `artifacts/iseya` — Iṣéyá Job Marketplace (React + Vite)
- Preview path: `/`
- Port: 20023
- Frontend of the Iṣéyá job marketplace
- Tailwind CSS v3, wouter v3 (with `WouterRouter base` for path routing)
- Local type definitions in `src/lib/types.ts` (replaces `@shared/schema`)
- Local Zod schemas in `src/lib/schemas.ts` (replaces `@shared/schema` insert schemas)
- Local API route helpers in `src/lib/api-routes.ts` (replaces `@shared/routes`)
- Custom queryClient in `src/lib/queryClient.ts`

### `artifacts/api-server` — API Server (Express 5 + Node.js)
- Preview path: `/api`
- Port: 8080
- Backend for the Iṣéyá job marketplace
- Auth: passport-local + passport-google-oauth20, sessions via connect-pg-simple
- File uploads: multer, stored in `uploads/` and DB via file-storage module
- Email: Mailjet via node-mailjet + Resend
- Captcha: svg-captcha (requires `fonts/Comismsh.ttf`)
- Internal shared code in `src/shared/` (routes.ts, models/auth.ts)

### Admin Roles & Permissions
- New `admin_roles` table in `lib/db/src/schema/schema.ts` mirroring all `canManage*` flags from `admin_permissions`. `admin_permissions.roleId` is a nullable FK to `admin_roles` (onDelete: set null).
- `storage.getAdminPermissions()` merges role flags into the user's permissions row (effective = role flag OR per-user flag), so existing sub-admins without a role keep working unchanged.
- New API endpoints (all gated by `canManageAdmins`): `GET/POST /api/admin/roles`, `PATCH/DELETE /api/admin/roles/:id`, `PATCH /api/admin/admins/:userId/role`. Sub-admin create endpoints (`/api/admin/admins`, `/api/admin/admins/create-new`) and `PATCH /api/admin/admins/:userId/permissions` accept an optional `roleId`.
- Admin UI page `AdminRoles.tsx` at `/admin/roles` (Sidebar link gated by `canManageAdmins`). Lists all roles with assigned-admin counts; create/edit/delete with permission switch grid. System roles (`isSystem=true`) cannot be deleted.
- `AdminSubAdmins.tsx` now shows a Role dropdown in the Add and Edit dialogs and displays a role badge next to each admin in the list. Role assignments persist via the standard create/permissions endpoints.

### Chatbot widget (Iṣéyá)
- Floating chat bubble (`artifacts/iseya/src/components/ChatWidget.tsx`) mounted in `App.tsx` (hidden on `/admin/*`, `/onboarding`, `/verify-email`).
- Visitor session id stored in `localStorage` key `iseya_chat_session_id`.
- Polls `/api/chat/:sessionId/messages?since=` every 4s.
- Bot powered by Anthropic via Replit AI Integrations (`AI_INTEGRATIONS_ANTHROPIC_*` env vars; auto-provisioned by `setupReplitAIIntegrations`). Model: `claude-sonnet-4-6`. SDK: `@anthropic-ai/sdk` (api-server dep).
- "Talk to a human" flips `chat_conversations.mode` to `human` and queues for admin (`unreadForAdmin++`).
- Admin page `AdminChats.tsx` at `/admin/chats` (sidebar link gated by `canManageChats` perm). Polls `/api/admin/chat/conversations` every 5s. Take over / Return to bot / Close.
- DB tables: `chat_conversations`, `chat_messages` in `lib/db/src/schema/schema.ts`. Permission column `canManageChats` added to `admin_permissions`.
- All chat routes registered in `artifacts/api-server/src/routes/chat.ts` (mounted via `registerChatRoutes(app)` at end of `registerRoutes`).

### `lib/db` — Database Package
- Drizzle ORM schema in `src/schema/` (table definitions only, no drizzle-zod)
- Zod schemas in `src/zod-schemas.ts` (separate from schema files to avoid drizzle-kit conflicts)
- Re-exports everything from `src/index.ts`

### Job-Aid Requests (Iṣéyá)
- Applicants with an ACTIVE Job-Aid plan can request each benefit included in their plan (per-benefit REQUEST flow); admins fulfill manually.
- New `canManageJobAid` permission added to `admin_roles` + `admin_permissions` (schema.ts, zod-schemas.ts, storage `PERMISSION_KEYS`, sub-admin create blocks, my-permissions fallback).
- New `jobAidRequests` table (userId, plan, benefitKey, status `pending`/`in_progress`/`completed`/`rejected`, note, adminNote, processedBy). No `createInsertSchema` for it (avoids duplicate-export ambiguity via `export *`).
- API (routes.ts): applicant `GET/POST /api/jobaid/requests` (gates: active plan, benefit-included, duplicate-open block, quota via `periodStart = jobAidEndDate − 30d`); admin `GET /api/admin/jobaid/requests` + `PATCH /api/admin/jobaid/requests/:id` (both gated by `canManageJobAid`). Notifies admins (type `role`/`admin`) on submit; notifies applicant (type `individual`) ONLY when status actually changes.
- Benefit keys/labels + quota set (`recommendations`/`referrals`/`interview_booking` are quota'd; `cv_refining`/`verification`/`priority_support` are toggles) live in routes.ts. `JOBAID_BENEFIT_KEYS`/`JOBAID_QUOTA_BENEFIT_KEYS` are const-declared later in `registerRoutes` but only read inside handler closures (no TDZ at runtime).
- Frontend: `components/JobAidFeatures.tsx` (LOCKED upgrade card → `/job-aid` when no active plan; per-benefit request cards + status/quota when active). Admin page `pages/AdminJobAid.tsx` at `/admin/jobaid` (Sidebar link gated by `canManageJobAid`; list/detail/status-update). `canManageJobAid` wired into AdminSubAdmins + AdminRoles permission grids and `lib/types.ts`.
- Applicant Job-Aid is a dedicated MENU page `pages/JobAidCenter.tsx` at `/my-job-aid` (auth-gated, applicant-only via `<Redirect to="/dashboard">`; Sidebar desktop link + mobile overflow link, icon `Sparkles`). Note the PUBLIC plans/subscribe page stays at `/job-aid` — the applicant hub uses a DIFFERENT path `/my-job-aid`. The page reuses `<JobAidFeatures />` for the request/locked UI and adds, when active: derived stat cards (Requests Made / In Progress / Achieved / Not Approved), per-limited-benefit quota Progress bars, and an Activity History timeline. All stats/activity are derived CLIENT-SIDE from `/api/jobaid/requests` + `/api/jobaid/status` + `/api/jobaid/plans` (no backend/DB change). Usage counts mirror `JobAidFeatures` (all-time non-rejected requests per benefit), which can diverge from the backend's period-based quota window after renewals — known pre-existing pattern. `<JobAidFeatures />` was REMOVED from `Dashboard.tsx` (no longer embedded).

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Auth & Required Secrets

End-to-end auth flows (register, captcha-gated login, password reset, email
verification, Google OAuth, admin login, authenticated/admin pages) are wired
and verified against the live API.

Required secrets (already configured in this workspace):

- `SESSION_SECRET` — express-session signing key
- `RESEND_API_KEY`, `RESEND_SENDER_EMAIL` — transactional email via Resend
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — passport-google-oauth20
- `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY` — payments
- `INBOUND_EMAIL_SECRET` — inbound email webhook
- `DATABASE_URL` — Postgres (also used by `connect-pg-simple` session store)

If `RESEND_API_KEY` is missing, registration/forgot-password still succeed but
the verification/reset code is logged to the API server console as a fallback
(see `artifacts/api-server/src/auth.ts`).

To re-verify the end-to-end auth flow at any time:

```
pnpm --filter @workspace/scripts run verify-auth-e2e
```

The script in `scripts/src/verify-auth-e2e.ts` exercises the captcha endpoint,
register, session-based `/api/auth/user`, captcha-gated login, applicant
endpoints (`/api/jobs`, `/api/my-applications`, `/api/notifications`),
forgot-password, the Google OAuth redirect, and admin login + admin endpoints
(`/api/admin/users`, `/api/admin/jobs`, `/api/admin/applications`).

## Important Notes

- `drizzle-zod` v0.7 with zod 3.25 (which includes v4 core): `.omit()` fails for columns already excluded by drizzle-zod (generated identity, defaultNow). Use `createInsertSchema(table)` without `.omit()`.
- The DB schema files (`lib/db/src/schema/`) must NOT import drizzle-zod or call `createInsertSchema` — drizzle-kit processes these files and fails. Zod schemas live in `lib/db/src/zod-schemas.ts` instead.
- `zod` is marked external in api-server's esbuild config and installed as a runtime dependency.
- Express 5 wildcard routes use `/path/*name` syntax (not `/path/*`).
- `SiLinkedin` was removed from react-icons v5 (SimpleIcons dropped LinkedIn brand). Replaced with `Linkedin` from lucide-react.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
