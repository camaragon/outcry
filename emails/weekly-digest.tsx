import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Hr,
} from "@react-email/components";
import type { IntelligenceSnapshot, TrendingTopic, TopPost } from "../lib/digest/types";
import { main, container, footer as footerStyle } from "./styles";

interface WeeklyDigestEmailProps {
  snapshot: IntelligenceSnapshot;
  boardUrl: string;
  settingsUrl?: string;
  isDemo?: boolean;
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", opts)}, ${e.getFullYear()}`;
}

function formatTrend(percent: number): string {
  if (percent > 0) return `+${percent}%`;
  if (percent < 0) return `${percent}%`;
  return "—";
}

function trendColor(percent: number): string {
  if (percent > 0) return "#16a34a";
  if (percent < 0) return "#dc2626";
  return "#6b7280";
}

function sentimentLabel(sentiment: TrendingTopic["sentiment"]): string {
  switch (sentiment) {
    case "frustrated":
      return "Frustrated";
    case "positive":
      return "Positive";
    default:
      return "Neutral";
  }
}

function sentimentPillBg(sentiment: TrendingTopic["sentiment"]): string {
  switch (sentiment) {
    case "frustrated":
      return "#fef2f2";
    case "positive":
      return "#f0fdf4";
    default:
      return "#f0f4ff";
  }
}

function sentimentPillColor(sentiment: TrendingTopic["sentiment"]): string {
  switch (sentiment) {
    case "frustrated":
      return "#dc2626";
    case "positive":
      return "#16a34a";
    default:
      return "#3b82f6";
  }
}

