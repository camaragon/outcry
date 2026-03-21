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

function sentimentBadge(sentiment: TrendingTopic["sentiment"]): string {
  switch (sentiment) {
    case "frustrated":
      return "😤";
    case "positive":
      return "😊";
    default:
      return "💬";
  }
}

function statusColor(status: string): string {
  switch (status) {
    case "PLANNED":
      return "#2563eb";
    case "IN_PROGRESS":
      return "#d97706";
    case "COMPLETE":
      return "#16a34a";
    case "UNDER_REVIEW":
      return "#7c3aed";
    case "CLOSED":
      return "#6b7280";
    default:
      return "#1a1a1a";
  }
}

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Build the dynamic email subject line from the snapshot.
 * "Outcry: 'Dark mode' trending, engagement up 23% this week"
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

  return (
    <Html>
      <Head />
      <Preview>
        {insights.executiveSummary
          ? insights.executiveSummary.slice(0, 150)
          : `${summary.totalNewPosts} new posts this week on ${snapshot.workspaceName}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Minimal header */}
          <Section>
            <Row>
              <Column>
                <Text style={brandBadge}>OUTCRY</Text>
              </Column>
              <Column align="right">
                <Text style={dateText}>{dateRange}</Text>
              </Column>
            </Row>
          </Section>

          {/* Executive summary — the hook, no header */}
          {insights.executiveSummary && (
            <Text style={executiveSummaryStyle}>
              {insights.executiveSummary}
            </Text>
          )}

          {/* Recommendation callout */}
          {insights.recommendation && (
            <Section style={recommendationBox}>
              <Text style={recommendationText}>
                💡 {insights.recommendation}
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
              <Text style={sectionTitle}>Trending Topics</Text>
              {insights.trendingTopics.slice(0, 5).map((topic, i) => (
                <TopicRow key={i} topic={topic} />
              ))}
            </Section>
          )}

          {/* Emerging this week — only if data supports it */}
          {hasEmergingThemes && (
            <Section>
              <Text style={sectionTitle}>🆕 Emerging This Week</Text>
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
              <Text style={sectionTitle}>Top Posts</Text>
              {insights.topPosts.slice(0, 3).map((post, i) => (
                <PostRow key={i} post={post} />
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

function TopicRow({ topic }: { topic: TrendingTopic }) {
  return (
    <Section style={topicRow}>
      <Row>
        <Column style={{ width: "24px" }}>
          <Text style={topicSentiment}>{sentimentBadge(topic.sentiment)}</Text>
        </Column>
        <Column>
          <Text style={topicName}>
            {topic.topic}
            {topic.isNew && <span style={newBadge}> NEW</span>}
          </Text>
          <Text style={topicMeta}>
            {topic.postCount} posts · {topic.totalVotes} votes
          </Text>
        </Column>
      </Row>
    </Section>
  );
}

function PostRow({ post }: { post: TopPost }) {
  return (
    <Section style={postRow}>
      <Row>
        <Column style={{ width: "48px" }}>
          <Text style={voteBox}>▲ {post.voteCount}</Text>
        </Column>
        <Column>
          <Text style={postTitle}>{post.title}</Text>
        </Column>
        <Column align="right" style={{ width: "100px" }}>
          <Text
            style={{
              ...statusBadge,
              color: statusColor(post.status),
            }}
          >
            {formatStatus(post.status)}
          </Text>
        </Column>
      </Row>
    </Section>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
// All inline for email client compatibility

const brandBadge = {
  fontSize: "13px",
  fontWeight: "700" as const,
  color: "#2EC4A5",
  letterSpacing: "2px",
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
  fontSize: "14px",
  fontWeight: "600" as const,
  color: "#6b7280",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 12px",
};

const topicRow = {
  padding: "8px 0",
  borderBottom: "1px solid #f3f4f6",
};

const topicSentiment = {
  fontSize: "16px",
  margin: "0",
  lineHeight: "24px",
};

const topicName = {
  fontSize: "15px",
  fontWeight: "500" as const,
  color: "#1a1a1a",
  margin: "0",
  lineHeight: "22px",
};

const newBadge = {
  fontSize: "10px",
  fontWeight: "700" as const,
  color: "#ffffff",
  backgroundColor: "#2EC4A5",
  padding: "1px 5px",
  borderRadius: "3px",
  marginLeft: "6px",
  verticalAlign: "middle" as const,
};

const topicMeta = {
  fontSize: "13px",
  color: "#6b7280",
  margin: "2px 0 0",
};

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

const postRow = {
  padding: "10px 0",
  borderBottom: "1px solid #f3f4f6",
};

const voteBox = {
  fontSize: "13px",
  fontWeight: "600" as const,
  color: "#2EC4A5",
  margin: "0",
  textAlign: "center" as const,
};

const postTitle = {
  fontSize: "14px",
  color: "#1a1a1a",
  margin: "0",
  lineHeight: "20px",
};

const statusBadge = {
  fontSize: "11px",
  fontWeight: "600" as const,
  margin: "0",
  textAlign: "right" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.3px",
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
