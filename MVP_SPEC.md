# Outcry — MVP Spec v2.1
**Last updated:** Feb 3, 2026
**Status:** Approved — ready to build

---

## Overview
Outcry is an AI-native feedback and roadmap tool. The MVP targets SaaS product teams frustrated with Canny's pricing ($99–$1,349/mo) who want a modern, affordable alternative.

**Positioning:** "Boards that think" — feedback boards with AI built in.
**Price:** $49/mo flat (no per-user, no tracked-user traps).
**Domain:** outcry.app

---

## Competitive Landscape

| Tool | Starting Price | Pain Points |
|------|---------------|-------------|
| Canny | $99/mo | Tracked-user pricing, forced migrations |
| Featurebase | $29/seat/mo | Per-seat adds up fast |
| Frill | ~$25/mo | Limited AI, dated |
| Nolt | $29/mo | Basic, no AI |
| UserVoice | Enterprise only | Way too expensive for startups |

**Our edge:** Flat $49/mo, unlimited users/seats, AI included.

---

## Decisions (Locked In)

| Decision | Answer |
|----------|--------|
| Auth | Clerk for everything (admin + end users) — revisit costs if traction |
| Database | Neon (serverless Postgres + pgvector) |
| Free tier | 50 posts, don't overthink |
| Widget | Deferred to v1.5 — public board URL is enough |
| Repo structure | Single Next.js 16 monorepo (marketing + app) |
| Framework | Next.js 16 (App Router, Turbopack) |
| Comments | Flat (no threading in v1) |

---

## MVP Features

### 🔴 Must-Have (v1)

#### 1. Public Feedback Board
- Submit feedback posts (title + description)
- Upvote posts (no downvotes — better for community health)
- Flat comments on posts (no threading)
- Sort by: most votes, newest, trending
- Filter by: status, category

#### 2. Admin Dashboard
- View all feedback in a management view
- Change post status: Open → Under Review → Planned → In Progress → Complete → Closed
- Assign categories/tags to posts
- Respond to posts as admin (with admin badge)
- Mark posts as duplicate (link to canonical post — no vote/comment migration in v1)
- Delete/archive posts
- Basic analytics: total posts, votes, top requested

#### 3. Public Roadmap
- Kanban-style view showing planned, in progress, and shipped
- Automatically populated from feedback post statuses
- Publicly shareable link
- Toggle items public/private

#### 4. Authentication
- Clerk for both admin and end-user auth
- Google OAuth for end users
- Admin roles via Clerk organizations

#### 5. Workspace / Organization
- Create a workspace (company)
- Custom subdomain: `company.outcry.app`
- Basic branding: logo, accent color
- Invite team members (admin roles)

#### 6. AI Duplicate Detection
- When submitting feedback, check for similar existing posts
- Show "Did you mean...?" suggestions before creating
- Uses embeddings (OpenAI text-embedding-3-small) + pgvector
- Saves admins hours of manual merging

#### 7. Stripe Billing
- Free tier: 1 board, 50 posts, no AI, "Powered by Outcry" badge
- Pro tier: $49/mo, unlimited everything, AI features, custom branding
- Stripe Checkout + subscription management

#### 8. Landing Page + SEO
- Marketing site at outcry.app
- `/pricing` page
- `/blog/canny-alternatives` — key SEO page from day one

#### 9. Email Notifications
- Notify users when their feedback changes status
- Notify admins of new feedback

### 🟡 Should-Have (Week 4+)

#### 10. AI Auto-Categorization
- Suggest category/tag when feedback is submitted
- Based on existing categories + content
- Admin can accept or override

#### 11. Changelog / Announcements
- Posts announcing what shipped
- Auto-notify users who voted on related feedback
- Public changelog at `company.outcry.app/changelog`

### 🔵 Deferred (v1.5+)

- Embeddable widget (JS snippet, shadow DOM, iframe)
- Threaded comments
- Anonymous posting
- Full-text search
- Custom domains (CNAME)
- SSO/SAML
- Slack/Linear/Jira integrations
- API access for customers
- Advanced analytics & reporting
- Surveys & NPS
- Multi-language
- Whitelabeling
- Priority scoring (RICE, ICE)

---

## Data Model (Prisma)

