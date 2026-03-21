# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Outcry is an AI-native feedback and roadmap SaaS ("boards that think") built as a single Next.js 16 monorepo (marketing + application). It targets SaaS teams with flat $49/mo Pro pricing. See `MVP_SPEC.md` for full product spec.

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npm run db:push      # Push Prisma schema to database (uses .env.local)
npm run db:studio    # Open Prisma Studio (uses .env.local)
```

No test framework is installed yet. CI runs `lint` then `build` (which includes type checking).

## Architecture

### Route Groups (app/)

- `(marketing)` — Public pages: landing, pricing. Has its own layout with header/footer.
- `(platform)` — Protected app routes: dashboard, onboarding, auth. Wrapped in Clerk provider.
- `(public)` — Public board views at `/b/[workspaceSlug]/[boardSlug]`. No auth required.
- `api/` — Minimal route handlers: similar-posts search, Stripe checkout, Stripe webhooks.

### Server Actions Pattern

All mutations use server actions in `actions/{action-name}/index.ts` with colocated `schema.ts` and `types.ts`. Actions are wrapped with `createSafeAction()` from `lib/create-safe-action.ts` which handles Zod validation and error formatting. Client-side, the `useAction` hook (`hooks/use-action.ts`) provides loading/error/data state.

### Multi-Tenancy

Workspaces are the tenant boundary. All database queries must be scoped to the user's workspace. Auth is enforced via `lib/get-authorized-user.ts` which validates Clerk session + workspace membership with request-level caching.

### Key Libraries & Integrations

| Concern | Stack |
|---------|-------|
| Auth | Clerk (organizations for workspaces, roles: USER/ADMIN/OWNER) |
| Database | Prisma on Neon PostgreSQL + pgvector for embeddings |
| AI | OpenAI (gpt-4o-mini for categorization, text-embedding-3-small for similarity) |
| Payments | Stripe (checkout sessions, subscription webhooks) |
| Email | Resend + React Email templates in `emails/` |
| UI | shadcn/ui (New York style) + Tailwind CSS v4 + Radix primitives |
| Client state | Zustand (minimal) + React Query for server state |

### Background Work

Long-running tasks (embeddings, AI categorization, email notifications) run via Next.js `after()` to execute after the response is sent, avoiding serverless timeouts.

### Digest Intelligence Engine (lib/digest/)

Orchestrated by `produce-snapshot.ts`: aggregates period data → clusters topics → detects emerging themes → generates AI summary → stores as `DigestSnapshot`. Uses pgvector cosine similarity for post deduplication.

### Middleware

`proxy.ts` (exported as Next.js middleware) handles Clerk auth protection. Public routes: `/`, `/pricing`, `/blog/*`, `/sign-in/*`, `/sign-up/*`, `/b/*`, `/api/webhooks/stripe`.

## Environment Variables

Required in `.env.local`: `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`.

## Database

Schema is in `prisma/schema.prisma`. Core models: Workspace → Board → Post (with vector embedding) → Vote/Comment. Uses pgvector extension for 1536-dimension embeddings. Post has a denormalized `voteCount` field for efficient sorting.
