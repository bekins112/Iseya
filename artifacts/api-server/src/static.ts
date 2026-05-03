import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { getJobOgTags } from "./og-tags";

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

    const ogTags = await getJobOgTags(req.originalUrl, req);
    if (ogTags) {
      html = html.replace(
        /<title>.*?<\/title>[\s\S]*?<meta name="twitter:description"[^>]*\/>/,
        ogTags
      );
    }

    res.set({ "Content-Type": "text/html" }).send(html);
  });
}
