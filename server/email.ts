export async function sendVerificationEmail(to: string, code: string, name: string): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    throw new Error("Email service not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Iṣéyá <onboarding@resend.dev>",
      to: [to],
      subject: "Verify Your Email - Iṣéyá",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <h2 style="color: #d4a017; margin-bottom: 8px;">Iṣéyá</h2>
          <p>Hi ${name},</p>
          <p>Your email verification code is:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
            <span style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #333;">${code}</span>
          </div>
          <p style="color: #666; font-size: 14px;">This code expires in 15 minutes. If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">Iṣéyá - Nigeria's Job Marketplace</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Resend API error:", error);
    throw new Error("Failed to send email");
  }
}
