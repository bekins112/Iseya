import Mailjet from "node-mailjet";

const senderName = "Iṣéyá";
const brandColor = "#d4a017";

function getMailjetClient() {
  return new Mailjet({
    apiKey: process.env.MJ_APIKEY_PUBLIC || "",
    apiSecret: process.env.MJ_APIKEY_PRIVATE || "",
  });
}

function emailWrapper(content: string): string {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 0; background: #ffffff;">
      <div style="background: ${brandColor}; padding: 24px 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">Iṣéyá</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 13px;">Nigeria's Job Marketplace</p>
      </div>
      <div style="padding: 32px 32px 24px;">
        ${content}
      </div>
      <div style="border-top: 1px solid #eee; padding: 20px 32px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Iṣéyá. All rights reserved.</p>
        <p style="color: #bbb; font-size: 11px; margin: 8px 0 0;">This is an automated message. Please do not reply directly.</p>
      </div>
    </div>
  `;
}

async function sendEmail(to: string, toName: string, subject: string, htmlBody: string): Promise<boolean> {
  const apiKey = process.env.MJ_APIKEY_PUBLIC;
  const apiSecret = process.env.MJ_APIKEY_PRIVATE;
  const senderEmail = process.env.MJ_SENDER_EMAIL || "noreply@iseya.com";

  if (!apiKey || !apiSecret) {
    console.warn("Mailjet not configured — skipping email to", to);
    return false;
  }

  try {
    const client = getMailjetClient();
    const result = await client.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: { Email: senderEmail, Name: senderName },
          To: [{ Email: to, Name: toName }],
          Subject: subject,
          HTMLPart: emailWrapper(htmlBody),
        },
      ],
    });
    console.log(`Email sent to ${to}: ${subject}`);
    return true;
  } catch (err: any) {
    console.error("Mailjet send error:", err?.statusCode, err?.response?.body || err?.message || err);
    return false;
  }
}

export async function sendWelcomeEmail(to: string, name: string, role: string): Promise<boolean> {
  const roleText = role === "employer" ? "post jobs and find great workers" : "discover job opportunities";
  return sendEmail(to, name, `Welcome to Iṣéyá, ${name}!`, `
    <h2 style="color: #333; margin: 0 0 16px;">Welcome aboard, ${name}! 🎉</h2>
    <p style="color: #555; line-height: 1.6;">Your account has been created successfully. You're all set to ${roleText} on Iṣéyá.</p>
    ${role === "employer" ? `
      <p style="color: #555; line-height: 1.6;">As an employer, you can post job listings, review applications, schedule interviews, and send offers — all from your dashboard.</p>
    ` : `
      <p style="color: #555; line-height: 1.6;">As an applicant, you can browse available jobs, apply with one click, and track your application status — all from your dashboard.</p>
    `}
    <div style="background: #fdf8e8; border-left: 4px solid ${brandColor}; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="color: #333; margin: 0; font-weight: 600;">Get started now!</p>
      <p style="color: #666; margin: 8px 0 0; font-size: 14px;">Log in to your dashboard and ${role === "employer" ? "post your first job" : "start browsing available jobs"}.</p>
    </div>
  `);
}

export async function sendApplicationReceivedEmail(
  applicantEmail: string,
  applicantName: string,
  jobTitle: string,
  companyName: string
): Promise<boolean> {
  return sendEmail(applicantEmail, applicantName, `Application Submitted — ${jobTitle}`, `
    <h2 style="color: #333; margin: 0 0 16px;">Application Received</h2>
    <p style="color: #555; line-height: 1.6;">Hi ${applicantName},</p>
    <p style="color: #555; line-height: 1.6;">Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been submitted successfully.</p>
    <div style="background: #f7f7f7; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #333;"><strong>Job:</strong> ${jobTitle}</p>
      <p style="margin: 8px 0 0; color: #333;"><strong>Company:</strong> ${companyName}</p>
      <p style="margin: 8px 0 0; color: #333;"><strong>Status:</strong> Pending Review</p>
    </div>
    <p style="color: #666; font-size: 14px;">The employer will review your application and you'll be notified of any updates. Good luck!</p>
  `);
}

export async function sendNewApplicationNotifyEmployer(
  employerEmail: string,
  employerName: string,
  applicantName: string,
  jobTitle: string
): Promise<boolean> {
  return sendEmail(employerEmail, employerName, `New Application for ${jobTitle}`, `
    <h2 style="color: #333; margin: 0 0 16px;">New Application Received</h2>
    <p style="color: #555; line-height: 1.6;">Hi ${employerName},</p>
    <p style="color: #555; line-height: 1.6;"><strong>${applicantName}</strong> has applied for your job listing: <strong>${jobTitle}</strong>.</p>
    <div style="background: #fdf8e8; border-left: 4px solid ${brandColor}; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="color: #333; margin: 0;">Log in to your dashboard to review this application and take action.</p>
    </div>
  `);
}

export async function sendApplicationStatusEmail(
  applicantEmail: string,
  applicantName: string,
  jobTitle: string,
  status: string,
  companyName: string
): Promise<boolean> {
  const statusLabels: Record<string, { label: string; color: string; message: string }> = {
    shortlisted: {
      label: "Shortlisted",
      color: "#2563eb",
      message: "Great news! You've been shortlisted. The employer is interested in your profile.",
    },
    rejected: {
      label: "Not Selected",
      color: "#dc2626",
      message: "Unfortunately, the employer has decided to move forward with other candidates for this position.",
    },
    accepted: {
      label: "Accepted",
      color: "#16a34a",
      message: "Congratulations! Your application has been accepted. Check your dashboard for next steps.",
    },
    offered: {
      label: "Offer Sent",
      color: "#d4a017",
      message: "You've received a job offer! Log in to your dashboard to review the offer details.",
    },
  };

  const info = statusLabels[status];
  if (!info) return false;

  return sendEmail(applicantEmail, applicantName, `Application Update — ${jobTitle}`, `
    <h2 style="color: #333; margin: 0 0 16px;">Application Update</h2>
    <p style="color: #555; line-height: 1.6;">Hi ${applicantName},</p>
    <p style="color: #555; line-height: 1.6;">Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated.</p>
    <div style="background: #f7f7f7; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <span style="display: inline-block; background: ${info.color}; color: #fff; padding: 6px 20px; border-radius: 20px; font-weight: 600; font-size: 15px;">${info.label}</span>
    </div>
    <p style="color: #555; line-height: 1.6;">${info.message}</p>
  `);
}

export async function sendOfferEmail(
  applicantEmail: string,
  applicantName: string,
  jobTitle: string,
  companyName: string,
  salary: number,
  note?: string | null
): Promise<boolean> {
  return sendEmail(applicantEmail, applicantName, `Job Offer — ${jobTitle}`, `
    <h2 style="color: #333; margin: 0 0 16px;">You've Received a Job Offer! 🎉</h2>
    <p style="color: #555; line-height: 1.6;">Hi ${applicantName},</p>
    <p style="color: #555; line-height: 1.6;"><strong>${companyName}</strong> has sent you an offer for the position of <strong>${jobTitle}</strong>.</p>
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #333; font-size: 14px;"><strong>Offered Salary:</strong></p>
      <p style="margin: 4px 0 0; color: #16a34a; font-size: 24px; font-weight: 700;">₦${salary.toLocaleString()}</p>
      ${note ? `<p style="margin: 12px 0 0; color: #666; font-size: 14px;"><strong>Note from employer:</strong> ${note}</p>` : ""}
    </div>
    <p style="color: #555; line-height: 1.6;">Log in to your dashboard to accept or decline this offer.</p>
  `);
}

export async function sendOfferResponseEmail(
  employerEmail: string,
  employerName: string,
  applicantName: string,
  jobTitle: string,
  status: "accepted" | "declined"
): Promise<boolean> {
  const accepted = status === "accepted";
  return sendEmail(employerEmail, employerName, `Offer ${accepted ? "Accepted" : "Declined"} — ${jobTitle}`, `
    <h2 style="color: #333; margin: 0 0 16px;">Offer ${accepted ? "Accepted" : "Declined"}</h2>
    <p style="color: #555; line-height: 1.6;">Hi ${employerName},</p>
    <p style="color: #555; line-height: 1.6;"><strong>${applicantName}</strong> has <strong style="color: ${accepted ? "#16a34a" : "#dc2626"};">${status}</strong> your offer for the position of <strong>${jobTitle}</strong>.</p>
    ${accepted ? `
      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="color: #333; margin: 0;">Great news! You can now coordinate next steps with your new hire through your dashboard.</p>
      </div>
    ` : `
      <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="color: #333; margin: 0;">The applicant has declined this offer. You can review other applications from your dashboard.</p>
      </div>
    `}
  `);
}

export async function sendInterviewScheduledEmail(
  applicantEmail: string,
  applicantName: string,
  jobTitle: string,
  companyName: string,
  interviewDate: string,
  interviewTime: string,
  interviewType: string,
  location?: string | null,
  meetingLink?: string | null,
  notes?: string | null
): Promise<boolean> {
  const typeLabel = interviewType === "in-person" ? "In-Person" : interviewType === "video" ? "Video Call" : "Phone Call";
  let venueInfo = "";
  if (interviewType === "in-person" && location) {
    venueInfo = `<p style="margin: 8px 0 0; color: #333;"><strong>Location:</strong> ${location}</p>`;
  } else if (interviewType === "video" && meetingLink) {
    venueInfo = `<p style="margin: 8px 0 0; color: #333;"><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: ${brandColor};">${meetingLink}</a></p>`;
  }

  return sendEmail(applicantEmail, applicantName, `Interview Scheduled — ${jobTitle}`, `
    <h2 style="color: #333; margin: 0 0 16px;">Interview Scheduled 📅</h2>
    <p style="color: #555; line-height: 1.6;">Hi ${applicantName},</p>
    <p style="color: #555; line-height: 1.6;"><strong>${companyName}</strong> has scheduled an interview with you for the position of <strong>${jobTitle}</strong>.</p>
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #333;"><strong>Date:</strong> ${interviewDate}</p>
      <p style="margin: 8px 0 0; color: #333;"><strong>Time:</strong> ${interviewTime}</p>
      <p style="margin: 8px 0 0; color: #333;"><strong>Type:</strong> ${typeLabel}</p>
      ${venueInfo}
      ${notes ? `<p style="margin: 12px 0 0; color: #666; font-size: 14px;"><strong>Notes:</strong> ${notes}</p>` : ""}
    </div>
    <p style="color: #666; font-size: 14px;">Please be prepared and on time. Good luck!</p>
  `);
}

