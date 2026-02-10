import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not set — emails will not be sent");
}

export const resend: Resend | null = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Default sender — override via RESEND_FROM_EMAIL env var
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Outcry <notifications@outcry.app>";
