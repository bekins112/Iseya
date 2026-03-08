interface FacebookPostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

interface JobData {
  id: number;
  title: string;
  description: string;
  location: string;
  category: string;
  jobType: string;
  wage?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  employerName?: string;
}

function formatSalary(salaryMin?: number | null, salaryMax?: number | null, wage?: string | null): string {
  if (salaryMin && salaryMax) {
    return `₦${salaryMin.toLocaleString()} - ₦${salaryMax.toLocaleString()}`;
  }
  if (salaryMin) return `₦${salaryMin.toLocaleString()}`;
  if (salaryMax) return `₦${salaryMax.toLocaleString()}`;
  if (wage) return wage;
  return "Competitive";
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function buildJobPost(job: JobData, siteUrl: string): string {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.wage);
  const jobSlug = slugify(job.title);
  const jobUrl = `${siteUrl}/jobs/${job.id}/${jobSlug}`;

  const lines = [
    `🔔 New Job Alert on Iṣéyá!`,
    ``,
    `📌 ${job.title}`,
    `📍 Location: ${job.location}`,
    `💼 Category: ${job.category}`,
    `⏰ Type: ${job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}`,
    `💰 Pay: ${salary}`,
  ];

  if (job.employerName) {
    lines.push(`🏢 Posted by: ${job.employerName}`);
  }

  lines.push(
    ``,
    `${job.description.length > 300 ? job.description.substring(0, 297) + "..." : job.description}`,
    ``,
    `👉 Apply now: ${jobUrl}`,
    ``,
    `#IṣéyáJobs #NigeriaJobs #CasualWork #JobAlert #${job.category.replace(/[^a-zA-Z0-9]/g, "")} #${job.location.replace(/[^a-zA-Z0-9]/g, "")}`
  );

  return lines.join("\n");
}

export async function postJobToFacebook(job: JobData, siteUrl: string): Promise<FacebookPostResult> {
  const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  if (!pageAccessToken || !pageId) {
    console.log("[facebook] Skipping Facebook post — FACEBOOK_PAGE_ACCESS_TOKEN or FACEBOOK_PAGE_ID not configured");
    return { success: false, error: "Facebook credentials not configured" };
  }

  const message = buildJobPost(job, siteUrl);

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/feed`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          access_token: pageAccessToken,
        }),
      }
    );

    const data = await response.json() as any;

    if (data.id) {
      console.log(`[facebook] Job #${job.id} posted to Facebook — Post ID: ${data.id}`);
      return { success: true, postId: data.id };
    } else {
      console.error(`[facebook] Failed to post job #${job.id}:`, data.error?.message || JSON.stringify(data));
      return { success: false, error: data.error?.message || "Unknown Facebook API error" };
    }
  } catch (err: any) {
    console.error(`[facebook] Error posting job #${job.id}:`, err.message);
    return { success: false, error: err.message };
  }
}
