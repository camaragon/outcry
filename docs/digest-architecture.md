# Digest Architecture — Intelligence Snapshot

## Core Concept

The weekly digest is NOT an email feature. It's an **intelligence layer** that produces a structured JSON artifact (the "intelligence snapshot"). Email, Slack bot, and in-app dashboard are all consumers of that same artifact.

The moat is the snapshot engine. The email is just the view layer.

## Intelligence Snapshot Schema

```typescript
interface IntelligenceSnapshot {
  // Metadata
  workspaceId: string;
  workspaceName: string;
  generatedAt: string; // ISO timestamp
  periodStart: string; // ISO timestamp
  periodEnd: string;   // ISO timestamp
  boardIds: string[];  // boards included (1 for free, all for Starter+)

  // Core metrics
  summary: {
    totalNewPosts: number;
    totalNewVotes: number;
    totalNewComments: number;
    activeUsers: number;
  };

  // Week-over-week comparison
  delta: {
    postsChange: number;      // +/- vs previous period
    postsChangePercent: number;
    votesChange: number;
    votesChangePercent: number;
    engagementTrend: "up" | "down" | "stable";
  };

  // AI-generated insights (the hard part / the moat)
  insights: {
    // Top trending topics — clustered from post content, not just category counts
    trendingTopics: Array<{
      topic: string;          // AI-generated topic label
      postCount: number;
      totalVotes: number;
      examplePostIds: string[];
      sentiment: "positive" | "neutral" | "frustrated";
      isNew: boolean;         // first time this topic appeared
    }>;

    // Emerging themes — topics gaining traction vs last period
    emergingThemes: Array<{
      topic: string;
      growthPercent: number;
      description: string;    // AI-generated one-liner
    }>;

    // Top posts by engagement
    topPosts: Array<{
      id: string;
      title: string;
      voteCount: number;
      commentCount: number;
      category: string | null;
      status: string;
    }>;

    // AI executive summary — the "analyst memo" (2-3 sentences)
    executiveSummary: string;

    // Actionable recommendation
    recommendation: string;   // "Consider prioritizing X — 3x more mentions than last week"
  };

  // Per-board breakdown (for multi-board Starter/Pro)
  boards: Array<{
    boardId: string;
    boardName: string;
    newPosts: number;
    newVotes: number;
    topTopic: string | null;
  }>;
}
```

## Architecture

```
┌─────────────────────────────────────┐
│         Scheduled Job (cron)        │
│   Runs weekly (configurable day)    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Intelligence Engine            │
│                                     │
│  1. Aggregate period data (SQL)     │
│  2. Compute deltas vs last period   │
│  3. Cluster topics (embeddings)     │
│  4. Detect emerging themes          │
│  5. Generate executive summary (AI) │
│  6. Produce IntelligenceSnapshot    │
│                                     │
│  Stores snapshot in DB for history  │
└──────────────┬──────────────────────┘
               │
        ┌──────┼──────┐
        ▼      ▼      ▼
    ┌──────┐┌──────┐┌──────┐
    │Email ││Slack ││In-app│
    │render││ bot  ││dash  │
    └──────┘└──────┘└──────┘
```

## Intelligence Engine Components

### 1. Data Aggregation (`lib/digest/aggregate.ts`)
- Query posts, votes, comments for the period window
- Group by board, category, status
- Compare against previous period for deltas
- Pure SQL/Prisma — no AI needed here

### 2. Topic Clustering (`lib/digest/cluster-topics.ts`)
- Use existing post embeddings (already stored in pgvector)
- Cluster similar posts using cosine similarity
- Generate topic labels via gpt-4o-mini
- Detect which clusters are new vs recurring
- **Cold start fallback:** Under 20 posts in the period, skip embedding clustering entirely — use auto-categorization labels + category counts instead. Over 20, switch to full clustering pipeline. Digest should gracefully degrade for small boards, not produce noisy AI labels from insufficient data.

### 3. Trend Detection (`lib/digest/trends.ts`)
- Compare current period clusters against previous period
- Identify emerging themes (new clusters or clusters with significant growth)
- Calculate growth percentages

### 4. Executive Summary (`lib/digest/summarize.ts`)
- Feed aggregated data + top clusters to gpt-4o-mini
- Prompt: "Write 2-3 sentences summarizing this week's feedback as if you're a sharp product analyst briefing the PM team"
- Include one actionable recommendation
- **Thin-data fallback:** If total new posts < 5 for the period, skip AI summary entirely and show metrics only. A bad generic summary ("This week saw continued interest in various improvements") is worse than no summary. The digest should only speak when it has something worth saying.

### 5. Snapshot Producer (`lib/digest/produce-snapshot.ts`)
- Orchestrates all components
- Produces the IntelligenceSnapshot JSON
- Stores in a `DigestSnapshot` DB table for history

## Plan Gating