export async function sendSubscriptionEmail(
  email: string,
  name: string,
  plan: string
): Promise<boolean> {
  const planNames: Record<string, string> = {
    standard: "Standard",
    premium: "Premium",
    enterprise: "Enterprise",
  };
  const planPrices: Record<string, string> = {
    standard: "₦9,999/month",
    premium: "₦24,999/month",
    enterprise: "₦44,999/month",
  };

  return sendEmail(email, name, `Subscription Activated — ${planNames[plan] || plan} Plan`, `
    <h2 style="color: #333; margin: 0 0 16px;">Subscription Activated! ✅</h2>
    <p style="color: #555; line-height: 1.6;">Hi ${name},</p>
    <p style="color: #555; line-height: 1.6;">Your <strong>${planNames[plan] || plan}</strong> subscription has been activated successfully.</p>
    <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #333;"><strong>Plan:</strong> ${planNames[plan] || plan}</p>
      <p style="margin: 8px 0 0; color: #333;"><strong>Price:</strong> ${planPrices[plan] || "Custom"}</p>
      <p style="margin: 8px 0 0; color: #333;"><strong>Billing Cycle:</strong> Monthly</p>
    </div>
    <p style="color: #666; font-size: 14px;">You can manage your subscription from your dashboard at any time.</p>
  `);
}

