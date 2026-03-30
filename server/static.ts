import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { storage } from "./storage";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function getJobOgTags(url: string): Promise<string | null> {
  const jobMatch = url.match(/^\/jobs\/(\d+)/);
  if (!jobMatch) return null;

  const jobId = parseInt(jobMatch[1]);
  try {
    const job = await storage.getJob(jobId);
    if (!job) return null;

    const employer = await storage.getUser(job.employerId);
    const companyName = employer?.companyName || "an employer";
    const locationParts = [job.state, job.city].filter(Boolean).join(", ") || job.location;
    const salaryText = job.salaryMin && job.salaryMax
      ? `₦${job.salaryMin.toLocaleString()} - ₦${job.salaryMax.toLocaleString()} (${job.wage})`
      : job.wage;
    const description = `${job.title} at ${companyName} in ${locationParts}. ${salaryText}. ${(job.description || "").substring(0, 150).replace(/<[^>]*>/g, "")}`;
    const pageTitle = `${escapeHtml(job.title)} in ${escapeHtml(locationParts)} | Iṣéyá Jobs`;
    const pageUrl = `https://iseya.ng/jobs/${job.id}`;

    return `
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(pageUrl)}" />
    <meta property="og:site_name" content="Iṣéyá" />
    <meta property="og:image" content="https://iseya.ng/og-image.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <title>${pageTitle}</title>`;
  } catch {
    return null;
  }
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  app.use("*", async (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    let html = await fs.promises.readFile(indexPath, "utf-8");

    const ogTags = await getJobOgTags(req.originalUrl);
    if (ogTags) {
      html = html.replace(
        /<title>.*?<\/title>[\s\S]*?<meta name="twitter:description"[^>]*\/>/,
        ogTags
      );
    }

    res.set({ "Content-Type": "text/html" }).send(html);
  });
}
