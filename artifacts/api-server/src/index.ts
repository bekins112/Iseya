import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes/routes";
import { ensureAdminAccount } from "./auth";
import { logger } from "./lib/logger";

process.on("uncaughtException", (err: any) => {
  logger.error({ err }, "[uncaughtException]");
});

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "[unhandledRejection]");
});

const app = express();
const httpServer = createServer(app);

app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api") || path.startsWith("/uploads")) {
      logger.info({ method: req.method, path, status: res.statusCode, duration }, "request");
    }
  });
  next();
});

(async () => {
  await registerRoutes(httpServer, app);
  await ensureAdminAccount();

  const { startScheduler } = await import("./scheduler");
  startScheduler();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    logger.error({ err }, "[error]");
  });

  const rawPort = process.env["PORT"];
  if (!rawPort) throw new Error("PORT environment variable is required");
  const port = Number(rawPort);
  if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT value: "${rawPort}"`);

  httpServer.listen({ port, host: "0.0.0.0" }, () => {
    logger.info({ port }, "Server listening");
  });
})();
