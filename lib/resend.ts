import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not set — emails will not be sent");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Use verified domain in production, Resend sandbox in dev
export const FROM_EMAIL =
  process.env.NODE_ENV === "production"
    ? "Outcry <notifications@outcry.app>"
    : "Outcry <onboarding@resend.dev>";
