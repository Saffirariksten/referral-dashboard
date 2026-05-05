import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvitationEmail({
  to,
  name,
  token,
}: {
  to: string;
  name: string;
  token: string;
}) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${token}`;

  await resend.emails.send({
    from: "Referral Dashboard <noreply@yourdomain.com>",
    to,
    subject: "You've been invited to the creator dashboard",
    html: `
      <p>Hi ${name},</p>
      <p>You've been invited to join the creator referral dashboard. Click the button below to set up your account.</p>
      <p><a href="${url}" style="background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Set up my account</a></p>
      <p>This link expires in 7 days.</p>
    `,
  });
}