function statusLabel(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function statusPillBg(status: string): string {
  switch (status) {
    case "PLANNED":
      return "#eff6ff";
    case "IN_PROGRESS":
      return "#fffbeb";
    case "COMPLETE":
      return "#f0fdf4";
    case "UNDER_REVIEW":
      return "#fef9c3";
    case "CLOSED":
      return "#f3f4f6";
    default:
      return "#f3f4f6";
  }
}

function statusPillColor(status: string): string {
  switch (status) {
    case "PLANNED":
      return "#2563eb";
    case "IN_PROGRESS":
      return "#d97706";
    case "COMPLETE":
      return "#16a34a";
    case "UNDER_REVIEW":
      return "#ca8a04";
    case "CLOSED":
      return "#6b7280";
    default:
      return "#6b7280";
  }
}

/**
 * Build a one-line context description for a topic from available data.
 * This is the "analyst insight" line that makes the email feel intelligent.
 */
function buildTopicContext(topic: TrendingTopic): string {
  const parts: string[] = [];

  if (topic.isNew) {
    parts.push("New this period");
  }

  // Sentiment-driven context
  if (topic.sentiment === "frustrated" && topic.postCount >= 5) {
    parts.push("users are vocal about this");
  } else if (topic.sentiment === "positive") {
    parts.push("positive reception");
  }

  if (topic.totalVotes > topic.postCount * 3) {
    parts.push("high engagement per post");
  }

  if (parts.length === 0) {
    parts.push(`${topic.postCount} mentions this period`);
  }

  return parts.join(". ") + ".";
}

/**
 * Build the dynamic email subject line from the snapshot.
 * Always includes one specific topic and one metric. Never generic.
 */
export function buildDigestSubject(snapshot: IntelligenceSnapshot): string {
  const topTopic =
    snapshot.insights.trendingTopics.length > 0
      ? snapshot.insights.trendingTopics[0].topic
      : null;

  const postsPercent = snapshot.delta.postsChangePercent;

  if (topTopic && postsPercent !== 0) {
    const direction = postsPercent > 0 ? "up" : "down";
    return `Outcry: "${topTopic}" trending, feedback ${direction} ${Math.abs(postsPercent)}% this week`;
  }

  if (topTopic) {
    return `Outcry: "${topTopic}" trending this week — ${snapshot.summary.totalNewPosts} new posts`;
  }

  return `Outcry digest: ${snapshot.summary.totalNewPosts} new posts this week`;
}

export default function WeeklyDigestEmail({
  snapshot,
  boardUrl,
  settingsUrl,
  isDemo = false,
}: WeeklyDigestEmailProps) {
  const dateRange = formatDateRange(snapshot.periodStart, snapshot.periodEnd);
  const { summary, delta, insights } = snapshot;
  const hasTopics = insights.trendingTopics.length > 0;
  const hasEmergingThemes = insights.emergingThemes.length > 0;
  const hasTopPosts = insights.topPosts.length > 0;

  // Build a growth map from emerging themes for per-topic growth badges
  const growthByTopic = new Map<string, number>();
  for (const theme of insights.emergingThemes) {
    if (theme.growthPercent > 0) {
      growthByTopic.set(theme.topic, theme.growthPercent);
    }
  }

  return (
    <Html>
      <Head />
      <Preview>
        {insights.executiveSummary
          ? insights.executiveSummary.slice(0, 150)
          : `${summary.totalNewPosts} new posts this week on ${snapshot.workspaceName}`}
      </Preview>
      <Body style={main}>
        <Container style={emailContainer}>
          {/* Header: badge + subtitle + date range */}
          <Section>
            <Row>
              <Column>
                <Text style={brandBadge}>OUTCRY</Text>
                <Text style={brandSubtitle}>Weekly Digest</Text>
              </Column>
              <Column align="right">
                <Text style={dateText}>{dateRange}</Text>
              </Column>
            </Row>
          </Section>

          {/* Executive summary — the hook, no section header */}
          {insights.executiveSummary && (
            <Text style={executiveSummaryStyle}>
              {insights.executiveSummary}
            </Text>
          )}

          {/* Recommendation callout */}
          {insights.recommendation && (
            <Section style={recommendationBox}>
              <Text style={recommendationText}>
                {insights.recommendation}
              </Text>
            </Section>
          )}

          {/* Metrics bar */}
          <Section style={metricsBar}>
            <Row>
              <Column style={metricCell} align="center">
                <Text style={metricValue}>{summary.totalNewPosts}</Text>
                <Text style={metricLabel}>New Posts</Text>
                <Text
                  style={{
                    ...metricTrend,
                    color: trendColor(delta.postsChangePercent),
                  }}
                >
                  {formatTrend(delta.postsChangePercent)}
                </Text>
              </Column>
              <Column style={metricDivider} />
              <Column style={metricCell} align="center">
                <Text style={metricValue}>{summary.totalNewVotes}</Text>
                <Text style={metricLabel}>Votes</Text>
                <Text
                  style={{
                    ...metricTrend,
                    color: trendColor(delta.votesChangePercent),
                  }}
                >
                  {formatTrend(delta.votesChangePercent)}
                </Text>
              </Column>
              <Column style={metricDivider} />
              <Column style={metricCell} align="center">
                <Text style={metricValue}>{summary.totalNewComments}</Text>
                <Text style={metricLabel}>Comments</Text>
              </Column>
              <Column style={metricDivider} />
              <Column style={metricCell} align="center">
                <Text style={metricValue}>{summary.activeUsers}</Text>
                <Text style={metricLabel}>Active Users</Text>
              </Column>
            </Row>
          </Section>

          {/* Trending topics */}
          {hasTopics && (
            <Section>
              <Text style={sectionTitle}>TRENDING TOPICS</Text>
              {insights.trendingTopics.slice(0, 5).map((topic, i) => (
                <TopicCard
                  key={i}
                  topic={topic}
                  growthPercent={growthByTopic.get(topic.topic)}
                />
              ))}
            </Section>
          )}

          {/* Emerging this week — only if data supports it */}
          {hasEmergingThemes && (
            <Section>
              <Text style={sectionTitle}>EMERGING THIS WEEK</Text>
              {insights.emergingThemes.map((theme, i) => (
                <Section key={i} style={emergingCard}>
                  <Text style={emergingText}>
                    <strong>{theme.topic}</strong> — {theme.description}
                  </Text>
                </Section>
              ))}
            </Section>
          )}

          {/* Top posts */}
          {hasTopPosts && (
            <Section>
              <Text style={sectionTitle}>TOP POSTS THIS WEEK</Text>
              {insights.topPosts.slice(0, 3).map((post, i) => (
                <PostCard key={i} post={post} />
              ))}
            </Section>
          )}

          <Hr style={divider} />

          {/* Footer CTA */}
          {isDemo ? (
            <Section style={demoCta}>
              <Text style={demoCtaText}>
                This digest was built from sample data. Your real digest starts
                next week.
              </Text>
              <Link href={boardUrl} style={ctaButton}>
                Start Collecting Feedback
              </Link>
            </Section>
          ) : (
            <Section>
              <Link href={boardUrl} style={ctaButton}>
                View Your Board
              </Link>
              {settingsUrl && (
                <Text style={footerStyle}>
                  <Link href={settingsUrl} style={settingsLink}>
                    Manage digest settings
                  </Link>
                </Text>
              )}
            </Section>
          )}

          <Text style={footerStyle}>
            {snapshot.workspaceName} · Powered by{" "}
            <Link href="https://outcry.app" style={settingsLink}>
              Outcry
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Topic Card ─────────────────────────────────────────────────────────────

function TopicCard({
  topic,
  growthPercent,
}: {
  topic: TrendingTopic;
  growthPercent?: number;
}) {
  const context = buildTopicContext(topic);

  return (
    <Section style={topicCard}>
      {/* Row 1: Topic name + badges */}
      <Row>
        <Column>
          <Text style={topicName}>
            {topic.topic}
            {topic.isNew && <span style={newBadge}> NEW</span>}
          </Text>
        </Column>
        <Column align="right">
          <Row>
            {/* Growth badge */}
            {growthPercent && growthPercent > 0 && (
              <Column align="right">
                <Text style={growthBadge}>+{growthPercent}%</Text>
              </Column>
            )}
            {/* Sentiment pill */}
            <Column align="right">
              <Text
                style={{
                  ...sentimentPill,
                  backgroundColor: sentimentPillBg(topic.sentiment),
                  color: sentimentPillColor(topic.sentiment),
                }}
              >
                {sentimentLabel(topic.sentiment)}
              </Text>
            </Column>
          </Row>
        </Column>
      </Row>
      {/* Row 2: Stats */}
      <Text style={topicStats}>
        {topic.postCount} mentions · {topic.totalVotes} votes
      </Text>
      {/* Row 3: Context description — the analyst insight */}
      <Text style={topicContext}>{context}</Text>
    </Section>
  );
}

// ─── Post Card ──────────────────────────────────────────────────────────────

function PostCard({ post }: { post: TopPost }) {
  return (
    <Section style={postCard}>
      <Row>
        <Column style={voteColumn} align="center">
          <Text style={voteCount}>{post.voteCount}</Text>
          <Text style={voteLabel}>votes</Text>
        </Column>
        <Column style={postContent}>
          <Text style={postTitleStyle}>{post.title}</Text>
        </Column>
        <Column align="right" style={{ width: "110px" }}>
          <Text
            style={{
              ...statusPill,
              backgroundColor: statusPillBg(post.status),
              color: statusPillColor(post.status),
            }}
          >
            {statusLabel(post.status)}
          </Text>
        </Column>
      </Row>
    </Section>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
// All inline for email client compatibility. Graceful degradation:
// if pills render as plain text in Outlook, they're still readable.

const emailContainer = {
  ...container,
  padding: "32px 24px",
};

const brandBadge = {
  fontSize: "13px",
  fontWeight: "700" as const,
  color: "#2EC4A5",
  letterSpacing: "2px",
  margin: "0",
};

const brandSubtitle = {
  fontSize: "13px",
  color: "#9ca3af",
  margin: "0",
};

const dateText = {
  fontSize: "13px",
  color: "#9ca3af",
  margin: "0",
  textAlign: "right" as const,
};

const executiveSummaryStyle = {
  fontSize: "17px",
  lineHeight: "26px",
  color: "#1a1a1a",
  margin: "24px 0 16px",
  fontWeight: "400" as const,
};

const recommendationBox = {
  backgroundColor: "#f0fdf4",
  borderLeft: "3px solid #16a34a",
  padding: "12px 16px",
  margin: "0 0 24px",
  borderRadius: "0 6px 6px 0",
};

const recommendationText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#166534",
  margin: "0",
};

const metricsBar = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "16px 8px",
  margin: "0 0 32px",
};

const metricCell = {
  padding: "0 8px",
};

const metricDivider = {
  width: "1px",
  backgroundColor: "#e5e7eb",
};

const metricValue = {
  fontSize: "22px",
  fontWeight: "700" as const,
  color: "#1a1a1a",
  margin: "0",
  textAlign: "center" as const,
};

const metricLabel = {
  fontSize: "11px",
  color: "#6b7280",
  margin: "2px 0 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  textAlign: "center" as const,
};

const metricTrend = {
  fontSize: "12px",
  fontWeight: "600" as const,
  margin: "2px 0 0",
  textAlign: "center" as const,
};

const sectionTitle = {
  fontSize: "12px",
  fontWeight: "700" as const,
  color: "#6b7280",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 16px",
};

// ─── Topic Card Styles ──────────────────────────────────────────────────────

const topicCard = {
  backgroundColor: "#f9fafb",
  borderLeft: "3px solid #e5e7eb",
  borderRadius: "0 6px 6px 0",
  padding: "14px 16px",
  margin: "0 0 10px",
};

const topicName = {
  fontSize: "15px",
  fontWeight: "600" as const,
  color: "#1a1a1a",
  margin: "0",
  lineHeight: "22px",
};

const newBadge = {
  fontSize: "10px",
  fontWeight: "700" as const,
  color: "#ffffff",
  backgroundColor: "#2EC4A5",
  padding: "2px 6px",
  borderRadius: "3px",
  marginLeft: "6px",
  verticalAlign: "middle" as const,
};

const growthBadge = {
  fontSize: "11px",
  fontWeight: "700" as const,
  color: "#16a34a",
  backgroundColor: "#f0fdf4",
  padding: "2px 8px",
  borderRadius: "10px",
  margin: "0 4px 0 0",
  display: "inline-block" as const,
};

const sentimentPill = {
  fontSize: "11px",
  fontWeight: "600" as const,
  padding: "2px 10px",
  borderRadius: "10px",
  margin: "0",
  display: "inline-block" as const,
};

const topicStats = {
  fontSize: "13px",
  color: "#6b7280",
  margin: "4px 0 0",
};

const topicContext = {
  fontSize: "13px",
  color: "#4b5563",
  margin: "4px 0 0",
  fontStyle: "italic" as const,
};

// ─── Post Card Styles ───────────────────────────────────────────────────────

const postCard = {
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  padding: "12px 16px",
  margin: "0 0 8px",
};

const voteColumn = {
  width: "56px",
};

const voteCount = {
  fontSize: "18px",
  fontWeight: "700" as const,
  color: "#2EC4A5",
  margin: "0",
  textAlign: "center" as const,
  lineHeight: "22px",
};

const voteLabel = {
  fontSize: "10px",
  color: "#6b7280",
  margin: "0",
  textAlign: "center" as const,
  textTransform: "uppercase" as const,
};

const postContent = {
  paddingLeft: "8px",
};

const postTitleStyle = {
  fontSize: "14px",
  fontWeight: "500" as const,
  color: "#1a1a1a",
  margin: "0",
  lineHeight: "20px",
};

const statusPill = {
  fontSize: "11px",
  fontWeight: "600" as const,
  padding: "3px 10px",
  borderRadius: "10px",
  margin: "0",
  display: "inline-block" as const,
  textAlign: "right" as const,
};

// ─── Shared Styles ──────────────────────────────────────────────────────────

const emergingCard = {
  backgroundColor: "#eff6ff",
  borderRadius: "6px",
  padding: "12px 16px",
  margin: "0 0 8px",
};

const emergingText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#1e40af",
  margin: "0",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
};

const ctaButton = {
  backgroundColor: "#1a1a1a",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block" as const,
  fontSize: "14px",
  fontWeight: "500" as const,
  padding: "10px 24px",
  textDecoration: "none",
  textAlign: "center" as const,
};

const demoCta = {
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const demoCtaText = {
  fontSize: "15px",
  color: "#4a4a4a",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const settingsLink = {
  color: "#6b7280",
  textDecoration: "underline",
  fontSize: "13px",
};
