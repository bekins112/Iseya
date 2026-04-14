import { storage } from "./storage";
import { db } from "./db";
import { eq, and, desc, gte } from "drizzle-orm";
import { jobs, applications, users } from "@shared/schema";
import type { Job, User } from "@shared/schema";

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
const BASE_URL = getBaseUrl();

async function getSettingValue(key: string): Promise<string> {
  const val = await storage.getSetting(key);
  return val ?? "false";
}

function getNigerianTime(): Date {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + 3600000);
}

function formatSalary(min: number | null, max: number | null): string {
  const fmt = (n: number) => `₦${n.toLocaleString()}`;
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  if (max) return `Up to ${fmt(max)}`;
  return "Negotiable";
}

function jobAlertEmailHtml(name: string, matchedJobs: Job[], location: string): string {
  const logoUrl = `${BASE_URL}/email-logo.png`;
  const brandColor = "#d4a017";
  const count = matchedJobs.length;

  const jobRows = matchedJobs.map(job => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #eee;">
        <h3 style="margin: 0 0 6px; color: #333; font-size: 16px;">
          <a href="${BASE_URL}/jobs/${job.id}" style="color: #333; text-decoration: none;">${job.title}</a>
        </h3>
        <p style="margin: 0 0 4px; color: #666; font-size: 13px;">${job.companyName || "Company"}</p>
        <p style="margin: 0 0 4px; color: #888; font-size: 13px;">📍 ${[job.state, job.city].filter(Boolean).join(", ") || job.location || "Nigeria"}</p>
        <p style="margin: 0 0 4px; color: #888; font-size: 13px;">📋 ${job.jobType || "Full-time"} &nbsp;|&nbsp; 💰 ${formatSalary(job.salaryMin, job.salaryMax)}</p>
        <p style="margin: 6px 0 10px; color: #555; font-size: 13px; line-height: 1.4;">${(job.description || "").substring(0, 120)}${(job.description || "").length > 120 ? "..." : ""}</p>
        <a href="${BASE_URL}/jobs/${job.id}" style="display: inline-block; background: ${brandColor}; color: #fff; padding: 8px 20px; border-radius: 4px; text-decoration: none; font-size: 13px; font-weight: 600;">Apply Now →</a>
      </td>
    </tr>
  `).join("");

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff;">
      <div style="background: ${brandColor}; padding: 24px 32px; text-align: center;">
        <img src="${logoUrl}" alt="Iseya" style="height: 40px; width: auto; margin-bottom: 8px;" />
        <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 13px;">Hire Talent, Get Hired</p>
      </div>
      <div style="padding: 32px 32px 16px;">
        <h2 style="color: #333; margin: 0 0 8px; font-size: 20px;">${count} Latest Jobs ${location ? `in ${location}` : "For You"}</h2>
        <p style="color: #666; margin: 0 0 20px; font-size: 14px;">Hi ${name}, these job ads match your preferences.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          ${jobRows}
        </table>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${BASE_URL}/browse-jobs" style="display: inline-block; background: ${brandColor}; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">Browse All Jobs</a>
        </div>
      </div>
      <div style="border-top: 1px solid #eee; padding: 20px 32px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Iṣéyá. All rights reserved.</p>
        <p style="color: #bbb; font-size: 11px; margin: 8px 0 0;">This email was sent to you by Iṣéyá based on your job preferences.</p>
      </div>
    </div>
  `;
}

function applicationReminderEmailHtml(name: string, pendingApps: { jobTitle: string; jobId: number; appliedAt: string }[], suggestedJobs: Job[]): string {
  const logoUrl = `${BASE_URL}/email-logo.png`;
  const brandColor = "#d4a017";

  const pendingRows = pendingApps.map(app => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
        <a href="${BASE_URL}/jobs/${app.jobId}" style="color: #333; text-decoration: none; font-weight: 600; font-size: 14px;">${app.jobTitle}</a>
        <p style="margin: 4px 0 0; color: #999; font-size: 12px;">Applied ${app.appliedAt}</p>
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
        <span style="background: #fdf3d7; color: #92600a; padding: 3px 10px; border-radius: 12px; font-size: 12px;">Pending</span>
      </td>
    </tr>
  `).join("");

  const suggestedRows = suggestedJobs.slice(0, 3).map(job => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
        <a href="${BASE_URL}/jobs/${job.id}" style="color: #333; text-decoration: none; font-weight: 600; font-size: 14px;">${job.title}</a>
        <p style="margin: 4px 0 0; color: #888; font-size: 12px;">${job.companyName || "Company"} • ${[job.state, job.city].filter(Boolean).join(", ") || "Nigeria"}</p>
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
        <a href="${BASE_URL}/jobs/${job.id}" style="color: ${brandColor}; text-decoration: none; font-size: 13px; font-weight: 600;">View →</a>
      </td>
    </tr>
  `).join("");

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff;">
      <div style="background: ${brandColor}; padding: 24px 32px; text-align: center;">
        <img src="${logoUrl}" alt="Iseya" style="height: 40px; width: auto; margin-bottom: 8px;" />
        <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 13px;">Hire Talent, Get Hired</p>
      </div>
      <div style="padding: 32px 32px 16px;">
        <h2 style="color: #333; margin: 0 0 8px; font-size: 20px;">Your Application Update</h2>
        <p style="color: #666; margin: 0 0 20px; font-size: 14px;">Hi ${name}, here's a quick update on your job applications.</p>
        ${pendingApps.length > 0 ? `
          <h3 style="color: #333; font-size: 15px; margin: 0 0 10px; border-bottom: 2px solid ${brandColor}; padding-bottom: 6px;">📋 Pending Applications (${pendingApps.length})</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px;">
            ${pendingRows}
          </table>
        ` : ""}
        ${suggestedJobs.length > 0 ? `
          <h3 style="color: #333; font-size: 15px; margin: 0 0 10px; border-bottom: 2px solid ${brandColor}; padding-bottom: 6px;">🔍 More Jobs You Might Like</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px;">
            ${suggestedRows}
          </table>
        ` : ""}
        <div style="text-align: center; margin: 24px 0;">
          <a href="${BASE_URL}/applications" style="display: inline-block; background: ${brandColor}; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">View My Applications</a>
        </div>
      </div>
      <div style="border-top: 1px solid #eee; padding: 20px 32px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Iṣéyá. All rights reserved.</p>
        <p style="color: #bbb; font-size: 11px; margin: 8px 0 0;">Keep applying to increase your chances of landing the perfect job!</p>
      </div>
    </div>
  `;
}

function newsPushEmailHtml(title: string, content: string, imageCid?: string): string {
  const logoUrl = `${BASE_URL}/email-logo.png`;
  const brandColor = "#d4a017";

  const imageBlock = imageCid
    ? `<div style="text-align: center; margin: 0 0 20px;"><img src="cid:${imageCid}" alt="Promotion" style="max-width: 100%; height: auto; border-radius: 8px;" /></div>`
    : "";

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff;">
      <div style="background: ${brandColor}; padding: 24px 32px; text-align: center;">
        <img src="${logoUrl}" alt="Iseya" style="height: 40px; width: auto; margin-bottom: 8px;" />
        <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 13px;">Hire Talent, Get Hired</p>
      </div>
      <div style="padding: 32px 32px 16px;">
        <h2 style="color: #333; margin: 0 0 16px; font-size: 20px;">${title}</h2>
        ${imageBlock}
        <div style="color: #555; font-size: 14px; line-height: 1.6;">${content}</div>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${BASE_URL}" style="display: inline-block; background: ${brandColor}; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">Visit Iṣéyá</a>
        </div>
      </div>
      <div style="border-top: 1px solid #eee; padding: 20px 32px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Iṣéyá. All rights reserved.</p>
        <p style="color: #bbb; font-size: 11px; margin: 8px 0 0;">You received this because you are a registered Iṣéyá user.</p>
      </div>
    </div>
  `;
}

interface EmailAttachment {
  filename: string;
  content: Buffer;
  content_type?: string;
}

async function sendBulkEmail(to: string, name: string, subject: string, html: string, attachments?: EmailAttachment[]): Promise<boolean> {
  const { Resend } = await import("resend");
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const client = new Resend(apiKey);
    const emailPayload: any = {
      from: "Iseya <support@iseya.ng>",
      to: [to],
      subject,
      html,
    };
    if (attachments && attachments.length > 0) {
      emailPayload.attachments = attachments.map(a => ({
        filename: a.filename,
        content: a.content,
        content_type: a.content_type,
      }));
    }
    const { error } = await client.emails.send(emailPayload);
    if (error) {
      console.error(`[scheduler] Email error for ${to}:`, error);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error(`[scheduler] Email send failed for ${to}:`, err?.message);
    return false;
  }
}

export async function runWeeklyJobAlerts(): Promise<{ sent: number; total: number }> {
  console.log("[scheduler] Running weekly job alerts...");

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const recentJobs = await db.select().from(jobs)
    .where(and(eq(jobs.isActive, true), eq(jobs.status, "active"), gte(jobs.createdAt, oneWeekAgo)))
    .orderBy(desc(jobs.createdAt));

  if (recentJobs.length === 0) {
    console.log("[scheduler] No recent jobs to send alerts for.");
    return { sent: 0, total: 0 };
  }

  const applicants = await db.select().from(users)
    .where(eq(users.role, "applicant"));

  let sent = 0;
  for (const applicant of applicants) {
    if (!applicant.email) continue;

    let matched = recentJobs;
    const prefs = applicant.preferredJobTypes || [];
    const cats = applicant.preferredCategories || [];
    const state = applicant.state;

    if (prefs.length > 0 || cats.length > 0 || state) {
      const filtered = recentJobs.filter(job => {
        const typeMatch = prefs.length === 0 || (job.jobType && prefs.includes(job.jobType));
        const catMatch = cats.length === 0 || (job.category && cats.includes(job.category));
        const locMatch = !state || job.state === state;
        return typeMatch || catMatch || locMatch;
      });
      if (filtered.length > 0) matched = filtered;
    }

    matched = matched.slice(0, 10);
    const location = state || "";
    const name = applicant.firstName || "Job Seeker";

    const html = jobAlertEmailHtml(name, matched, location);
    const success = await sendBulkEmail(applicant.email, name, `${matched.length} New Jobs ${location ? `in ${location}` : "For You"} | Iṣéyá`, html);
    if (success) sent++;

    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`[scheduler] Weekly job alerts: sent ${sent}/${applicants.length}`);
  return { sent, total: applicants.length };
}

export async function runApplicationReminders(): Promise<{ sent: number; total: number }> {
  console.log("[scheduler] Running application reminders...");

  const applicants = await db.select().from(users)
    .where(eq(users.role, "applicant"));

  const recentJobs = await db.select().from(jobs)
    .where(and(eq(jobs.isActive, true), eq(jobs.status, "active")))
    .orderBy(desc(jobs.createdAt))
    .limit(20);

  let sent = 0;
  for (const applicant of applicants) {
    if (!applicant.email) continue;

    const userApps = await storage.getApplicationsForApplicant(applicant.id);
    const pendingApps = userApps.filter(a => a.status === "pending" || a.status === "applied");

    if (pendingApps.length === 0 && recentJobs.length === 0) continue;

    const pendingData = await Promise.all(pendingApps.slice(0, 5).map(async app => {
      const job = await storage.getJob(app.jobId);
      return {
        jobTitle: job?.title || "Job",
        jobId: app.jobId,
        appliedAt: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Recently",
      };
    }));

    const appliedJobIds = new Set(userApps.map(a => a.jobId));
    const suggestedJobs = recentJobs.filter(j => !appliedJobIds.has(j.id));

    const name = applicant.firstName || "Job Seeker";
    const html = applicationReminderEmailHtml(name, pendingData, suggestedJobs);
    const success = await sendBulkEmail(applicant.email, name, `Your Application Update | Iṣéyá`, html);
    if (success) sent++;

    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`[scheduler] Application reminders: sent ${sent}/${applicants.length}`);
  return { sent, total: applicants.length };
}

export async function runProfileReminders(): Promise<{ sent: number; total: number }> {
  console.log("[scheduler] Running profile completion reminders...");
  const { sendProfileReminderEmail } = await import("./email");

  const admins = await db.select().from(users).where(eq(users.role, "admin"));
  const adminUser = admins.find(a => a.email === "bekinsmart@gmail.com") || admins[0];

  const applicants = await db.select().from(users).where(eq(users.role, "applicant"));
  const employers = await db.select().from(users).where(eq(users.role, "employer"));
  const agentUsers = await db.select().from(users).where(eq(users.role, "agent"));

  const allCandidates = [...applicants, ...employers, ...agentUsers];
  let sent = 0;
  let total = 0;

  for (const user of allCandidates) {
    if (!user.email) continue;

    const missing: string[] = [];

    if (user.role === "applicant") {
      if (!user.firstName?.trim()) missing.push("First name");
      if (!user.lastName?.trim()) missing.push("Last name");
      if (!user.phone?.trim()) missing.push("Phone number");
      if (!user.gender?.trim()) missing.push("Gender");
      if (!user.age || user.age < 18) missing.push("Date of birth / Age");
      if (!user.state?.trim()) missing.push("State");
    } else if (user.role === "employer") {
      if (!user.firstName?.trim()) missing.push("First name");
      if (!user.lastName?.trim()) missing.push("Last name");
      if (!user.companyName?.trim()) missing.push("Company name");
      if (!user.businessCategory?.trim()) missing.push("Business category");
      if (!user.companyState?.trim()) missing.push("Company state");
    } else if (user.role === "agent") {
      if (!user.firstName?.trim()) missing.push("First name");
      if (!user.lastName?.trim()) missing.push("Last name");
      if (!(user as any).agencyName?.trim()) missing.push("Agency name");
      if (!user.phone?.trim()) missing.push("Phone number");
      if (!user.state?.trim()) missing.push("State");
    }

    if (missing.length === 0) continue;
    total++;

    const name = user.firstName || "User";
    const success = await sendProfileReminderEmail(user.email, name, user.role || "applicant", missing);
    if (success) sent++;

    if (adminUser) {
      try {
        await storage.createNotification({
          title: "Complete Your Profile",
          message: `Your profile is incomplete. Please update the following: ${missing.join(", ")}. Go to your Profile page to complete it.`,
          type: "personal",
          targetUserId: user.id,
          createdBy: adminUser.id,
        });
      } catch (err) {
        // skip notification if creation fails
      }
    }

    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`[scheduler] Profile reminders: sent ${sent}/${total} incomplete profiles`);
  return { sent, total };
}

export async function runNewsPush(title: string, content: string, targetRole?: string, imagePath?: string): Promise<{ sent: number; total: number }> {
  console.log(`[scheduler] Running news push: "${title}" to ${targetRole || "all"}${imagePath ? " with image" : ""}...`);

  let allUsers: User[];
  if (targetRole && targetRole !== "all") {
    allUsers = await db.select().from(users).where(eq(users.role, targetRole));
  } else {
    allUsers = await db.select().from(users);
  }

  let attachments: EmailAttachment[] | undefined;
  let imageCid: string | undefined;

  if (imagePath) {
    try {
      const fs = await import("fs");
      const pathMod = await import("path");
      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        const ext = pathMod.extname(imagePath).toLowerCase();
        const mimeMap: Record<string, string> = {
          ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
          ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif",
        };
        const filename = pathMod.basename(imagePath);
        imageCid = `promo-image-${Date.now()}`;
        attachments = [{
          filename,
          content: imageBuffer,
          content_type: mimeMap[ext] || "image/png",
        }];
      }
    } catch (err) {
      console.error("[scheduler] Failed to read promo image:", err);
    }
  }

  const html = newsPushEmailHtml(title, content, imageCid);
  let sent = 0;

  for (const user of allUsers) {
    if (!user.email) continue;
    const name = user.firstName || "User";
    const success = await sendBulkEmail(user.email, name, `${title} | Iṣéyá`, html, attachments);
    if (success) sent++;
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`[scheduler] News push: sent ${sent}/${allUsers.length}`);
  return { sent, total: allUsers.length };
}

