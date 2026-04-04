import { storage } from "./storage";
import { db } from "./db";
import { eq, and, desc, gte } from "drizzle-orm";
import { jobs, applications, users } from "@shared/schema";
import type { Job, User } from "@shared/schema";

const BASE_URL = "https://iseya-ng.replit.app";

async function getSettingValue(key: string): Promise<string> {
  const val = await storage.getSetting(key);
  return val ?? "false";
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

function newsPushEmailHtml(title: string, content: string): string {
  const logoUrl = `${BASE_URL}/email-logo.png`;
  const brandColor = "#d4a017";

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff;">
      <div style="background: ${brandColor}; padding: 24px 32px; text-align: center;">
        <img src="${logoUrl}" alt="Iseya" style="height: 40px; width: auto; margin-bottom: 8px;" />
        <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 13px;">Hire Talent, Get Hired</p>
      </div>
      <div style="padding: 32px 32px 16px;">
        <h2 style="color: #333; margin: 0 0 16px; font-size: 20px;">${title}</h2>
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

async function sendBulkEmail(to: string, name: string, subject: string, html: string): Promise<boolean> {
  const { Resend } = await import("resend");
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const client = new Resend(apiKey);
    const { error } = await client.emails.send({
      from: "Iseya <support@iseya.ng>",
      to: [to],
      subject,
      html,
    });
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
    .where(and(eq(users.role, "applicant"), eq(users.subscribedToNewsletter, true)));

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

export async function runNewsPush(title: string, content: string, targetRole?: string): Promise<{ sent: number; total: number }> {
  console.log(`[scheduler] Running news push: "${title}" to ${targetRole || "all"}...`);

  let allUsers: User[];
  if (targetRole && targetRole !== "all") {
    allUsers = await db.select().from(users).where(eq(users.role, targetRole));
  } else {
    allUsers = await db.select().from(users);
  }

  const html = newsPushEmailHtml(title, content);
  let sent = 0;

  for (const user of allUsers) {
    if (!user.email) continue;
    const name = user.firstName || "User";
    const success = await sendBulkEmail(user.email, name, `${title} | Iṣéyá`, html);
    if (success) sent++;
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`[scheduler] News push: sent ${sent}/${allUsers.length}`);
  return { sent, total: allUsers.length };
}

let schedulerInterval: NodeJS.Timeout | null = null;

export function startScheduler() {
  if (schedulerInterval) return;

  console.log("[scheduler] Starting automated email scheduler...");

  schedulerInterval = setInterval(async () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    if (hour !== 8) return;

    try {
      if (day === 1) {
        const enabled = await getSettingValue("auto_weekly_job_alerts");
        if (enabled === "true") {
          await runWeeklyJobAlerts();
        }
      }

      if (day === 3 || day === 5) {
        const enabled = await getSettingValue("auto_application_reminders");
        if (enabled === "true") {
          await runApplicationReminders();
        }
      }
    } catch (err) {
      console.error("[scheduler] Error in scheduled task:", err);
    }
  }, 60 * 60 * 1000);
}

export function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("[scheduler] Scheduler stopped.");
  }
}
