import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { storage } from "./storage";

const viteLogger = createLogger();

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

export async function setupVite(server: Server, app: Express) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );

      const ogTags = await getJobOgTags(url);
      if (ogTags) {
        template = template.replace(
          /<title>.*?<\/title>[\s\S]*?<meta name="twitter:description"[^>]*\/>/,
          ogTags
        );
      }

      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
