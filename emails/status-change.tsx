import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { formatStatus } from "../lib/status-labels";
import { main, container, heading, text, card, button, footer, logoHeader } from "./styles";

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
          <Section style={logoHeader}>
            <Img
              src="https://outcry.app/logo.png"
              alt="Outcry"
              width="100"
              height="32"
            />
          </Section>
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

// Template-specific styles
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