| Feature | Free | Starter | Pro |
|---------|------|---------|-----|
| Digest frequency | Weekly | Weekly | Weekly |
| Boards in digest | 1 (primary) | All | All |
| Trending topics | ✅ | ✅ | ✅ |
| Emerging themes | ✅ | ✅ | ✅ |
| Executive summary | ✅ | ✅ | ✅ |
| Cross-board insights | ❌ | ✅ | ✅ |
| Slack delivery | ❌ | ❌ | ✅ |
| Snapshot history/API | ❌ | ❌ | ✅ |

## Onboarding: The Demo Digest

Critical for conversion. First digest must arrive within minutes of signup, not a week later.

### Flow:
1. Signup → "What kind of product do you build?" (developer tool / ecommerce / SaaS / mobile app / other)
2. Seed board with 10-15 plausible sample posts based on product category
3. Generate embeddings for sample posts
4. Run the intelligence engine immediately against sample data
5. Deliver demo digest via email with subject: "Here's your first Outcry digest — this is what you'll get every week"
6. Demo digest clearly labeled as sample data with CTA: "Connect your real feedback to see insights that matter"

### Sample Data Sets (per product category):
Keep sets small and opinionated — **10 posts max**, not 15. Crisp > comprehensive.
Posts MUST have **varying vote counts and staggered timestamps** so the delta computation produces interesting output. If all 10 posts are created at the same time with zero votes, the digest says "no trends detected" — kills the demo.

- **Developer tool**: API performance, documentation gaps, SDK requests, pricing feedback
- **SaaS platform**: onboarding friction, missing integrations, billing issues, feature requests
- **Ecommerce**: checkout flow, shipping complaints, product search, mobile experience
- **Mobile app**: crashes, UX friction, feature requests, performance

## DB Schema Additions

```prisma
model DigestSnapshot {
  id          String   @id @default(uuid())
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  periodStart DateTime
  periodEnd   DateTime
  snapshot    Json     // The full IntelligenceSnapshot
  status      String   @default("success") // "success" | "failed" | "skipped"
  failReason  String?  // Why it failed/was skipped (for observability)

  // Denormalized for querying without parsing JSON blob
  totalNewPosts    Int?
  engagementTrend  String?  // "up" | "down" | "stable"
  topTopic         String?  // Most mentioned topic label

  createdAt   DateTime @default(now())

  @@index([workspaceId])
  @@index([workspaceId, periodEnd])
  @@index([status]) // Find failed digests quickly
}

// Add to Workspace model:
// digests          DigestSnapshot[]
// productCategory  String? // Set during onboarding ("developer_tool" | "ecommerce" | "saas" | "mobile_app" | "other")
```

## Email Subject Line
The subject line is the digest's digest. It must earn the open every week.

**Dynamic, not static.** Pull a specific data point from the snapshot:
- ✅ `Outcry digest: "Dark mode" trending, 12 new requests this week`
- ✅ `Outcry digest: API performance up 300%, 3 new themes emerging`
- ❌ `Your weekly Outcry digest` (inbox noise, will get ignored by week 3)

**Template:** `Outcry digest: {topTopic} {trendDirection}, {totalNewPosts} new requests this week`

**Demo digest subject:** `Here's your first Outcry digest — this is what you'll get every week`

Build the subject line template into the email renderer from day one so it pulls from the snapshot dynamically.

## Email Design Principles (from external AI review)
- Should feel like a sharp product analyst sent a memo, not a SaaS-generated report
- The "forwarding moment" — would someone forward this to their cofounder?
- Data-dense but scannable
- Tone: confident, specific, actionable
- **Self-contained**: Email must include enough context on its own. If it says "dark mode up 300% vs last week," the user shouldn't need to check last week's digest. Free/Starter users can't access history — the email IS the complete experience.
- This email IS the landing page hero image

## Error Handling & Observability
- DigestSnapshot has `status` field: "success" | "failed" | "skipped"
- `failReason` captures why (API rate limit, empty board, deleted workspace, etc.)
- Engine should process workspaces independently — one failure doesn't block others
- Log + alert if failure rate exceeds threshold (e.g., >10% of digests failed)
- Skipped digests (no new activity in period) are recorded but not emailed

## Implementation Order
1. Data aggregation + delta computation (pure SQL, no AI)
2. Snapshot schema + DB table (with denormalized columns + status field)
3. Topic clustering using existing embeddings (with cold start fallback)
4. Executive summary generation (gpt-4o-mini, with thin-data fallback)
5. Email renderer (React Email / Resend — already in stack, self-contained)
6. Demo digest flow (onboarding) — BEFORE cron job, this is the first e2e proof
7. Cron job to produce + deliver weekly (steady-state path)
8. Slack bot consumer (Pro only)

**Why demo before cron:** Cron only matters once real users have a week of data. Demo digest matters the moment someone signs up. Build the aha-moment path first.