let schedulerInterval: NodeJS.Timeout | null = null;
let lastSentJobAlerts = "";
let lastSentReminders = "";
let lastSentProfileReminders = "";

function parseScheduleDays(val: string): number[] {
  return val.split(",").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n >= 0 && n <= 6);
}

function parseScheduleTime(val: string): { hour: number; minute: number } {
  const parts = val.split(":");
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1] || "0", 10);
  if (isNaN(hour) || isNaN(minute)) return { hour: 8, minute: 0 };
  return { hour: Math.max(0, Math.min(23, hour)), minute: Math.max(0, Math.min(59, minute)) };
}

function getDateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getDay()}`;
}

export function startScheduler() {
  if (schedulerInterval) return;

  console.log("[scheduler] Starting automated email scheduler (WAT timezone)...");

  schedulerInterval = setInterval(async () => {
    const watNow = getNigerianTime();
    const day = watNow.getDay();
    const hour = watNow.getHours();
    const minute = watNow.getMinutes();
    const dateKey = getDateKey(watNow);

    try {
      const alertsEnabled = await getSettingValue("auto_weekly_job_alerts");
      if (alertsEnabled === "true") {
        const alertDaysStr = (await getSettingValue("job_alerts_schedule_days")) || "1";
        const alertTimeStr = (await getSettingValue("job_alerts_schedule_time")) || "08:00";
        const alertDays = parseScheduleDays(alertDaysStr);
        const alertTime = parseScheduleTime(alertTimeStr);

        const alertSentKey = `alerts-${dateKey}`;
        if (alertDays.includes(day) && hour === alertTime.hour && minute >= alertTime.minute && minute <= alertTime.minute + 4 && lastSentJobAlerts !== alertSentKey) {
          lastSentJobAlerts = alertSentKey;
          console.log(`[scheduler] Triggering weekly job alerts (WAT day=${day}, time=${hour}:${String(minute).padStart(2, "0")})`);
          await runWeeklyJobAlerts();
        }
      }

      const remindersEnabled = await getSettingValue("auto_application_reminders");
      if (remindersEnabled === "true") {
        const reminderDaysStr = (await getSettingValue("app_reminders_schedule_days")) || "3,5";
        const reminderTimeStr = (await getSettingValue("app_reminders_schedule_time")) || "08:00";
        const reminderDays = parseScheduleDays(reminderDaysStr);
        const reminderTime = parseScheduleTime(reminderTimeStr);

        const reminderSentKey = `reminders-${dateKey}`;
        if (reminderDays.includes(day) && hour === reminderTime.hour && minute >= reminderTime.minute && minute <= reminderTime.minute + 4 && lastSentReminders !== reminderSentKey) {
          lastSentReminders = reminderSentKey;
          console.log(`[scheduler] Triggering application reminders (WAT day=${day}, time=${hour}:${String(minute).padStart(2, "0")})`);
          await runApplicationReminders();
        }
      }
      const profileRemindersEnabled = await getSettingValue("auto_profile_reminders");
      if (profileRemindersEnabled === "true") {
        const profileDaysStr = (await getSettingValue("profile_reminders_schedule_days")) || "2,4";
        const profileTimeStr = (await getSettingValue("profile_reminders_schedule_time")) || "10:00";
        const profileDays = parseScheduleDays(profileDaysStr);
        const profileTime = parseScheduleTime(profileTimeStr);

        const profileSentKey = `profile-${dateKey}`;
        if (profileDays.includes(day) && hour === profileTime.hour && minute >= profileTime.minute && minute <= profileTime.minute + 4 && lastSentProfileReminders !== profileSentKey) {
          lastSentProfileReminders = profileSentKey;
          console.log(`[scheduler] Triggering profile completion reminders (WAT day=${day}, time=${hour}:${String(minute).padStart(2, "0")})`);
          await runProfileReminders();
        }
      }
    } catch (err) {
      console.error("[scheduler] Error in scheduled task:", err);
    }
  }, 30 * 1000);
}

export function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("[scheduler] Scheduler stopped.");
  }
}
