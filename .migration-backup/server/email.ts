import { Resend } from "resend";

const senderName = "Iseya";
const brandColor = "#d4a017";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getBaseUrl(): string {
  if (process.env.REPLIT_DEPLOYMENT) {
    return "https://iseya-ng.replit.app";
  }
  const replitDomains = process.env.REPLIT_DOMAINS;
  if (replitDomains) {
    return `https://${replitDomains.split(",")[0]}`;
  }
  return "https://iseya-ng.replit.app";
}

function getLogoUrl(): string {
  return `${getBaseUrl()}/email-logo.png`;
}

function emailWrapper(content: string): string {
  const logoUrl = getLogoUrl();
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 0; background: #ffffff;">
      <div style="background: ${brandColor}; padding: 24px 32px; text-align: center;">
        <img src="${logoUrl}" alt="Iseya" style="height: 40px; width: auto; margin-bottom: 8px;" />
        <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 13px;">Hire Talent, Get Hired</p>
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

function extractEmail(raw: string): string {
  const match = raw.match(/<([^>]+)>/);
  if (match) return match[1].trim();
  return raw.replace(/[<>]/g, "").trim();
}

async function sendEmail(to: string, toName: string, subject: string, htmlBody: string): Promise<boolean> {
  const client = getResendClient();
  const fromField = "Iseya <support@iseya.ng>";

  if (!client) {
    console.warn("Resend not configured — skipping email to", to);
    return false;
  }

  console.log("Resend from field:", JSON.stringify(fromField));

  try {
    const { data, error } = await client.emails.send({
      from: fromField,
      to: [to],
      subject,
      html: emailWrapper(htmlBody),
    });

    if (error) {
      console.error("Resend send error:", error);
      return false;
    }

    console.log(`Email sent to ${to}: ${subject} (id: ${data?.id})`);
    return true;
  } catch (err: any) {
    console.error("Resend send error:", err?.message || err);
    return false;
  }
}

export async function sendWelcomeEmail(to: string, name: string, role: string): Promise<boolean> {
  if (role === "applicant") {
    return sendApplicantWelcomeEmail(to, name);
  }
  if (role === "agent") {
    return sendAgentWelcomeEmail(to, name);
  }
  return sendEmployerWelcomeEmail(to, name);
}

async function sendApplicantWelcomeEmail(to: string, name: string): Promise<boolean> {
  const baseUrl = getBaseUrl();
  const logoImg = `${baseUrl}/email-logo-color.png`;
  const heroImg = `${baseUrl}/email-applicant-hero.png`;
  const celebrateImg = `${baseUrl}/email-applicant-celebrate.png`;
  const mailImg = `${baseUrl}/email-applicant-mail.png`;
  const searchImg = `${baseUrl}/email-applicant-search.png`;

  const client = getResendClient();
  const fromField = "Iseya <support@iseya.ng>";

  if (!client) {
    console.warn("Resend not configured — skipping email to", to);
    return false;
  }

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff6ec;">
      <!-- Logo -->
      <div style="text-align: center; padding: 30px 20px 10px;">
        <img src="${logoImg}" alt="Iseya" style="height: 50px; width: auto;" />
      </div>

      <!-- Hero Image -->
      <div style="text-align: center; padding: 10px 20px;">
        <img src="${heroImg}" alt="What you should Know as Applicant" style="width: 100%; max-width: 560px; border-radius: 12px;" />
      </div>

      <!-- Welcome Section -->
      <div style="padding: 20px 32px; text-align: center;">
        <div style="text-align: right; margin-bottom: -20px;">
          <img src="${celebrateImg}" alt="" style="height: 100px; width: auto;" />
        </div>
        <h2 style="color: #333; font-size: 22px; margin: 0 0 12px; font-weight: 700;">Now you can apply for your 1st Job.</h2>
        <p style="color: #555; line-height: 1.6; font-size: 15px; margin: 0 0 16px;">
          Welcome to Iṣéyá! 🎉 We're stoked to have you on board as an applicant, <strong>${name}</strong>! You've got access to awesome tools like job vacancy feeds, job management, and how to get hired on Iṣéyá. Let's get started!
        </p>
        <p style="color: #555; line-height: 1.6; font-size: 14px; margin: 0;">
          Check your dashboard — want us to walk you through a quick tour or jump into finding jobs?
        </p>
      </div>

      <!-- Get Job-Ready Section -->
      <div style="padding: 10px 32px 20px;">
        <div style="display: flex; align-items: flex-start;">
          <div style="flex: 1;">
            <h3 style="color: #333; font-size: 18px; font-weight: 700; margin: 0 0 12px;">Get Job-Ready with Iṣéyá!</h3>
            <table style="font-size: 14px; color: #555; line-height: 1.8;">
              <tr><td style="padding: 2px 0;">✅ Check your email for job alerts tailored to you</td></tr>
              <tr><td style="padding: 2px 0;">✅ We match you with jobs based on your preferences</td></tr>
              <tr><td style="padding: 2px 0;">✅ Connect quickly with employers looking for talent like you</td></tr>
              <tr><td style="padding: 2px 0;">✅ We'll recommend you to top employers — boost your chances!</td></tr>
            </table>
          </div>
          <div style="flex-shrink: 0; margin-left: 10px;">
            <img src="${mailImg}" alt="" style="height: 120px; width: auto;" />
          </div>
        </div>
      </div>

      <!-- Stand Out Section -->
      <div style="padding: 10px 32px 20px;">
        <div style="display: flex; align-items: flex-start;">
          <div style="flex-shrink: 0; margin-right: 10px;">
            <img src="${searchImg}" alt="" style="height: 120px; width: auto;" />
          </div>
          <div style="flex: 1;">
            <h3 style="color: #333; font-size: 18px; font-weight: 700; margin: 0 0 12px;">Stand Out & Get Hired!</h3>
            <table style="font-size: 14px; color: #555; line-height: 1.8;">
              <tr><td style="padding: 2px 0;">✅ Don't just sign up — build a killer profile!</td></tr>
              <tr><td style="padding: 2px 0;">✅ Verify your account to boost job opportunities</td></tr>
              <tr><td style="padding: 2px 0;">✅ Verification's affordable, and it:</td></tr>
              <tr><td style="padding: 2px 8px 2px 24px;">- Checks your background</td></tr>
              <tr><td style="padding: 2px 8px 2px 24px;">- Builds employer confidence</td></tr>
              <tr><td style="padding: 2px 0;">✅ Check the platform and email alerts regularly for jobs</td></tr>
              <tr><td style="padding: 2px 0;">✅ Get noticed and hired faster!</td></tr>
            </table>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div style="text-align: center; padding: 20px 32px 30px;">
        <h3 style="color: #333; font-size: 20px; font-weight: 700; margin: 0 0 16px;">We can't wait for you to find your 1st Job on Iṣéyá!</h3>
        <a href="https://iseya-ng.replit.app/dashboard" style="display: inline-block; background: ${brandColor}; color: #fff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
      </div>

      <!-- Footer -->
      <div style="background: ${brandColor}; padding: 20px 32px; text-align: center;">
        <p style="color: #fff; font-size: 14px; font-weight: 600; margin: 0;">Hire Talent, Get Hired</p>
      </div>
      <div style="padding: 16px 32px; text-align: center; background-color: #fff6ec;">
        <p style="color: #999; font-size: 12px; margin: 0;">© 2026 Iṣéyá. All rights reserved</p>
        <p style="color: #bbb; font-size: 11px; margin: 8px 0 0;">You're receiving this email because you signed up for updates from Iṣéyá.ng</p>
      </div>
    </div>
  `;

  try {
    const { data, error } = await client.emails.send({
      from: fromField,
      to: [to],
      subject: `Welcome to Iṣéyá, ${name}!`,
      html,
    });

    if (error) {
      console.error("Resend send error:", error);
      return false;
    }
    console.log(`Welcome email sent to ${to} (id: ${data?.id})`);
    return true;
  } catch (err: any) {
    console.error("Resend send error:", err?.message || err);
    return false;
  }
}

async function sendEmployerWelcomeEmail(to: string, name: string): Promise<boolean> {
  const baseUrl = getBaseUrl();
  const logoImg = `${baseUrl}/email-logo-color.png`;
  const heroImg = `${baseUrl}/email-employer-hero.png`;
  const celebrateImg = `${baseUrl}/email-applicant-celebrate.png`;
  const thumbsupImg = `${baseUrl}/email-employer-thumbsup.png`;
  const mailImg = `${baseUrl}/email-applicant-mail.png`;

  const client = getResendClient();
  const fromField = "Iseya <support@iseya.ng>";

  if (!client) {
    console.warn("Resend not configured — skipping email to", to);
    return false;
  }

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff6ec;">
      <div style="text-align: center; padding: 30px 20px 10px;">
        <img src="${logoImg}" alt="Iseya" style="height: 50px; width: auto;" />
      </div>

      <div style="text-align: center; padding: 10px 20px;">
        <img src="${heroImg}" alt="What you should Know as Employer" style="width: 100%; max-width: 560px; border-radius: 12px;" />
      </div>

      <div style="padding: 20px 32px; text-align: center;">
        <div style="text-align: right; margin-bottom: -20px;">
          <img src="${celebrateImg}" alt="" style="height: 100px; width: auto;" />
        </div>
        <h2 style="color: #333; font-size: 22px; margin: 0 0 12px; font-weight: 700;">Are you in Need of Talent?</h2>
        <p style="color: #555; line-height: 1.6; font-size: 15px; margin: 0 0 16px;">
          Welcome to Iṣéyá! 🎉 We're stoked to have you on board as an employer, <strong>${name}</strong>! You've got access to awesome tools like job vacancy feeds, job management, and how to get your next hire on Iṣéyá. Let's get started!
        </p>
        <p style="color: #555; line-height: 1.6; font-size: 14px; margin: 0;">
          Check your dashboard — want us to walk you through a quick tour or jump into posting jobs?
        </p>
      </div>

      <div style="padding: 10px 32px 20px;">
        <div style="display: flex; align-items: flex-start;">
          <div style="flex: 1;">
            <h3 style="color: #333; font-size: 18px; font-weight: 700; margin: 0 0 12px;">Hassle-Free Hiring on Iṣéyá!</h3>
            <table style="font-size: 14px; color: #555; line-height: 1.8;">
              <tr><td style="padding: 2px 0;">✅ We sort for you verified applicants that fit your job.</td></tr>
              <tr><td style="padding: 2px 0;">✅ Applicants' backgrounds checked by Iṣéyá — peace of mind!</td></tr>
              <tr><td style="padding: 2px 0;">✅ Post and manage jobs with ease:</td></tr>
              <tr><td style="padding: 2px 8px 2px 24px;">- Process applications</td></tr>
              <tr><td style="padding: 2px 8px 2px 24px;">- Schedule interviews</td></tr>
              <tr><td style="padding: 2px 8px 2px 24px;">- Create offers</td></tr>
              <tr><td style="padding: 2px 8px 2px 24px;">- Accept Applicant & More...</td></tr>
              <tr><td style="padding: 2px 0;">✅ Vet applicants and pick the best fit for your job.</td></tr>
            </table>
          </div>
          <div style="flex-shrink: 0; margin-left: 10px;">
            <img src="${thumbsupImg}" alt="" style="height: 120px; width: auto;" />
          </div>
        </div>
      </div>

      <div style="padding: 10px 32px 20px;">
        <div style="display: flex; align-items: flex-start;">
          <div style="flex-shrink: 0; margin-right: 10px;">
            <img src="${mailImg}" alt="" style="height: 120px; width: auto;" />
          </div>
          <div style="flex: 1;">
            <h3 style="color: #333; font-size: 18px; font-weight: 700; margin: 0 0 12px;">Post Jobs Smarter with Iṣéyá!</h3>
            <table style="font-size: 14px; color: #555; line-height: 1.8;">
              <tr><td style="padding: 2px 0;">✅ Job posts aren't free, but we've got you:</td></tr>
              <tr><td style="padding: 2px 0;">✅ 1 Free Job Post to start</td></tr>
              <tr><td style="padding: 2px 0;">✅ Flexible & Affordable Subscriptions for more posts</td></tr>
              <tr><td style="padding: 2px 0;">✅ Get interview credits with select plans — we'll interview and recommend applicants for you!</td></tr>
              <tr><td style="padding: 2px 0;">✅ 24/7 Support from our team</td></tr>
              <tr><td style="padding: 2px 0;">✅ Secure payments and data privacy guaranteed</td></tr>
            </table>
          </div>
        </div>
      </div>

      <div style="text-align: center; padding: 20px 32px 30px;">
        <h3 style="color: #333; font-size: 20px; font-weight: 700; margin: 0 0 16px;">We can't wait for your first Post on Iṣéyá — 30% Discount!!</h3>
        <a href="https://iseya-ng.replit.app/dashboard" style="display: inline-block; background: ${brandColor}; color: #fff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
      </div>

      <div style="background: ${brandColor}; padding: 20px 32px; text-align: center;">
        <p style="color: #fff; font-size: 14px; font-weight: 600; margin: 0;">Hire Talent, Get Hired</p>
      </div>
      <div style="padding: 16px 32px; text-align: center; background-color: #fff6ec;">
        <p style="color: #999; font-size: 12px; margin: 0;">© 2026 Iṣéyá. All rights reserved</p>
        <p style="color: #bbb; font-size: 11px; margin: 8px 0 0;">You're receiving this email because you signed up for updates from Iṣéyá.ng</p>
      </div>
    </div>
  `;

  try {
    const { data, error } = await client.emails.send({
      from: fromField,
      to: [to],
      subject: `Welcome to Iṣéyá, ${name}!`,
      html,
    });

    if (error) {
      console.error("Resend send error:", error);
      return false;
    }
    console.log(`Employer welcome email sent to ${to} (id: ${data?.id})`);
    return true;
  } catch (err: any) {
    console.error("Resend send error:", err?.message || err);
    return false;
  }
}

async function sendAgentWelcomeEmail(to: string, name: string): Promise<boolean> {
  const baseUrl = getBaseUrl();
  const logoImg = `${baseUrl}/email-logo-color.png`;
  const heroImg = `${baseUrl}/email-agent-hero.png`;
  const celebrateImg = `${baseUrl}/email-applicant-celebrate.png`;
  const searchImg = `${baseUrl}/email-applicant-search.png`;
  const mailImg = `${baseUrl}/email-applicant-mail.png`;

  const client = getResendClient();
  const fromField = "Iseya <support@iseya.ng>";

  if (!client) {
    console.warn("Resend not configured — skipping email to", to);
    return false;
  }

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff6ec;">
      <div style="text-align: center; padding: 30px 20px 10px;">
        <img src="${logoImg}" alt="Iseya" style="height: 50px; width: auto;" />
      </div>

      <div style="text-align: center; padding: 10px 20px;">
        <img src="${heroImg}" alt="What you should Know as an Agent" style="width: 100%; max-width: 560px; border-radius: 12px;" />
      </div>

      <div style="padding: 20px 32px; text-align: center;">
        <div style="text-align: right; margin-bottom: -20px;">
          <img src="${celebrateImg}" alt="" style="height: 100px; width: auto;" />
        </div>
        <h2 style="color: #333; font-size: 22px; margin: 0 0 12px; font-weight: 700;">Be aware of Job Vacancy in your Area</h2>
        <p style="color: #555; line-height: 1.6; font-size: 15px; margin: 0 0 16px;">
          Welcome to Iṣéyá! 🎉 We're stoked to have you on board as an agent, <strong>${name}</strong>! You've got access to awesome tools like job vacancy feeds, job management, and how to earn on Iṣéyá. Let's get you making money!
        </p>
        <p style="color: #555; line-height: 1.6; font-size: 14px; margin: 0;">
          Check your dashboard — want us to walk you through a quick tour or jump into posting jobs?
        </p>
      </div>

      <div style="padding: 10px 32px 20px;">
        <div style="display: flex; align-items: flex-start;">
          <div style="flex: 1;">
            <h3 style="color: #333; font-size: 18px; font-weight: 700; margin: 0 0 12px;">Tasks you do:</h3>
            <table style="font-size: 14px; color: #555; line-height: 1.8;">
              <tr><td style="padding: 2px 0;">✅ Search for job vacancies in your area</td></tr>
              <tr><td style="padding: 2px 0;">✅ Liaise with job owners</td></tr>
              <tr><td style="padding: 2px 0;">✅ Post and manage jobs</td></tr>
              <tr><td style="padding: 2px 0;">✅ Recommend applicants</td></tr>
            </table>
          </div>
          <div style="flex-shrink: 0; margin-left: 10px;">
            <img src="${searchImg}" alt="" style="height: 120px; width: auto;" />
          </div>
        </div>
      </div>

      <div style="padding: 10px 32px 20px;">
        <div style="display: flex; align-items: flex-start;">
          <div style="flex-shrink: 0; margin-right: 10px;">
            <img src="${mailImg}" alt="" style="height: 120px; width: auto;" />
          </div>
          <div style="flex: 1;">
            <h3 style="color: #333; font-size: 18px; font-weight: 700; margin: 0 0 12px;">Earn Big with Iṣéyá!</h3>
            <table style="font-size: 14px; color: #555; line-height: 1.8;">
              <tr><td style="padding: 2px 0;">✅ Job posts aren't free, so charge job owners a competitive rate.</td></tr>
              <tr><td style="padding: 2px 0;">✅ Earn commission on direct job posts from owners</td></tr>
              <tr><td style="padding: 2px 0;">✅ Boost earnings with Pay-per-Post or Subscription plans.</td></tr>
              <tr><td style="padding: 2px 0;">✅ Set your commission base and get tracking.</td></tr>
              <tr><td style="padding: 2px 0;">✅ Monitor jobs and recommend top applicants to owners.</td></tr>
            </table>
          </div>
        </div>
      </div>

      <div style="text-align: center; padding: 20px 32px 30px;">
        <h3 style="color: #333; font-size: 20px; font-weight: 700; margin: 0 0 16px;">We can't wait for your first Post on Iṣéyá & earn — 30% Discount!!</h3>
        <a href="https://iseya-ng.replit.app/dashboard" style="display: inline-block; background: ${brandColor}; color: #fff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
      </div>

      <div style="background: ${brandColor}; padding: 20px 32px; text-align: center;">
        <p style="color: #fff; font-size: 14px; font-weight: 600; margin: 0;">Hire Talent, Get Hired</p>
      </div>
      <div style="padding: 16px 32px; text-align: center; background-color: #fff6ec;">
        <p style="color: #999; font-size: 12px; margin: 0;">© 2026 Iṣéyá. All rights reserved</p>
        <p style="color: #bbb; font-size: 11px; margin: 8px 0 0;">You're receiving this email because you signed up for updates from Iṣéyá.ng</p>
      </div>
    </div>
  `;

  try {
    const { data, error } = await client.emails.send({
      from: fromField,
      to: [to],
      subject: `Welcome to Iṣéyá, ${name}!`,
      html,
    });

    if (error) {
      console.error("Resend send error:", error);
      return false;
    }
    console.log(`Agent welcome email sent to ${to} (id: ${data?.id})`);
    return true;
  } catch (err: any) {
    console.error("Resend send error:", err?.message || err);
    return false;
  }
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

export async function sendInterviewCancelledEmail(
  applicantEmail: string,
  applicantName: string,
  jobTitle: string,
  companyName: string,
  interviewDate: string,
  interviewTime: string,
  reason?: string | null
): Promise<boolean> {
  return sendEmail(applicantEmail, applicantName, `Interview Cancelled — ${jobTitle}`, `
    <h2 style="color: #333; margin: 0 0 16px;">Interview Cancelled</h2>
    <p style="color: #555; line-height: 1.6;">Hi ${applicantName},</p>
    <p style="color: #555; line-height: 1.6;">We're writing to let you know that your scheduled interview for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been cancelled.</p>
    <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #333;"><strong>Position:</strong> ${jobTitle}</p>
      <p style="margin: 8px 0 0; color: #333;"><strong>Was Scheduled:</strong> ${interviewDate} at ${interviewTime}</p>
      ${reason ? `<p style="margin: 12px 0 0; color: #666; font-size: 14px;"><strong>Reason:</strong> ${reason}</p>` : ""}
    </div>
    <p style="color: #555; line-height: 1.6;">If you have any questions, please contact the employer directly or reach out to our support team.</p>
  `);
}

export async function sendCounterOfferEmail(
  employerEmail: string,
  employerName: string,
  applicantName: string,
  jobTitle: string,
  originalSalary: number,
  counterSalary: number,
  counterCompensation?: string | null,
  counterNote?: string | null
): Promise<boolean> {
  return sendEmail(employerEmail, employerName, `Counter Offer Received — ${jobTitle}`, `
    <h2 style="color: #333; margin: 0 0 16px;">Counter Offer Received</h2>
    <p style="color: #555; line-height: 1.6;">Hi ${employerName},</p>
    <p style="color: #555; line-height: 1.6;"><strong>${applicantName}</strong> has submitted a counter offer for the position of <strong>${jobTitle}</strong>.</p>
    <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #333;"><strong>Your Offer:</strong> ₦${originalSalary.toLocaleString()}</p>
      <p style="margin: 8px 0 0; color: ${brandColor}; font-size: 20px; font-weight: 700;"><strong>Counter Offer:</strong> ₦${counterSalary.toLocaleString()}</p>
      ${counterCompensation ? `<p style="margin: 12px 0 0; color: #666; font-size: 14px;"><strong>Requested Benefits:</strong> ${counterCompensation}</p>` : ""}
      ${counterNote ? `<p style="margin: 8px 0 0; color: #666; font-size: 14px;"><strong>Applicant's Note:</strong> ${counterNote}</p>` : ""}
    </div>
    <p style="color: #555; line-height: 1.6;">Log in to your dashboard to review and respond to this counter offer.</p>
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

export async function sendTicketCreatedEmail(
  email: string,
  name: string,
  ticketId: number,
  subject: string,
  category: string,
  priority: string
): Promise<boolean> {
  const categoryLabels: Record<string, string> = {
    general: "General Inquiry",
    account: "Account Issues",
    payment: "Payment & Billing",
    job: "Job Listings",
    technical: "Technical Problem",
  };

  return sendEmail(email, name, `Support Ticket #${ticketId} — ${subject}`, `
    <h2 style="color: #333; margin: 0 0 16px;">Support Ticket Received</h2>
    <p style="color: #555; line-height: 1.6;">Hi ${name},</p>
    <p style="color: #555; line-height: 1.6;">We've received your support request and our team will review it shortly.</p>
    <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #333;"><strong>Ticket ID:</strong> #${ticketId}</p>
      <p style="margin: 8px 0 0; color: #333;"><strong>Subject:</strong> ${subject}</p>
      <p style="margin: 8px 0 0; color: #333;"><strong>Category:</strong> ${categoryLabels[category] || category}</p>
      <p style="margin: 8px 0 0; color: #333;"><strong>Priority:</strong> <span style="text-transform: capitalize;">${priority}</span></p>
    </div>
    <div style="background: #fdf8e8; border-left: 4px solid ${brandColor}; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="color: #333; margin: 0;">You can track the status of your ticket from your dashboard under the <strong>Support</strong> section.</p>
    </div>
    <p style="color: #666; font-size: 14px;">We typically respond within 24-48 hours. For urgent matters, email us directly at support@iseya.com.</p>
  `);
}

export async function sendTicketAdminNotifyEmail(
  adminEmail: string,
  adminName: string,
  ticketId: number,
  subject: string,
  userName: string,
  category: string,
  priority: string
): Promise<boolean> {
  return sendEmail(adminEmail, adminName, `New Support Ticket #${ticketId} — ${subject}`, `
    <h2 style="color: #333; margin: 0 0 16px;">New Support Ticket</h2>
    <p style="color: #555; line-height: 1.6;">Hi ${adminName},</p>
    <p style="color: #555; line-height: 1.6;">A new support ticket has been submitted by <strong>${userName}</strong>.</p>
    <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #333;"><strong>Ticket ID:</strong> #${ticketId}</p>
      <p style="margin: 8px 0 0; color: #333;"><strong>Subject:</strong> ${subject}</p>
      <p style="margin: 8px 0 0; color: #333;"><strong>Category:</strong> ${category}</p>
      <p style="margin: 8px 0 0; color: #333;"><strong>Priority:</strong> <span style="text-transform: capitalize; ${priority === "urgent" || priority === "high" ? "color: #dc2626; font-weight: 600;" : ""}">${priority}</span></p>
    </div>
    <p style="color: #555; line-height: 1.6;">Log in to the admin panel to review and respond to this ticket.</p>
  `);
}

export async function sendPasswordChangedEmail(to: string, name: string): Promise<boolean> {
  return sendEmail(to, name, "Your Password Has Been Changed", `
    <h2 style="color: #333; margin: 0 0 16px;">Password Reset Successfully</h2>
    <p style="color: #555; line-height: 1.6;">Hi ${name},</p>
    <p style="color: #555; line-height: 1.6;">Your password has been successfully changed. You can now sign in with your new password.</p>
    <div style="background: #fdf8e8; border-left: 4px solid ${brandColor}; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="color: #333; margin: 0; font-weight: 600;">Didn't make this change?</p>
      <p style="color: #666; margin: 8px 0 0; font-size: 14px;">If you didn't reset your password, please contact our support team at <a href="mailto:support@iseya.ng" style="color: ${brandColor}; text-decoration: underline;">support@iseya.ng</a> immediately to secure your account.</p>
    </div>
  `);
}

export async function sendContactFormAcknowledgement(
  email: string,
  name: string,
  ticketId: number,
  subject: string
): Promise<boolean> {
  return sendEmail(email, name, `We received your message — Ref #${ticketId}`, `
    <h2 style="color: #333; margin: 0 0 16px;">Thank You for Contacting Us</h2>
    <p style="color: #555; line-height: 1.6;">Hi ${name},</p>
    <p style="color: #555; line-height: 1.6;">We've received your message and our support team will get back to you shortly.</p>
    <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #333;"><strong>Reference:</strong> #${ticketId}</p>
      <p style="margin: 8px 0 0; color: #333;"><strong>Subject:</strong> ${subject}</p>
    </div>
    <p style="color: #666; font-size: 14px;">We typically respond within 24–48 hours. You can reply directly to this email or reach us at <a href="mailto:support@iseya.ng" style="color: ${brandColor}; text-decoration: underline;">support@iseya.ng</a>.</p>
  `);
}

export async function sendTicketReplyEmail(
  email: string,
  name: string,
  ticketId: number,
  subject: string,
  replyMessage: string
): Promise<boolean> {
  return sendEmail(email, name, `Re: ${subject} — Ref #${ticketId}`, `
    <h2 style="color: #333; margin: 0 0 16px;">New Reply on Your Support Request</h2>
    <p style="color: #555; line-height: 1.6;">Hi ${name},</p>
    <p style="color: #555; line-height: 1.6;">Our support team has responded to your inquiry (Ref #${ticketId}):</p>
    <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${brandColor};">
      <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap;">${replyMessage}</p>
    </div>
    <p style="color: #666; font-size: 14px;">You can reply directly to this email or contact us at <a href="mailto:support@iseya.ng" style="color: ${brandColor}; text-decoration: underline;">support@iseya.ng</a>.</p>
  `);
}

export async function sendProfileReminderEmail(to: string, name: string, role: string, missingFields: string[]): Promise<boolean> {
  const baseUrl = getBaseUrl();
  const missingList = missingFields.map(f => `<li style="color: #555; padding: 4px 0;">${f}</li>`).join("");
  const roleText = role === "employer" ? "posting jobs" : role === "agent" ? "posting jobs" : "applying for jobs";
  return sendEmail(to, name, "Complete Your Profile — Iṣéyá", `
    <h2 style="color: #333; margin: 0 0 16px;">Complete Your Profile</h2>
    <p style="color: #555; line-height: 1.6;">Hi ${name},</p>
    <p style="color: #555; line-height: 1.6;">We noticed your Iṣéyá profile is not yet complete. You'll need to fill in a few details before you can start ${roleText}.</p>
    <div style="background: #fdf3d7; border-left: 4px solid ${brandColor}; padding: 16px 20px; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0 0 8px; font-weight: 600; color: #333;">Missing information:</p>
      <ul style="margin: 0; padding-left: 20px;">
        ${missingList}
      </ul>
    </div>
    <p style="color: #555; line-height: 1.6;">It only takes a minute to complete. Click below to update your profile now:</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${baseUrl}/profile" style="display: inline-block; background: ${brandColor}; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">Complete My Profile →</a>
    </div>
    <p style="color: #888; font-size: 13px;">Once your profile is complete, you'll have full access to all Iṣéyá features.</p>
  `);
}

export async function sendPasswordResetEmail(to: string, name: string, code: string): Promise<boolean> {
  return sendEmail(to, name, "Password Reset Request", `
    <h2 style="color: #333; margin: 0 0 16px;">Password Reset Request</h2>
    <p style="color: #555; line-height: 1.6;">Hi ${name},</p>
    <p style="color: #555; line-height: 1.6;">We received a request to reset your password. Use the code below to proceed:</p>
    <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
      <span style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #333;">${code}</span>
    </div>
    <p style="color: #666; font-size: 14px;">This code expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
  `);
}
