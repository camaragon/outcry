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
import { main, container, heading, text, card, button, footer } from "./styles";

interface NewFeedbackEmailProps {
  postTitle: string;
  postBody: string;
  authorName: string;
  authorEmail: string;
  postUrl: string;
  dashboardUrl: string;
  workspaceName: string;
  boardName: string;
}

export default function NewFeedbackEmail({
  postTitle,
  postBody,
  authorName,
  authorEmail,
  postUrl,
  dashboardUrl,
  workspaceName,
  boardName,
}: NewFeedbackEmailProps) {
  // Truncate body if too long
  const truncatedBody =
    postBody.length > 200 ? postBody.slice(0, 200) + "..." : postBody;

  return (
    <Html>
      <Head />
      <Preview>New feedback: {postTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New Feedback</Heading>

          <Text style={text}>
            New feedback was submitted to <strong>{boardName}</strong> on{" "}
            {workspaceName}:
          </Text>

          <Section style={card}>
            <Text style={postTitleStyle}>{postTitle}</Text>
            <Text style={bodyText}>{truncatedBody}</Text>
            <Text style={authorText}>
              — {authorName} ({authorEmail})
            </Text>
          </Section>

          <Link href={postUrl} style={button}>
            View Feedback
          </Link>

          <Text style={secondaryAction}>
            Or go to your{" "}
            <Link href={dashboardUrl} style={link}>
              dashboard
            </Link>{" "}
            to manage all feedback.
          </Text>

          <Text style={footer}>
            You're receiving this because you're an admin of {workspaceName}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Template-specific styles
const postTitleStyle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 12px",
};

const bodyText = {
  fontSize: "15px",
  lineHeight: "22px",
  color: "#4a4a4a",
  margin: "0 0 12px",
};

const authorText = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0",
};

const secondaryAction = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "16px 0 0",
};

const link = {
  color: "#000000",
  textDecoration: "underline",
};