export async function sendVerificationApprovedEmail(
  email: string,
  name: string
): Promise<boolean> {
  return sendEmail(email, name, "Verification Approved — Iṣéyá", `
    <h2 style="color: #333; margin: 0 0 16px;">You're Now Verified! ✅</h2>
    <p style="color: #555; line-height: 1.6;">Hi ${name},</p>
    <p style="color: #555; line-height: 1.6;">Your identity verification has been <strong style="color: #16a34a;">approved</strong>. You now have a verified badge on your profile.</p>
    <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="color: #333; margin: 0; font-weight: 600;">Benefits of being verified:</p>
      <ul style="color: #555; margin: 8px 0 0; padding-left: 20px;">
        <li>Verified badge on your profile</li>
        <li>Priority in application listings</li>
        <li>Higher employer confidence</li>
        <li>Background-checked status</li>
      </ul>
    </div>
  `);
}

export async function sendVerificationRejectedEmail(
  email: string,
  name: string,
  reason?: string | null
): Promise<boolean> {
  return sendEmail(email, name, "Verification Update — Iṣéyá", `
    <h2 style="color: #333; margin: 0 0 16px;">Verification Update</h2>
    <p style="color: #555; line-height: 1.6;">Hi ${name},</p>
    <p style="color: #555; line-height: 1.6;">Unfortunately, your identity verification request has been <strong style="color: #dc2626;">declined</strong>.</p>
    ${reason ? `
      <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="color: #333; margin: 0;"><strong>Reason:</strong> ${reason}</p>
      </div>
    ` : ""}
    <p style="color: #555; line-height: 1.6;">You may re-submit your verification with clearer documents. Please ensure your ID card photo is clear and your selfie shows you holding the ID card next to your face.</p>
  `);
}

export async function sendVerificationEmail(to: string, code: string, name: string): Promise<void> {
  const sent = await sendEmail(to, name, "Verify Your Email — Iṣéyá", `
    <h2 style="color: #333; margin: 0 0 16px;">Email Verification</h2>
    <p style="color: #555; line-height: 1.6;">Hi ${name},</p>
    <p style="color: #555; line-height: 1.6;">Your email verification code is:</p>
    <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
      <span style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #333;">${code}</span>
    </div>
    <p style="color: #666; font-size: 14px;">This code expires in 15 minutes. If you didn't request this, please ignore this email.</p>
  `);
  if (!sent) {
    throw new Error("Failed to send verification email");
  }
}

export async function sendPasswordResetEmail(to: string, name: string, resetLink: string): Promise<boolean> {
  return sendEmail(to, name, "Password Reset — Iṣéyá", `
    <h2 style="color: #333; margin: 0 0 16px;">Password Reset Request</h2>
    <p style="color: #555; line-height: 1.6;">Hi ${name},</p>
    <p style="color: #555; line-height: 1.6;">We received a request to reset your password. Click the button below to set a new password:</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${resetLink}" style="display: inline-block; background: ${brandColor}; color: #fff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Reset Password</a>
    </div>
    <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
  `);
}
