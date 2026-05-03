import { storage } from "./storage";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractIdFromSlug(slug: string): number | null {
  if (/^\d+$/.test(slug)) return parseInt(slug, 10);
  const m = slug.match(/-(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

function getBaseUrl(_req?: unknown): string {
  // Use a trusted env var instead of Host header to avoid OG/meta-poisoning.
  // Falls back to the canonical production URL.
  const env = process.env.PUBLIC_BASE_URL?.trim();
  if (env && /^https?:\/\//i.test(env)) {
    return env.replace(/\/$/, "");
  }
  return "https://iseya.ng";
}

export async function getJobOgTags(
  url: string,
  req?: { protocol?: string; get?: (h: string) => string | undefined }
): Promise<string | null> {
  const jobMatch = url.match(/^\/jobs\/([^/?#]+)/);
  if (!jobMatch) return null;
  const slug = decodeURIComponent(jobMatch[1]);
  const jobId = extractIdFromSlug(slug);
  if (!jobId) return null;

  try {
    const job = await storage.getJob(jobId);
    if (!job) return null;

    const employer = await storage.getUser(job.employerId);
    const companyName = employer?.companyName || "an employer";
    const locationParts =
      [job.state, job.city].filter(Boolean).join(", ") || job.location;
    const salaryText =
      job.salaryMin && job.salaryMax
        ? `₦${job.salaryMin.toLocaleString()} - ₦${job.salaryMax.toLocaleString()} (${job.wage})`
        : job.wage;
    const description = `${job.title} at ${companyName} in ${locationParts}. ${salaryText}. ${(job.description || "")
      .substring(0, 150)
      .replace(/<[^>]*>/g, "")}`;
    const pageTitle = `${escapeHtml(job.title)} in ${escapeHtml(locationParts)} | Iṣéyá Jobs`;
    const baseUrl = getBaseUrl(req);
    const pageUrl = `${baseUrl}/jobs/${slug}`;
    const cardImageUrl = `${baseUrl}/api/jobs/${job.id}/share-card.png`;

    return `
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(pageUrl)}" />
    <meta property="og:site_name" content="Iṣéyá" />
    <meta property="og:image" content="${escapeHtml(cardImageUrl)}" />
    <meta property="og:image:width" content="1080" />
    <meta property="og:image:height" content="1080" />
    <meta property="og:image:alt" content="${escapeHtml(job.title)} - Iṣéyá Jobs" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(cardImageUrl)}" />
    <title>${pageTitle}</title>`;
  } catch {
    return null;
  }
}
