import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not set — emails will not be sent");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Use verified outcry.app domain; fall back to Resend sandbox if needed
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Outcry <notifications@outcry.app>";
