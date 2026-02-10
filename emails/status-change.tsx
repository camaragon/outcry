import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { formatStatus } from "@/lib/status-labels";

interface StatusChangeEmailProps {
  userName: string;
  postTitle: string;
  oldStatus: string;
  newStatus: string;
  postUrl: string;
  workspaceName: string;
}

export default function StatusChangeEmail({
  userName,
  postTitle,
  oldStatus,
  newStatus,
  postUrl,
  workspaceName,
}: StatusChangeEmailProps) {
  const oldLabel = formatStatus(oldStatus);
  const newLabel = formatStatus(newStatus);

  return (
    <Html>
      <Head />
      <Preview>
        Your feedback &ldquo;{postTitle}&rdquo; is now {newLabel}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Status Update</Heading>

          <Text style={text}>Hi {userName},</Text>

          <Text style={text}>
            Your feedback on {workspaceName} has been updated:
          </Text>

          <Section style={card}>
            <Text style={postTitleStyle}>&ldquo;{postTitle}&rdquo;</Text>
            <Text style={statusChange}>
              {oldLabel} → <strong>{newLabel}</strong>
            </Text>
          </Section>

          <Link href={postUrl} style={button}>
            View Feedback
          </Link>

          <Text style={footer}>
            You&apos;re receiving this because you submitted feedback on{" "}
            {workspaceName}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 24px",
};

const text = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#4a4a4a",
  margin: "0 0 16px",
};

const card = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const postTitleStyle = {
  fontSize: "18px",
  fontWeight: "500",
  color: "#1a1a1a",
  margin: "0 0 8px",
};

const statusChange = {
  fontSize: "16px",
  color: "#6b7280",
  margin: "0",
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "500",
  padding: "12px 24px",
  textDecoration: "none",
};

const footer = {
  fontSize: "14px",
  color: "#9ca3af",
  margin: "32px 0 0",
};
