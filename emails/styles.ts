/**
 * Shared styles for email templates.
 * Single source of truth — keeps templates DRY.
 */

export const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

export const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

export const heading = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 24px",
};

export const text = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#4a4a4a",
  margin: "0 0 16px",
};

export const card = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

export const button = {
  backgroundColor: "#000000",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block" as const,
  fontSize: "16px",
  fontWeight: "500",
  padding: "12px 24px",
  textDecoration: "none",
};

export const footer = {
  fontSize: "14px",
  color: "#9ca3af",
  margin: "32px 0 0",
};
