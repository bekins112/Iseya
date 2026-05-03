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
- Frontend of the Iṣéyá job marketplace, ported from `.migration-backup/client/`
- Tailwind CSS v3, wouter v3 (with `WouterRouter base` for path routing)
- Local type definitions in `src/lib/types.ts` (replaces `@shared/schema`)
- Local Zod schemas in `src/lib/schemas.ts` (replaces `@shared/schema` insert schemas)
- Local API route helpers in `src/lib/api-routes.ts` (replaces `@shared/routes`)
- Custom queryClient in `src/lib/queryClient.ts`

### `artifacts/api-server` — API Server (Express 5 + Node.js)
- Preview path: `/api`
- Port: 8080
- Backend ported from `.migration-backup/server/`
- Auth: passport-local + passport-google-oauth20, sessions via connect-pg-simple
- File uploads: multer, stored in `uploads/` and DB via file-storage module
- Email: Mailjet via node-mailjet + Resend
- Captcha: svg-captcha (requires `fonts/Comismsh.ttf`)
- Internal shared code in `src/shared/` (routes.ts, models/auth.ts)

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

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Important Notes

- `drizzle-zod` v0.7 with zod 3.25 (which includes v4 core): `.omit()` fails for columns already excluded by drizzle-zod (generated identity, defaultNow). Use `createInsertSchema(table)` without `.omit()`.
- The DB schema files (`lib/db/src/schema/`) must NOT import drizzle-zod or call `createInsertSchema` — drizzle-kit processes these files and fails. Zod schemas live in `lib/db/src/zod-schemas.ts` instead.
- `zod` is marked external in api-server's esbuild config and installed as a runtime dependency.
- Express 5 wildcard routes use `/path/*name` syntax (not `/path/*`).
- `SiLinkedin` was removed from react-icons v5 (SimpleIcons dropped LinkedIn brand). Replaced with `Linkedin` from lucide-react.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
