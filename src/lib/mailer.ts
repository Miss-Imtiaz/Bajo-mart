import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!resend) {
    console.log("─────────────────────────────────────────");
    console.log("RESEND_API_KEY not set — printing email instead of sending it:");
    console.log(`To: ${to}`);
    console.log(`Reset link: ${resetUrl}`);
    console.log("─────────────────────────────────────────");
    return;
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to,
    subject: "Reset your Bajo Mart password",
    html: `
      <p>Someone requested a password reset for your Bajo Mart account.</p>
      <p><a href="${resetUrl}">Click here to set a new password</a>. This link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}