```prisma
model Workspace {
  id                    String @id @default(uuid())
  name                  String
  slug                  String @unique // subdomain
  logo                  String?
  accentColor           String?
  plan                  Plan @default(FREE)
  stripeCustomerId      String? @unique
  stripeSubscriptionId  String? @unique
  stripePriceId         String?
  stripeCurrentPeriodEnd DateTime?

  boards    Board[]
  users     User[]
  categories Category[]
  changelogs Changelog[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Plan {
  FREE
  PRO
}

model User {
  id          String @id @default(uuid())
  clerkId     String @unique
  email       String
  name        String?
  avatarUrl   String?
  role        Role @default(USER)

  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  posts     Post[]
  votes     Vote[]
  comments  Comment[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([workspaceId])
  @@index([clerkId])
}

enum Role {
  USER
  ADMIN
  OWNER
}

model Board {
  id        String @id @default(uuid())
  name      String
  slug      String
  isPublic  Boolean @default(true)

  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  posts Post[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([workspaceId, slug])
  @@index([workspaceId])
}

model Post {
  id          String @id @default(uuid())
  title       String
  body        String @db.Text
  status      PostStatus @default(OPEN)
  voteCount   Int @default(0) // denormalized for sorting
  embedding   Unsupported("vector(1536)")? // pgvector for AI similarity

  boardId   String
  board     Board @relation(fields: [boardId], references: [id], onDelete: Cascade)

  authorId  String
  author    User @relation(fields: [authorId], references: [id])

  categoryId String?
  category   Category? @relation(fields: [categoryId], references: [id])

  votes     Vote[]
  comments  Comment[]
  mergedInto  String? // ID of post this was merged into (v1: just mark + link, no vote/comment migration)
  changelogEntries ChangelogPost[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([boardId])
  @@index([authorId])
  @@index([status])
}

enum PostStatus {
  OPEN
  UNDER_REVIEW
  PLANNED
  IN_PROGRESS
  COMPLETE
  CLOSED
}

model Vote {
  id      String @id @default(uuid())
  // No value field — presence = upvote, absence = no vote (no downvotes)

  postId  String
  post    Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  userId  String
  user    User @relation(fields: [userId], references: [id])

  createdAt DateTime @default(now())

  @@unique([postId, userId])
  @@index([postId])
  @@index([userId])
}

model Comment {
  id      String @id @default(uuid())
  body    String @db.Text
  isAdmin Boolean @default(false)

  postId    String
  post      Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  authorId  String
  author    User @relation(fields: [authorId], references: [id])

  createdAt DateTime @default(now())

  @@index([postId])
}

model Category {
  id    String @id @default(uuid())
  name  String
  color String

  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  posts Post[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([workspaceId, name])
  @@index([workspaceId])
}

model Changelog {
  id          String @id @default(uuid())
  title       String
  body        String @db.Text
  publishedAt DateTime?

  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  posts ChangelogPost[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([workspaceId])
}

model ChangelogPost {
  id          String @id @default(uuid())

  changelogId String
  changelog   Changelog @relation(fields: [changelogId], references: [id], onDelete: Cascade)

  postId      String
  post        Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([changelogId, postId])
}
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack), TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Clerk (admin + end users, organizations) |
| Database | Neon (serverless PostgreSQL + pgvector) |
| ORM | Prisma |
| Payments | Stripe (Checkout + webhooks) |
| AI | OpenAI API (text-embedding-3-small for similarity) |
| Hosting | Vercel |
| DNS/CDN | Cloudflare |
| Email | Resend |

---

## Architecture

### Multi-Tenancy via Subdomain
- Each workspace gets `{slug}.outcry.app`
- Next.js middleware resolves workspace from subdomain
- All queries scoped to workspace
- Admin panel at `app.outcry.app`

### Auth
- Clerk handles everything — admin and end users
- Clerk organizations map to workspaces
- Google OAuth for end-user convenience
- Optimize Clerk costs later when revenue justifies it

### AI Duplicate Detection Flow
1. User types feedback title
2. On submit, generate embedding via OpenAI
3. Query pgvector for top 3 similar posts (cosine similarity > 0.85)
4. If matches found, show "Did you mean...?" before creating
5. Store embedding on new post for future comparisons

---

## Routes

### Marketing (outcry.app)
- `/` — Landing page
- `/pricing` — Pricing
- `/blog` — SEO content
- `/blog/canny-alternatives` — Key SEO page

### App (app.outcry.app)
- `/sign-in`, `/sign-up` — Auth
- `/dashboard` — Overview
- `/dashboard/feedback` — Manage posts
- `/dashboard/roadmap` — Manage roadmap
- `/dashboard/changelog` — Manage changelog
- `/dashboard/settings` — Workspace, billing, team

### Public Board ({slug}.outcry.app)
- `/` — Feedback board
- `/roadmap` — Public roadmap
- `/changelog` — Public changelog
- `/p/{postId}` — Individual post

---

## Revenue Model

| Plan | Price | Includes |
|------|-------|---------|
| Free | $0/mo | 1 board, 50 posts, no AI, "Powered by Outcry" badge |
| Pro | $49/mo | Unlimited boards/posts/users, AI features, custom branding, no badge |

**Why flat pricing wins:** Canny punishes growth with tracked-user pricing. Featurebase charges per-seat. We charge $49 flat — predictable, no surprises, easy to sell.

**Free tier strategy:** Just enough to see value. 50-post limit creates natural upgrade pressure. Badge = free marketing.

---

## Sprint Plan

### Week 1: Foundation
- [x] Initialize Next.js 16 monorepo (TypeScript, Tailwind, shadcn/ui)
- [x] Prisma + Neon setup (schema push, pgvector extension)
- [x] Clerk auth (sign-in/up, organizations)
- [x] Multi-tenant subdomain middleware
- [x] CRUD: Workspaces, Boards, Posts, Votes, Comments (flat)
- [x] Admin dashboard: feedback list with status management + filters

### Week 2: Public UI + AI
- [x] Public board UI (post list, voting, commenting)
- [x] Public roadmap view (kanban by status)
- [x] AI duplicate detection (OpenAI embeddings + pgvector)
- [x] Stripe integration (Checkout, webhooks, billing page)
- [x] Landing page (outcry.app)
- [ ] Basic post merging — see [#30](https://github.com/camaragon/outcry/issues/30)

### Week 3: Polish + Soft Launch
- [x] Email notifications via Resend (status changes, new feedback)
- [~] SEO content (Canny alternatives blog post) — in progress: blog post written, pending final review and publish
- [ ] Beta testing with real users
- [ ] Reddit distribution (drop into Canny complaint threads)

### Week 4+: Iterate
- [ ] AI auto-categorization
- [ ] Changelog feature
- [ ] Product Hunt launch (after real user feedback)

---

*Ship fast, split later. Revenue validates everything else.*
