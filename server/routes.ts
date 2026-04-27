import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, isAuthenticated } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { postJobToFacebook } from "./facebook";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { eq, desc } from "drizzle-orm";
import { jobs } from "@shared/schema";
import { adminUpdateUserSchema, updateAdminPermissionsSchema, insertAdminPermissionsSchema, adminUpdateJobSchema, createSubAdminSchema, createNewAdminSchema, insertTicketSchema, insertReportSchema, adminUpdateTicketSchema, adminUpdateReportSchema, adminUpdateSubscriptionSchema, insertJobHistorySchema } from "@shared/schema";
import { logActivity } from "./activity-logger";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  sendWelcomeEmail,
  sendApplicationReceivedEmail,
  sendNewApplicationNotifyEmployer,
  sendApplicationStatusEmail,
  sendOfferEmail,
  sendOfferResponseEmail,
  sendInterviewScheduledEmail,
  sendInterviewCancelledEmail,
  sendCounterOfferEmail,
  sendSubscriptionEmail,
  sendVerificationApprovedEmail,
  sendVerificationRejectedEmail,
  sendTicketCreatedEmail,
  sendTicketAdminNotifyEmail,
  sendContactFormAcknowledgement,
  sendTicketReplyEmail,
} from "./email";
import { storeFileInDb, getFileFromDb, migrateExistingUploads, restoreFilesFromDb } from "./file-storage";

for (const dir of ["uploads/cv", "uploads/profile", "uploads/logo", "uploads/tickets", "uploads/ads", "uploads/email-promo"]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const cvStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/cv"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.session.userId}_${Date.now()}${ext}`);
  },
});

const profileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/profile"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.session.userId}_${Date.now()}${ext}`);
  },
});

const uploadCV = multer({
  storage: cvStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only PDF and DOC files are allowed"));
  },
});

const logoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/logo"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.session.userId}_${Date.now()}${ext}`);
  },
});

const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only image files (JPG, PNG, WEBP) are allowed"));
  },
});

const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only image files (JPG, PNG, WEBP) are allowed"));
  },
});

const verificationDocStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/verification"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.session.userId}_${file.fieldname}_${Date.now()}${ext}`);
  },
});

const uploadVerificationDocs = multer({
  storage: verificationDocStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only image files (JPG, PNG, WEBP) and PDF are allowed"));
  },
});

const ticketAttachmentStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/tickets"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.session.userId}_${Date.now()}${ext}`);
  },
});

const uploadTicketAttachment = multer({
  storage: ticketAttachmentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only images (JPG, PNG, WEBP, GIF), PDF, and DOC files are allowed"));
  },
});

const adMediaStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/ads"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `ad_${Date.now()}${ext}`);
  },
});

const uploadAdMedia = multer({
  storage: adMediaStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only image files (JPG, PNG, WEBP, GIF, SVG) are allowed"));
  },
});

const emailPromoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/email-promo"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `promo_${Date.now()}${ext}`);
  },
});

const uploadEmailPromo = multer({
  storage: emailPromoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only image files (JPG, PNG, WEBP, GIF) are allowed"));
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);

  // === SHARE CARD IMAGE (for social media OG previews) ===
  app.get("/api/jobs/:idOrSlug/share-card.png", async (req, res) => {
    try {
      const { generateShareCardPng } = await import("./share-card");
      const raw = req.params.idOrSlug || "";
      const m = raw.match(/-(\d+)$/) || raw.match(/^(\d+)$/);
      const jobId = m ? parseInt(m[1], 10) : NaN;
      if (!jobId || isNaN(jobId)) {
        res.status(400).send("Invalid job id");
        return;
      }
      const job = await storage.getJob(jobId);
      if (!job) {
        res.status(404).send("Job not found");
        return;
      }
      const result = await generateShareCardPng(job.id, job.title);
      if (!result) {
        res.status(500).send("Failed to generate image");
        return;
      }
      const ifNoneMatch = req.headers["if-none-match"];
      if (ifNoneMatch && ifNoneMatch === result.etag) {
        res.status(304).end();
        return;
      }
      res.set({
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        ETag: result.etag,
      });
      res.send(result.png);
    } catch (err) {
      console.error("[share-card route] error:", err);
      res.status(500).send("Internal error");
    }
  });

  // === USERS ===
  app.patch(api.users.update.path, isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    try {
      const input = api.users.update.input.parse(req.body);
      const user = await storage.updateUser(userId, input);
      res.json(user);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // === JOBS ===
  app.get(api.jobs.list.path, async (req, res) => {
    const filters = {
      category: req.query.category as string,
      location: req.query.location as string,
      state: req.query.state as string,
      jobType: req.query.jobType as string,
      minSalary: req.query.minSalary ? Number(req.query.minSalary) : undefined,
      maxSalary: req.query.maxSalary ? Number(req.query.maxSalary) : undefined,
    };
    const jobsList = await storage.getJobs(filters);
    const jobsWithEmployer = await Promise.all(
      jobsList.map(async (job) => {
        const employer = await storage.getUser(job.employerId);
        return {
          ...job,
          employerName: employer?.companyName || `${employer?.firstName || ""} ${employer?.lastName || ""}`.trim() || "Employer",
          employerLogo: employer?.companyLogo || null,
        };
      })
    );
    res.json(jobsWithEmployer);
  });

  app.get(api.jobs.get.path, async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid job ID" });
    const job = await storage.getJob(id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    const employer = await storage.getUser(job.employerId);
    res.json({
      ...job,
      employerName: employer?.companyName || `${employer?.firstName || ""} ${employer?.lastName || ""}`.trim() || "Employer",
      employerLogo: employer?.companyLogo || null,
    });
  });

  app.post(api.jobs.create.path, isAuthenticated, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user || (user.role !== 'employer' && user.role !== 'agent' && user.role !== 'admin')) {
      return res.status(403).json({ message: "Only employers and agents can post jobs" });
    }

    if (user.role === 'employer') {
      const employerMissing: string[] = [];
      if (!user.firstName?.trim()) employerMissing.push("First name");
      if (!user.lastName?.trim()) employerMissing.push("Last name");
      if (!user.companyName?.trim()) employerMissing.push("Company name");
      if (!user.businessCategory?.trim()) employerMissing.push("Business category");
      if (!user.companyState?.trim()) employerMissing.push("Company state");
      if (employerMissing.length > 0) {
        return res.status(403).json({
          message: `Please complete your profile before posting a job. Missing: ${employerMissing.join(", ")}.`,
          code: "PROFILE_INCOMPLETE",
          missingFields: employerMissing,
        });
      }
    }

    if (user.role === 'agent') {
      const agentMissing: string[] = [];
      if (!user.firstName?.trim()) agentMissing.push("First name");
      if (!user.lastName?.trim()) agentMissing.push("Last name");
      if (!(user as any).agencyName?.trim()) agentMissing.push("Agency name");
      if (!user.phone?.trim()) agentMissing.push("Phone number");
      if (!user.state?.trim()) agentMissing.push("State");
      if (agentMissing.length > 0) {
        return res.status(403).json({
          message: `Please complete your agent profile before posting a job. Missing: ${agentMissing.join(", ")}.`,
          code: "PROFILE_INCOMPLETE",
          missingFields: agentMissing,
        });
      }
    }

    if (user.role === 'employer') {
      const SUBSCRIPTION_PLANS = await getSubscriptionPlans();
      const currentPlan = user.subscriptionStatus || "free";
      const limit = SUBSCRIPTION_PLANS[currentPlan]?.jobLimit ?? 0;

      if (limit !== -1) {
        const employerJobs = await storage.getJobsByEmployer(user.id);
        const activeJobCount = employerJobs.filter(j => j.isActive).length;
        if (activeJobCount >= limit) {
          const planName = currentPlan === "free" ? "Basic (Free)" : currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);
          return res.status(403).json({
            message: limit === 0
              ? `Your Basic (Free) plan does not include job postings. Please upgrade to Standard or higher to post jobs.`
              : `You've reached the ${limit} active job limit for your ${planName} plan. Upgrade your plan to post more jobs.`,
            code: "JOB_LIMIT_REACHED"
          });
        }
      }
    }

    if (user.role === 'agent') {
      const currentPlan = user.subscriptionStatus || "free";
      if (currentPlan === "free") {
        const credits = (user as any).agentPostCredits || 0;
        if (credits <= 0) {
          return res.status(403).json({
            message: "You need to purchase a job post credit or subscribe to a plan to post jobs.",
            code: "AGENT_PAYMENT_REQUIRED",
          });
        }
      } else {
        const SUBSCRIPTION_PLANS = await getSubscriptionPlans();
        const limit = SUBSCRIPTION_PLANS[currentPlan]?.jobLimit ?? -1;
        if (limit !== -1) {
          const agentJobs = await storage.getJobsByEmployer(user.id);
          const activeJobCount = agentJobs.filter(j => j.isActive).length;
          if (activeJobCount >= limit) {
            const planName = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);
            return res.status(403).json({
              message: `You've reached the ${limit} active job limit for your ${planName} plan. Upgrade your plan to post more jobs.`,
              code: "JOB_LIMIT_REACHED"
            });
          }
        }
      }
    }

    try {
      const bodyWithDate = {
        ...req.body,
        employerId: user.id,
        deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
      };
      if (user.role === 'agent') {
        bodyWithDate.agentId = user.id;
      }
      const input = api.jobs.create.input.parse(bodyWithDate);
      const jobData: any = { ...input, status: "active" };
      const job = await storage.createJob(jobData);

      if (user.role === 'agent') {
        const currentPlan = user.subscriptionStatus || "free";
        if (currentPlan === "free") {
          const newCredits = Math.max(0, ((user as any).agentPostCredits || 0) - 1);
          await storage.updateUser(user.id, { agentPostCredits: newCredits } as any);
        }
      }

      const currentPlan = user.subscriptionStatus || "free";
      if (currentPlan === "premium" || currentPlan === "enterprise") {
        const siteUrl = process.env.REPLIT_DOMAINS
          ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
          : `${req.protocol}://${req.get("host")}`;
        postJobToFacebook({
          ...job,
          state: job.state,
          employerName: user.role === 'agent'
            ? ((user as any).agencyName || `${user.firstName} ${user.lastName}`)
            : (user.companyName || `${user.firstName} ${user.lastName}`),
        }, siteUrl).catch(err => console.error("[facebook] Background post failed:", err));
      }

      logActivity({ req, userId: user.id, userEmail: user.email || undefined, userRole: user.role || undefined, action: "create_job", category: "jobs", description: `${user.role === 'agent' ? 'Agent' : 'Employer'} posted job: ${job.title}`, targetType: "job", targetId: String(job.id) });
      res.status(201).json(job);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
           message: err.errors[0].message,
           field: err.errors[0].path.join('.')
        });
      }
      console.error("Job creation error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.jobs.delete.path, isAuthenticated, async (req, res) => {
    const jobId = Number(req.params.id);
    if (isNaN(jobId)) return res.status(400).json({ message: "Invalid job ID" });
    const job = await storage.getJob(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const userId = req.session.userId!;
    const user = await storage.getUser(userId);

    const isJobOwner = job.employerId === userId || job.agentId === userId;
    if (!isJobOwner && user?.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }

    const restrictFreeEmployerDelete = (await getSettingValue("restrict_free_employer_management")) === "true";
    if (restrictFreeEmployerDelete && user?.role === 'employer' && user.subscriptionStatus === "free") {
      return res.status(403).json({ message: "Please upgrade your subscription to manage jobs.", code: "SUBSCRIPTION_REQUIRED" });
    }

    await storage.deleteJob(jobId);
    res.status(204).send();
  });

  app.patch(api.jobs.update.path, isAuthenticated, async (req, res) => {
    const jobId = Number(req.params.id);
    if (isNaN(jobId)) return res.status(400).json({ message: "Invalid job ID" });
    const job = await storage.getJob(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const userId = req.session.userId!;
    const user = await storage.getUser(userId);

    const isJobOwner = job.employerId === userId || job.agentId === userId;
    if (!isJobOwner && user?.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }

    const restrictFreeEmployerUpdate = (await getSettingValue("restrict_free_employer_management")) === "true";
    if (restrictFreeEmployerUpdate && user?.role === 'employer' && user.subscriptionStatus === "free") {
      return res.status(403).json({ message: "Please upgrade your subscription to manage jobs.", code: "SUBSCRIPTION_REQUIRED" });
    }

    try {
      const bodyForParse = { ...req.body };
      if (bodyForParse.deadline && typeof bodyForParse.deadline === "string") {
        bodyForParse.deadline = new Date(bodyForParse.deadline);
      }
      const input = api.jobs.update.input.parse(bodyForParse);
      const updateData: any = { ...input };
      if (req.body.deadline === null) {
        updateData.deadline = null;
      }
      if (req.body.status) {
        updateData.status = req.body.status;
      }
      const updatedJob = await storage.updateJob(jobId, updateData);
      res.json(updatedJob);
    } catch (err: any) {
      console.error("Job update error:", err?.message || err);
      res.status(400).json({ message: err?.message || "Invalid input" });
    }
  });

  app.get(api.jobs.listByEmployer.path, isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const user = await storage.getUser(userId);
    
    if (!user || (user.role !== 'employer' && user.role !== 'agent' && user.role !== 'admin')) {
      return res.status(403).json({ message: "Only employers and agents can access this" });
    }

    await storage.expireOverdueJobs();
    let jobsList = await storage.getJobsByEmployer(userId);
    if (user.role === 'agent') {
      const agentJobs = await db.select().from(jobs).where(eq(jobs.agentId, userId)).orderBy(desc(jobs.createdAt));
      const existingIds = new Set(jobsList.map(j => j.id));
      for (const j of agentJobs) {
        if (!existingIds.has(j.id)) jobsList.push(j);
      }
    }
    res.json(jobsList);
  });

  // === APPLICATIONS ===
  app.post(api.applications.create.path, isAuthenticated, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);

    const applicantMissing: string[] = [];
    if (!user?.firstName?.trim()) applicantMissing.push("First name");
    if (!user?.lastName?.trim()) applicantMissing.push("Last name");
    if (!user?.phone?.trim()) applicantMissing.push("Phone number");
    if (!user?.gender?.trim()) applicantMissing.push("Gender");
    if (!user?.age || user.age < 18) applicantMissing.push("Age (must be 18+)");
    if (!user?.state?.trim()) applicantMissing.push("State");
    if (applicantMissing.length > 0) {
      return res.status(403).json({
        message: `Please complete your profile before applying for jobs. Missing: ${applicantMissing.join(", ")}.`,
        code: "PROFILE_INCOMPLETE",
        missingFields: applicantMissing,
      });
    }
    try {
      const input = api.applications.create.input.parse({
        ...req.body,
        applicantId: user.id
      });
      const app = await storage.createApplication(input);
      logActivity({ req, action: "apply_job", category: "applications", description: `Applicant applied to job #${req.body.jobId}`, targetType: "application", targetId: String(app.id) });
      res.status(201).json(app);

      const jobForEmail = await storage.getJob(req.body.jobId);
      if (jobForEmail) {
        const employer = await storage.getUser(jobForEmail.employerId);
        const applicantName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Applicant";
        const companyName = employer?.companyName || `${employer?.firstName || ""} ${employer?.lastName || ""}`.trim() || "Employer";

        storage.createNotification({
          title: "New Application Received",
          message: `${applicantName} applied for your job "${jobForEmail.title}".`,
          type: "individual",
          targetRole: null,
          targetUserId: jobForEmail.employerId,
          createdBy: user.id,
        }).catch(() => {});

        if (user.email) {
          sendApplicationReceivedEmail(user.email!, applicantName, jobForEmail.title, companyName).catch(() => {});
        }
        if (employer?.email) {
          sendNewApplicationNotifyEmployer(employer.email, companyName, applicantName, jobForEmail.title).catch(() => {});
        }
      }
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({
           message: err.errors[0].message,
           field: err.errors[0].path.join('.')
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.applications.listForJob.path, isAuthenticated, async (req, res) => {
    const jobId = Number(req.params.jobId);
    if (isNaN(jobId)) return res.status(400).json({ message: "Invalid job ID" });
    const job = await storage.getJob(jobId);
    const userId = req.session.userId!;

    if (!job) return res.status(404).json({ message: "Job not found" });
    const user = await storage.getUser(userId);
    const isOwner = job.employerId === userId || job.agentId === userId;
    if (!isOwner && user?.role !== 'admin') return res.status(403).json({ message: "Forbidden" });

    const restrictFreeApplicants = (await getSettingValue("restrict_free_employer_management")) === "true";
    if (restrictFreeApplicants && user?.role === 'employer' && user.subscriptionStatus === "free") {
      return res.status(403).json({ message: "Please upgrade your subscription to manage job applicants.", code: "SUBSCRIPTION_REQUIRED" });
    }

    const hideUnverified = (await getSettingValue("hide_unverified_details")) === "true";
    const apps = await storage.getApplicationsForJob(jobId);
    const enriched = await Promise.all(apps.map(async (app) => {
      const applicant = await storage.getUser(app.applicantId);
      const isApplicantVerified = applicant?.isVerified || false;
      const showDetails = isApplicantVerified || !hideUnverified;
      const offer = await storage.getOfferByApplication(app.id);
      return {
        ...app,
        applicantName: applicant ? `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim() : 'Unknown',
        applicantEmail: showDetails ? (applicant?.email || null) : null,
        applicantPhone: showDetails ? (applicant?.phone || null) : null,
        applicantProfileImageUrl: applicant?.profileImageUrl || null,
        applicantCvUrl: showDetails ? (applicant?.cvUrl || null) : null,
        applicantGender: applicant?.gender || null,
        applicantAge: applicant?.age || null,
        applicantIsVerified: isApplicantVerified,
        offer: offer || null,
      };
    }));
    enriched.sort((a, b) => {
      if (a.applicantIsVerified && !b.applicantIsVerified) return -1;
      if (!a.applicantIsVerified && b.applicantIsVerified) return 1;
      return 0;
    });
    res.json(enriched);
  });

  app.get(api.applications.listForApplicant.path, isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const apps = await storage.getApplicationsForApplicant(userId);
    
    const enriched = await Promise.all(apps.map(async (app) => {
      const job = await storage.getJob(app.jobId);
      const employer = job ? await storage.getUser(job.employerId) : null;
      const offer = await storage.getOfferByApplication(app.id);
      return {
        ...app,
        jobTitle: job?.title || "Unknown Job",
        jobLocation: job?.location || "",
        jobType: job?.jobType || "",
        jobCategory: job?.category || "",
        employerName: employer?.companyName || `${employer?.firstName || ""} ${employer?.lastName || ""}`.trim(),
        employerLogo: employer?.companyLogo || null,
        offer: offer || null,
      };
    }));
    
    res.json(enriched);
  });

  app.get(api.applications.get.path, isAuthenticated, async (req, res) => {
    const appId = Number(req.params.id);
    if (isNaN(appId)) return res.status(400).json({ message: "Invalid application ID" });
    const application = await storage.getApplication(appId);
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.json(application);
  });

  app.patch(api.applications.updateStatus.path, isAuthenticated, async (req, res) => {
    const appId = Number(req.params.id);
    if (isNaN(appId)) return res.status(400).json({ message: "Invalid application ID" });
    const application = await storage.getApplication(appId);
    if (!application) return res.status(404).json({ message: "Application not found" });

    const userId = req.session.userId!;
    const currentUser = await storage.getUser(userId);
    const job = await storage.getJob(application.jobId);
    
    const isJobOwner = job && (job.employerId === userId || job.agentId === userId);
    if (!job || (!isJobOwner && currentUser?.role !== 'admin')) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const restrictFreeStatus = (await getSettingValue("restrict_free_employer_management")) === "true";
    if (restrictFreeStatus && currentUser?.role === 'employer' && currentUser.subscriptionStatus === "free") {
      return res.status(403).json({ message: "Please upgrade your subscription to manage applicants.", code: "SUBSCRIPTION_REQUIRED" });
    }

    try {
      const input = api.applications.updateStatus.input.parse(req.body);
      const updatedApp = await storage.updateApplicationStatus(appId, input.status);
      logActivity({ req, action: `application_${input.status}`, category: "applications", description: `Application #${appId} status changed to ${input.status}`, targetType: "application", targetId: String(appId) });
      res.json(updatedApp);

      const applicant = await storage.getUser(application.applicantId);
      if (applicant && job) {
        const employer = await storage.getUser(job.employerId);
        const companyName = employer?.companyName || `${employer?.firstName || ""} ${employer?.lastName || ""}`.trim() || "Employer";
        const applicantName = `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim() || "Applicant";

        const statusLabels: Record<string, string> = {
          shortlisted: "Shortlisted",
          rejected: "Rejected",
          accepted: "Accepted",
          pending: "Pending",
        };
        const statusLabel = statusLabels[input.status] || input.status;

        storage.createNotification({
          title: `Application ${statusLabel}`,
          message: `Your application for "${job.title}" has been ${statusLabel.toLowerCase()} by ${companyName}.`,
          type: "individual",
          targetRole: null,
          targetUserId: application.applicantId,
          createdBy: userId,
        }).catch(() => {});

        if (applicant.email) {
          sendApplicationStatusEmail(applicant.email, applicantName, job.title, input.status, companyName).catch(() => {});
        }
      }
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch("/api/applications/:id/admin-review", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const currentUser = await storage.getUser(userId);
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ message: "Only admins can submit reviews" });
    }

    const appId = Number(req.params.id);
    if (isNaN(appId)) return res.status(400).json({ message: "Invalid application ID" });

    const application = await storage.getApplication(appId);
    if (!application) return res.status(404).json({ message: "Application not found" });

    const interview = await storage.getInterviewByApplication(appId);
    if (!interview || interview.status !== "completed") {
      return res.status(400).json({ message: "Interview must be completed before submitting an assessment" });
    }

    const { rating, note } = req.body;
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (!note || typeof note !== "string" || note.trim().length === 0) {
      return res.status(400).json({ message: "Review note is required" });
    }

    try {
      const updated = await storage.updateApplicationAdminReview(appId, rating, note.trim(), userId);

      const job = await storage.getJob(application.jobId);
      const applicant = await storage.getUser(application.applicantId);
      const applicantName = `${applicant?.firstName || ""} ${applicant?.lastName || ""}`.trim() || "Applicant";
      if (job) {
        storage.createNotification({
          title: "Iṣéyá Assessment Ready",
          message: `The Iṣéyá team has completed their assessment of ${applicantName} for your job "${job.title}". Check the recommendations for details.`,
          type: "individual",
          targetRole: null,
          targetUserId: job.employerId,
          createdBy: userId,
        }).catch(() => {});
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to save admin review" });
    }
  });

  // Cancel/withdraw application (applicant - requires verification)
  app.delete("/api/applications/:id", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const appId = Number(req.params.id);
    if (isNaN(appId)) return res.status(400).json({ message: "Invalid application ID" });

    const currentUser = await storage.getUser(userId);
    if (currentUser && currentUser.role === "applicant" && !currentUser.isVerified) {
      return res.status(403).json({ message: "Please get verified to manage your applications.", code: "VERIFICATION_REQUIRED" });
    }

    const application = await storage.getApplication(appId);
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.applicantId !== userId) return res.status(403).json({ message: "Not authorized" });
    if (application.status === "accepted") return res.status(400).json({ message: "Cannot cancel an accepted application" });

    const jobForNotif = await storage.getJob(application.jobId);
    await storage.deleteApplication(appId, userId);
    res.status(204).send();

    if (jobForNotif) {
      const applicantUser = await storage.getUser(userId);
      const applicantName = `${applicantUser?.firstName || ""} ${applicantUser?.lastName || ""}`.trim() || "Applicant";
      storage.createNotification({
        title: "Application Withdrawn",
        message: `${applicantName} has withdrawn their application for "${jobForNotif.title}".`,
        type: "individual",
        targetRole: null,
        targetUserId: jobForNotif.employerId,
        createdBy: userId,
      }).catch(() => {});
    }
  });

  // === ADMIN ROUTES ===
  
  // Middleware to check admin permissions
  const isAdmin = async (req: any, res: any, next: any) => {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    
    const user = await storage.getUser(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    req.adminUser = user;
    req.adminPermissions = await storage.getAdminPermissions(userId);
    next();
  };

  // Admin stats
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canViewStats) {
      return res.status(403).json({ message: "You don't have permission to view stats" });
    }
    const stats = await storage.getStats();
    res.json(stats);
  });

  // Admin users management
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageUsers && !req.adminPermissions.canViewStats) {
      return res.status(403).json({ message: "You don't have permission to view users" });
    }
    const { role, search } = req.query;
    const users = await storage.getAllUsers({ 
      role: role as string, 
      search: search as string 
    });
    res.json(users);
  });

  app.get("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageUsers && !req.adminPermissions.canViewStats) {
      return res.status(403).json({ message: "You don't have permission to view users" });
    }
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageUsers) {
      return res.status(403).json({ message: "You don't have permission to manage users" });
    }
    try {
      const input = adminUpdateUserSchema.parse(req.body);
      const updates: Record<string, any> = { ...input };
      if (input.isSuspended === true) {
        updates.suspendedAt = new Date();
      } else if (input.isSuspended === false) {
        updates.suspendedAt = null;
        updates.suspendedReason = null;
      }
      if (input.subscriptionEndDate) {
        updates.subscriptionEndDate = new Date(input.subscriptionEndDate);
      } else if (input.subscriptionEndDate === null) {
        updates.subscriptionEndDate = null;
      }
      const user = await storage.updateUser(req.params.id, updates);
      const actions: string[] = [];
      if (input.isSuspended === true) actions.push("suspended");
      if (input.isSuspended === false) actions.push("unsuspended");
      if (input.role) actions.push(`role changed to ${input.role}`);
      if (input.subscriptionTier) actions.push(`subscription changed to ${input.subscriptionTier}`);
      const desc = actions.length > 0 ? actions.join(", ") : "updated profile";
      logActivity({ req, action: "update_user", category: "users", description: `Admin ${desc} user: ${user?.email || req.params.id}`, targetType: "user", targetId: req.params.id, metadata: input });
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageUsers) {
      return res.status(403).json({ message: "You don't have permission to manage users" });
    }
    try {
      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) return res.status(404).json({ message: "User not found" });
      if (targetUser.id === req.adminUser.id) {
        return res.status(400).json({ message: "You cannot delete your own account" });
      }
      await storage.deleteUser(req.params.id);
      logActivity({ req, action: "delete_user", category: "users", description: `Admin deleted user: ${targetUser.email || req.params.id}`, targetType: "user", targetId: req.params.id });
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      console.error("Delete user error:", err);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.post("/api/admin/users/:id/temp-password", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageUsers) {
      return res.status(403).json({ message: "You don't have permission to manage users" });
    }
    try {
      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) return res.status(404).json({ message: "User not found" });
      if (targetUser.role === "admin") {
        return res.status(400).json({ message: "Cannot generate temporary passwords for admin accounts" });
      }

      const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
      let tempPlaintext = "";
      for (let i = 0; i < 12; i++) {
        tempPlaintext += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const hashedTemp = await bcrypt.hash(tempPlaintext, 10);
      const expiry = new Date(Date.now() + 30 * 60 * 1000);

      await db.update(users)
        .set({ tempPassword: hashedTemp, tempPasswordExpiry: expiry })
        .where(eq(users.id, req.params.id));

      res.json({
        tempPassword: tempPlaintext,
        expiresAt: expiry.toISOString(),
        userEmail: targetUser.email,
        userName: `${targetUser.firstName || ""} ${targetUser.lastName || ""}`.trim(),
      });
    } catch (err) {
      console.error("Generate temp password error:", err);
      res.status(500).json({ message: "Failed to generate temporary password" });
    }
  });

  // Admin jobs management
  app.get("/api/admin/jobs", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageJobs && !req.adminPermissions.canViewStats) {
      return res.status(403).json({ message: "You don't have permission to view jobs" });
    }
    const jobs = await storage.getAllJobs();
    const enriched = await Promise.all(jobs.map(async (job) => {
      const apps = await storage.getApplicationsForJob(job.id);
      return {
        ...job,
        applicationCounts: {
          total: apps.length,
          pending: apps.filter(a => a.status === "pending").length,
          offered: apps.filter(a => a.status === "offered").length,
          accepted: apps.filter(a => a.status === "accepted").length,
          rejected: apps.filter(a => a.status === "rejected").length,
        },
      };
    }));
    res.json(enriched);
  });

  app.patch("/api/admin/jobs/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageJobs) {
      return res.status(403).json({ message: "You don't have permission to manage jobs" });
    }
    const jobId = Number(req.params.id);
    if (isNaN(jobId)) return res.status(400).json({ message: "Invalid job ID" });
    try {
      const input = adminUpdateJobSchema.parse(req.body);
      const updateData: any = { ...input };
      if (updateData.deadline !== undefined) {
        updateData.deadline = updateData.deadline ? new Date(updateData.deadline) : null;
      }
      const job = await storage.updateJob(jobId, updateData);
      logActivity({ req, action: "update_job", category: "jobs", description: `Admin updated job #${jobId}: ${job.title}`, targetType: "job", targetId: String(jobId), metadata: updateData });
      res.json(job);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("[admin] Failed to update job:", err);
      res.status(400).json({ message: "Failed to update job" });
    }
  });

  app.delete("/api/admin/jobs/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageJobs) {
      return res.status(403).json({ message: "You don't have permission to delete jobs" });
    }
    const jobId = Number(req.params.id);
    if (isNaN(jobId)) return res.status(400).json({ message: "Invalid job ID" });
    try {
      await storage.deleteJob(jobId);
      logActivity({ req, action: "delete_job", category: "jobs", description: `Admin deleted job #${jobId}`, targetType: "job", targetId: String(jobId) });
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ message: "Failed to delete job" });
    }
  });

  // Admin applications management
  app.get("/api/admin/applications", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageApplications && !req.adminPermissions.canViewStats) {
      return res.status(403).json({ message: "You don't have permission to view applications" });
    }
    const applications = await storage.getAllApplications();
    res.json(applications);
  });

  // Sub-admin management
  app.get("/api/admin/admins", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageAdmins) {
      return res.status(403).json({ message: "You don't have permission to manage admins" });
    }
    const admins = await storage.getAllAdmins();
    res.json(admins);
  });

  app.post("/api/admin/admins", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageAdmins) {
      return res.status(403).json({ message: "You don't have permission to create admins" });
    }
    
    try {
      const input = createSubAdminSchema.parse(req.body);
      
      // Update user role to admin
      await storage.updateUser(input.userId, { role: 'admin' });
      
      // Create permissions with defaults
      const adminPerms = await storage.createAdminPermissions({
        userId: input.userId,
        createdBy: req.adminUser.id,
        canManageUsers: input.permissions.canManageUsers ?? false,
        canManageJobs: input.permissions.canManageJobs ?? false,
        canManageApplications: input.permissions.canManageApplications ?? false,
        canManageAdmins: input.permissions.canManageAdmins ?? false,
        canViewStats: input.permissions.canViewStats ?? true,
        canManageSubscriptions: input.permissions.canManageSubscriptions ?? false,
        canManageTransactions: input.permissions.canManageTransactions ?? false,
        canManageTickets: input.permissions.canManageTickets ?? false,
        canManageReports: input.permissions.canManageReports ?? false,
        canManageVerifications: input.permissions.canManageVerifications ?? false,
        canManageNotifications: input.permissions.canManageNotifications ?? false,
        canManageAutomatedEmails: input.permissions.canManageAutomatedEmails ?? false,
        canManageAds: input.permissions.canManageAds ?? false,
        canManageAgentCredits: input.permissions.canManageAgentCredits ?? false,
        canManageSettings: input.permissions.canManageSettings ?? false,
        canManageActivityLogs: input.permissions.canManageActivityLogs ?? false,
      });
      
      res.status(201).json(adminPerms);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: "Failed to create admin" });
    }
  });

  app.post("/api/admin/admins/create-new", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageAdmins) {
      return res.status(403).json({ message: "You don't have permission to create admins" });
    }

    try {
      const input = createNewAdminSchema.parse(req.body);

      const [existing] = await db.select().from(users).where(eq(users.email, input.email));
      if (existing) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const [newUser] = await db.insert(users).values({
        email: input.email,
        password: hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName,
        role: "admin",
      }).returning();

      const adminPerms = await storage.createAdminPermissions({
        userId: newUser.id,
        createdBy: req.adminUser.id,
        canManageUsers: input.permissions.canManageUsers ?? false,
        canManageJobs: input.permissions.canManageJobs ?? false,
        canManageApplications: input.permissions.canManageApplications ?? false,
        canManageAdmins: input.permissions.canManageAdmins ?? false,
        canViewStats: input.permissions.canViewStats ?? true,
        canManageSubscriptions: input.permissions.canManageSubscriptions ?? false,
        canManageTransactions: input.permissions.canManageTransactions ?? false,
        canManageTickets: input.permissions.canManageTickets ?? false,
        canManageReports: input.permissions.canManageReports ?? false,
        canManageVerifications: input.permissions.canManageVerifications ?? false,
        canManageNotifications: input.permissions.canManageNotifications ?? false,
        canManageAutomatedEmails: input.permissions.canManageAutomatedEmails ?? false,
        canManageAds: input.permissions.canManageAds ?? false,
        canManageAgentCredits: input.permissions.canManageAgentCredits ?? false,
        canManageSettings: input.permissions.canManageSettings ?? false,
        canManageActivityLogs: input.permissions.canManageActivityLogs ?? false,
      });

      res.status(201).json(adminPerms);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Create new admin error:", err);
      res.status(400).json({ message: "Failed to create admin account" });
    }
  });

  app.patch("/api/admin/admins/:userId/permissions", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageAdmins) {
      return res.status(403).json({ message: "You don't have permission to update admin permissions" });
    }
    
    try {
      const input = updateAdminPermissionsSchema.parse(req.body);
      const perms = await storage.updateAdminPermissions(req.params.userId, input);
      res.json(perms);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: "Failed to update permissions" });
    }
  });

  app.delete("/api/admin/admins/:userId", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageAdmins) {
      return res.status(403).json({ message: "You don't have permission to remove admins" });
    }
    
    try {
      // Remove admin permissions
      await storage.deleteAdminPermissions(req.params.userId);
      // Downgrade to applicant role
      await storage.updateUser(req.params.userId, { role: 'applicant' });
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ message: "Failed to remove admin" });
    }
  });

  // Get current user's admin permissions
  app.get("/api/admin/my-permissions", isAuthenticated, isAdmin, async (req: any, res) => {
    res.json(req.adminPermissions || {
      canManageUsers: true,
      canManageJobs: true,
      canManageApplications: true,
      canManageAdmins: true,
      canViewStats: true,
      canManageSubscriptions: true,
      canManageTransactions: true,
      canManageTickets: true,
      canManageReports: true,
      canManageVerifications: true,
      canManageNotifications: true,
      canManageAutomatedEmails: true,
      canManageAds: true,
      canManageAgentCredits: true,
      canManageSettings: true,
    });
  });

  // Detailed stats for admin dashboard
  app.get("/api/admin/stats/detailed", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canViewStats) {
      return res.status(403).json({ message: "You don't have permission to view stats" });
    }
    const stats = await storage.getDetailedStats();
    res.json(stats);
  });

  // === CONTACT FORM (PUBLIC) ===

  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email address" });
      }

      const ticket = await storage.createTicket({
        userId: null,
        subject,
        description: message,
        category: "contact",
        priority: "medium",
        status: "open",
        isExternal: true,
        externalName: name,
        externalEmail: email,
      });

      await storage.createTicketMessage({
        ticketId: ticket.id,
        senderId: null,
        senderRole: "external",
        message,
        attachmentUrl: null,
        attachmentName: null,
        isRead: false,
      });

      res.status(201).json({ success: true, ticketId: ticket.id });

      sendContactFormAcknowledgement(email, name, ticket.id, subject).catch(() => {});

      const admins = await storage.getAllUsers({ role: "admin" });
      const primaryAdmin = admins.find(a => a.email === "bekinsmart@gmail.com") || admins[0];
      if (primaryAdmin?.email) {
        sendTicketAdminNotifyEmail(
          primaryAdmin.email,
          `${primaryAdmin.firstName || ""} ${primaryAdmin.lastName || ""}`.trim() || "Admin",
          ticket.id,
          subject,
          name,
          "contact",
          "medium"
        ).catch(() => {});
      }

      storage.createNotification({
        title: "New Contact Form Submission",
        message: `${name} (${email}) submitted a contact form: "${subject}".`,
        type: "role",
        targetRole: "admin",
        targetUserId: null,
        createdBy: primaryAdmin?.id || "system",
      }).catch((e) => console.error("Failed to create contact notification:", e));
    } catch (err) {
      console.error("Contact form error:", err);
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  // === INBOUND EMAIL WEBHOOK (support@iseya.ng) ===

  app.post("/api/webhooks/inbound-email", async (req, res) => {
    try {
      // Shared-secret authentication. Configure INBOUND_EMAIL_SECRET env var
      // and pass the same value from your inbound-email forwarder via either:
      //   - Header:  X-Webhook-Secret: <secret>
      //   - Bearer:  Authorization: Bearer <secret>
      //   - Query:   ?secret=<secret>
      const expected = process.env.INBOUND_EMAIL_SECRET;
      if (!expected) {
        console.error("[inbound-email] INBOUND_EMAIL_SECRET is not configured; rejecting request");
        return res.status(503).json({ message: "Inbound email is not configured" });
      }
      const headerSecret =
        (req.header("x-webhook-secret") || "").trim() ||
        (req.header("authorization") || "").replace(/^Bearer\s+/i, "").trim();
      const querySecret = typeof req.query.secret === "string" ? req.query.secret : "";
      const provided = headerSecret || querySecret;
      if (!provided || provided !== expected) {
        console.warn("[inbound-email] Rejected request: invalid or missing secret");
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { from, subject, text, html } = req.body;

      if (!from || !subject) {
        return res.status(400).json({ message: "Missing required email fields" });
      }

      let senderEmail = "";
      let senderName = "";

      if (typeof from === "string") {
        const emailMatch = from.match(/<([^>]+)>/);
        senderEmail = emailMatch ? emailMatch[1] : from.trim();
        const nameMatch = from.match(/^([^<]+)/);
        senderName = nameMatch ? nameMatch[1].trim().replace(/^"|"$/g, "") : senderEmail.split("@")[0];
      } else if (typeof from === "object") {
        senderEmail = from.address || from.email || "";
        senderName = from.name || senderEmail.split("@")[0];
      }

      if (!senderEmail) {
        return res.status(400).json({ message: "Could not parse sender email" });
      }

      const messageBody = text || (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "No message content");

      const ticketRefMatch = subject.match(/Ref\s*#(\d+)/i);
      const existingTicketId = ticketRefMatch ? parseInt(ticketRefMatch[1], 10) : null;

      if (existingTicketId) {
        const existingTicket = await storage.getTicket(existingTicketId);
        if (existingTicket && existingTicket.isExternal && existingTicket.externalEmail?.toLowerCase() === senderEmail.toLowerCase()) {
          await storage.createTicketMessage({
            ticketId: existingTicketId,
            senderId: null,
            senderRole: "external",
            message: messageBody,
            attachmentUrl: null,
            attachmentName: null,
            isRead: false,
          });

          if (existingTicket.status === "resolved" || existingTicket.status === "closed") {
            await storage.updateTicket(existingTicketId, { status: "open" });
          }

          const admins = await storage.getAllUsers({ role: "admin" });
          const primaryAdmin = admins.find(a => a.email === "bekinsmart@gmail.com") || admins[0];
          if (primaryAdmin) {
            storage.createNotification({
              title: "New Email Reply on Ticket",
              message: `${senderName} (${senderEmail}) replied to ticket #${existingTicketId}: "${existingTicket.subject}".`,
              type: "role",
              targetRole: "admin",
              targetUserId: null,
              createdBy: primaryAdmin.id || "system",
            }).catch((e) => console.error("Inbound email notification error:", e));
          }

          console.log(`[inbound-email] Reply added to ticket #${existingTicketId} from ${senderEmail}`);
          return res.status(200).json({ success: true, action: "reply", ticketId: existingTicketId });
        }
      }

      const cleanSubject = subject.replace(/^(Re:|Fwd?:)\s*/gi, "").trim() || "Email Support Request";

      const ticket = await storage.createTicket({
        userId: null,
        subject: cleanSubject,
        description: messageBody,
        category: "email",
        priority: "medium",
        status: "open",
        isExternal: true,
        externalName: senderName,
        externalEmail: senderEmail,
      });

      await storage.createTicketMessage({
        ticketId: ticket.id,
        senderId: null,
        senderRole: "external",
        message: messageBody,
        attachmentUrl: null,
        attachmentName: null,
        isRead: false,
      });

      sendContactFormAcknowledgement(senderEmail, senderName, ticket.id, cleanSubject).catch(() => {});

      const admins = await storage.getAllUsers({ role: "admin" });
      const primaryAdmin = admins.find(a => a.email === "bekinsmart@gmail.com") || admins[0];
      if (primaryAdmin?.email) {
        sendTicketAdminNotifyEmail(
          primaryAdmin.email,
          `${primaryAdmin.firstName || ""} ${primaryAdmin.lastName || ""}`.trim() || "Admin",
          ticket.id,
          cleanSubject,
          senderName,
          "email",
          "medium"
        ).catch(() => {});
      }

      storage.createNotification({
        title: "New Email Support Ticket",
        message: `${senderName} (${senderEmail}) sent an email to support: "${cleanSubject}".`,
        type: "role",
        targetRole: "admin",
        targetUserId: null,
        createdBy: primaryAdmin?.id || "system",
      }).catch((e) => console.error("Inbound email notification error:", e));

      console.log(`[inbound-email] New ticket #${ticket.id} created from ${senderEmail}`);
      res.status(200).json({ success: true, action: "created", ticketId: ticket.id });
    } catch (err) {
      console.error("Inbound email webhook error:", err);
      res.status(500).json({ message: "Failed to process inbound email" });
    }
  });

  // === TICKETS ===
  
  // Create a support ticket (any authenticated user)
  app.post("/api/tickets", isAuthenticated, uploadTicketAttachment.single("attachment"), async (req, res) => {
    const userId = req.session.userId!;
    try {
      const input = insertTicketSchema.parse({
        ...req.body,
        userId,
        status: "open",
        priority: req.body.priority || "medium",
      });
      const ticket = await storage.createTicket(input);

      if (req.file) {
        const attachmentUrl = `/uploads/tickets/${req.file.filename}`;
        const attachmentName = req.file.originalname;
        storeFileInDb(attachmentUrl, req.file.path).catch(() => {});
        const user = await storage.getUser(userId);
        const senderRole = user?.role === "admin" ? "admin" : "user";
        await storage.createTicketMessage({
          ticketId: ticket.id,
          senderId: userId,
          senderRole,
          message: `Attached: ${attachmentName}`,
          attachmentUrl,
          attachmentName,
          isRead: false,
        });
      }

      res.status(201).json(ticket);

      const ticketUser = await storage.getUser(userId);
      if (ticketUser?.email) {
        const userName = `${ticketUser.firstName || ""} ${ticketUser.lastName || ""}`.trim() || "User";
        sendTicketCreatedEmail(
          ticketUser.email,
          userName,
          ticket.id,
          ticket.subject,
          ticket.category || "general",
          ticket.priority || "medium"
        ).catch(() => {});

        const admins = await storage.getAllUsers({ role: "admin" });
        const primaryAdmin = admins.find(a => a.email === "bekinsmart@gmail.com") || admins[0];
        if (primaryAdmin?.email) {
          sendTicketAdminNotifyEmail(
            primaryAdmin.email,
            `${primaryAdmin.firstName || ""} ${primaryAdmin.lastName || ""}`.trim() || "Admin",
            ticket.id,
            ticket.subject,
            userName,
            ticket.category || "general",
            ticket.priority || "medium"
          ).catch(() => {});
        }

        storage.createNotification({
          title: "Ticket Submitted",
          message: `Your support ticket "#${ticket.id}: ${ticket.subject}" has been submitted. We'll get back to you soon.`,
          type: "individual",
          targetRole: null,
          targetUserId: userId,
          createdBy: userId,
        }).catch((e) => console.error("Failed to create user ticket notification:", e));

        storage.createNotification({
          title: "New Support Ticket",
          message: `${userName} submitted a new support ticket "#${ticket.id}: ${ticket.subject}" (${ticket.priority} priority).`,
          type: "role",
          targetRole: "admin",
          targetUserId: null,
          createdBy: userId,
        }).catch((e) => console.error("Failed to create admin ticket notification:", e));
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create ticket" });
    }
  });

  // Get user's own tickets
  app.get("/api/tickets/my", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const tickets = await storage.getTicketsByUser(userId);
    res.json(tickets);
  });

  // Get unread message counts for user's tickets
  app.get("/api/tickets/unread-counts", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const user = await storage.getUser(userId);
    const role = user?.role === "admin" ? "admin" : "user";
    const counts = await storage.getTicketsWithUnreadCounts(userId, role);
    res.json(counts);
  });

  // Get messages for a ticket (user must own the ticket)
  app.get("/api/tickets/:id/messages", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const ticketId = Number(req.params.id);
    if (isNaN(ticketId)) return res.status(400).json({ message: "Invalid ticket ID" });
    const ticket = await storage.getTicket(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    const user = await storage.getUser(userId);
    if (ticket.userId !== userId && user?.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    const readerRole = user?.role === "admin" ? "admin" : "user";
    await storage.markTicketMessagesRead(ticketId, readerRole);
    const messages = await storage.getTicketMessages(ticketId);
    res.json(messages);
  });

  // Post a message to a ticket (user must own the ticket)
  app.post("/api/tickets/:id/messages", isAuthenticated, uploadTicketAttachment.single("attachment"), async (req, res) => {
    const userId = req.session.userId!;
    const ticketId = Number(req.params.id);
    if (isNaN(ticketId)) return res.status(400).json({ message: "Invalid ticket ID" });
    const ticket = await storage.getTicket(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    const user = await storage.getUser(userId);
    if (ticket.userId !== userId && user?.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    const message = req.body.message?.trim() || "";
    const attachmentUrl = req.file ? `/uploads/tickets/${req.file.filename}` : null;
    const attachmentName = req.file ? req.file.originalname : null;
    if (req.file) storeFileInDb(attachmentUrl!, req.file.path).catch(() => {});
    if (!message && !attachmentUrl) {
      return res.status(400).json({ message: "Message or attachment is required" });
    }
    const senderRole = user?.role === "admin" ? "admin" : "user";
    const created = await storage.createTicketMessage({
      ticketId,
      senderId: userId,
      senderRole,
      message: message || (attachmentName ? `Attached: ${attachmentName}` : ""),
      attachmentUrl,
      attachmentName,
      isRead: false,
    });
    res.status(201).json(created);

    const senderName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";
    if (senderRole === "admin") {
      if (ticket.isExternal && ticket.externalEmail) {
        sendTicketReplyEmail(
          ticket.externalEmail,
          ticket.externalName || "Customer",
          ticket.id,
          ticket.subject,
          message
        ).catch((e) => console.error("Failed to send external ticket reply email:", e));
      } else if (ticket.userId) {
        storage.createNotification({
          title: "New Reply on Ticket",
          message: `Admin replied to your ticket "#${ticket.id}: ${ticket.subject}".`,
          type: "individual",
          targetRole: null,
          targetUserId: ticket.userId,
          createdBy: userId,
        }).catch((e) => console.error("Ticket message notification error:", e));

        const ticketOwner = await storage.getUser(ticket.userId);
        if (ticketOwner?.email) {
          sendTicketReplyEmail(
            ticketOwner.email,
            `${ticketOwner.firstName || ""} ${ticketOwner.lastName || ""}`.trim() || "User",
            ticket.id,
            ticket.subject,
            message
          ).catch((e) => console.error("Failed to send ticket reply email:", e));
        }
      }
    } else {
      storage.createNotification({
        title: "New Ticket Reply",
        message: `${senderName} replied to ticket "#${ticket.id}: ${ticket.subject}".`,
        type: "role",
        targetRole: "admin",
        targetUserId: null,
        createdBy: userId,
      }).catch((e) => console.error("Ticket message notification error:", e));
    }
  });

  // Admin: Get all tickets
  app.get("/api/admin/tickets", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageTickets) {
      return res.status(403).json({ message: "You do not have permission to manage tickets" });
    }
    const { status, priority } = req.query;
    const tickets = await storage.getAllTickets({ 
      status: status as string, 
      priority: priority as string 
    });
    res.json(tickets);
  });

  // Admin: Get single ticket
  app.get("/api/admin/tickets/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageTickets) {
      return res.status(403).json({ message: "You do not have permission to manage tickets" });
    }
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ticket ID" });
    const ticket = await storage.getTicket(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  });

  // Admin: Update ticket
  app.patch("/api/admin/tickets/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageTickets) {
      return res.status(403).json({ message: "You do not have permission to manage tickets" });
    }
    const ticketId = Number(req.params.id);
    if (isNaN(ticketId)) return res.status(400).json({ message: "Invalid ticket ID" });
    try {
      const input = adminUpdateTicketSchema.parse(req.body);
      const ticket = await storage.updateTicket(ticketId, input);
      res.json(ticket);

      if (ticket?.userId) {
        const adminUserId = req.session.userId!;
        const statusLabel = input.status ? `Status updated to "${input.status}"` : "";
        const notesLabel = input.adminNotes ? "Admin added a response" : "";
        const detail = [statusLabel, notesLabel].filter(Boolean).join(". ");
        storage.createNotification({
          title: "Ticket Updated",
          message: `Your support ticket "#${ticket.id}: ${ticket.subject}" has been updated. ${detail}`,
          type: "individual",
          targetRole: null,
          targetUserId: ticket.userId,
          createdBy: adminUserId,
        }).catch((e) => console.error("Failed to create ticket update notification:", e));
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: "Failed to update ticket" });
    }
  });

  // === REPORTS ===

  // Create a report (any authenticated user)
  app.post("/api/reports", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    try {
      const input = insertReportSchema.parse({
        ...req.body,
        reporterId: userId,
        status: "pending",
      });
      const report = await storage.createReport(input);
      res.status(201).json(report);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // Admin: Get all reports
  app.get("/api/admin/reports", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageReports) {
      return res.status(403).json({ message: "You do not have permission to manage reports" });
    }
    const { status, type } = req.query;
    const reports = await storage.getAllReports({ 
      status: status as string, 
      type: type as string 
    });
    res.json(reports);
  });

  // Admin: Get single report
  app.get("/api/admin/reports/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageReports) {
      return res.status(403).json({ message: "You do not have permission to manage reports" });
    }
    const reportId = Number(req.params.id);
    if (isNaN(reportId)) return res.status(400).json({ message: "Invalid report ID" });
    const report = await storage.getReport(reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  });

  // Admin: Update report
  app.patch("/api/admin/reports/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageReports) {
      return res.status(403).json({ message: "You do not have permission to manage reports" });
    }
    const reportId = Number(req.params.id);
    if (isNaN(reportId)) return res.status(400).json({ message: "Invalid report ID" });
    try {
      const input = adminUpdateReportSchema.parse(req.body);
      const report = await storage.updateReport(reportId, input);
      res.json(report);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: "Failed to update report" });
    }
  });

  // === FILE UPLOADS ===

  migrateExistingUploads().catch(err => console.error("[file-storage] Migration error:", err));
  restoreFilesFromDb().catch(err => console.error("[file-storage] Restore error:", err));

  app.use("/uploads", (await import("express")).default.static("uploads"));

  app.get("/uploads/*", async (req, res) => {
    const filePath = req.path;
    const file = await getFileFromDb(filePath);
    if (file) {
      res.set("Content-Type", file.mimeType);
      res.set("Cache-Control", "public, max-age=86400");
      return res.send(file.data);
    }
    res.status(404).json({ message: "File not found" });
  });

  app.get("/api/download/cv/:filename", isAuthenticated, async (req, res) => {
    const filename = req.params.filename;
    if (!/^[a-zA-Z0-9_\-]+\.\w+$/.test(filename)) {
      return res.status(400).json({ message: "Invalid filename" });
    }
    const filePath = path.resolve(process.cwd(), "uploads", "cv", filename);
    if (!filePath.startsWith(path.resolve(process.cwd(), "uploads", "cv"))) {
      return res.status(403).json({ message: "Access denied" });
    }
    const requestingUser = await storage.getUser(req.session.userId!);
    if (requestingUser?.role === "employer" || requestingUser?.role === "agent") {
      const hideUnverifiedCv = (await getSettingValue("hide_unverified_details")) === "true";
      if (hideUnverifiedCv) {
        const cvOwner = await storage.getUserByCvFilename(filename);
        if (cvOwner && !cvOwner.isVerified) {
          return res.status(403).json({ message: "Cannot download CV of unverified applicants" });
        }
      }
    }

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    const dbFile = await getFileFromDb(`/uploads/cv/${filename}`);
    if (dbFile) {
      res.set("Content-Type", dbFile.mimeType);
      return res.send(dbFile.data);
    }
    return res.status(404).json({ message: "File not found" });
  });

  app.post("/api/upload/cv", isAuthenticated, uploadCV.single("cv"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const userId = req.session.userId!;
    const filePath = `/uploads/cv/${req.file.filename}`;
    await storage.updateUser(userId, { cvUrl: filePath });
    storeFileInDb(filePath, req.file.path).catch(() => {});
    res.json({ url: filePath });
  });

  app.post("/api/upload/profile-picture", isAuthenticated, uploadProfile.single("picture"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const userId = req.session.userId!;
    const filePath = `/uploads/profile/${req.file.filename}`;
    await storage.updateUser(userId, { profileImageUrl: filePath });
    storeFileInDb(filePath, req.file.path).catch(() => {});
    res.json({ url: filePath });
  });

  app.post("/api/upload/company-logo", isAuthenticated, uploadLogo.single("logo"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const userId = req.session.userId!;
    const user = await storage.getUser(userId);
    if (user?.role !== "employer") return res.status(403).json({ message: "Only employers can upload a company logo" });
    const filePath = `/uploads/logo/${req.file.filename}`;
    await storage.updateUser(userId, { companyLogo: filePath });
    storeFileInDb(filePath, req.file.path).catch(() => {});
    res.json({ url: filePath });
  });

  // === APPLICANT PROFILE (for employer viewing - scoped to their job applicants) ===

  app.get("/api/profile/stats", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let jobCount = 0;
    let avgRating: number | null = null;

    if (user.role === "applicant") {
      const apps = await storage.getApplicationsForApplicant(userId);
      jobCount = apps.length;
      const rated = apps.filter(a => a.adminRating && a.adminRating > 0);
      if (rated.length > 0) {
        avgRating = Math.round((rated.reduce((sum, a) => sum + (a.adminRating || 0), 0) / rated.length) * 10) / 10;
      }
    } else if (user.role === "employer") {
      const employerJobs = await storage.getJobsByEmployer(userId);
      jobCount = employerJobs.length;
      let allRatings: number[] = [];
      for (const job of employerJobs) {
        const apps = await storage.getApplicationsForJob(job.id);
        for (const a of apps) {
          if (a.adminRating && a.adminRating > 0) allRatings.push(a.adminRating);
        }
      }
      if (allRatings.length > 0) {
        avgRating = Math.round((allRatings.reduce((s, r) => s + r, 0) / allRatings.length) * 10) / 10;
      }
    } else if (user.role === "agent") {
      const agentJobs = await db.select().from(jobs).where(eq(jobs.agentId, userId));
      jobCount = agentJobs.length;
      let allRatings: number[] = [];
      for (const job of agentJobs) {
        const apps = await storage.getApplicationsForJob(job.id);
        for (const a of apps) {
          if (a.adminRating && a.adminRating > 0) allRatings.push(a.adminRating);
        }
      }
      if (allRatings.length > 0) {
        avgRating = Math.round((allRatings.reduce((s, r) => s + r, 0) / allRatings.length) * 10) / 10;
      }
    }

    res.json({ jobCount, avgRating });
  });

  app.get("/api/applicant-profile/:applicantId", isAuthenticated, async (req, res) => {
    const viewerId = req.session.userId!;
    const viewer = await storage.getUser(viewerId);
    if (!viewer || (viewer.role !== "employer" && viewer.role !== "agent" && viewer.role !== "admin")) {
      return res.status(403).json({ message: "Only employers and agents can view applicant profiles" });
    }

    const applicantId = req.params.applicantId;

    if (viewer.role === "employer" || viewer.role === "agent") {
      const employerJobs = await storage.getJobsByEmployer(viewerId);
      let agentJobs: any[] = [];
      if (viewer.role === "agent") {
        agentJobs = await db.select().from(jobs).where(eq(jobs.agentId, viewerId));
      }
      const allJobs = [...employerJobs, ...agentJobs.filter(j => !employerJobs.some(ej => ej.id === j.id))];
      let hasApplied = false;
      for (const job of allJobs) {
        const apps = await storage.getApplicationsForJob(job.id);
        if (apps.some(a => a.applicantId === applicantId)) {
          hasApplied = true;
          break;
        }
      }
      if (!hasApplied) {
        return res.status(403).json({ message: "This applicant has not applied to any of your jobs" });
      }
    }

    const applicant = await storage.getUser(applicantId);
    if (!applicant || applicant.role !== "applicant") {
      return res.status(404).json({ message: "Applicant not found" });
    }

    const history = await storage.getJobHistoryByUser(applicantId);
    const isApplicantVerified = applicant.isVerified || false;
    const hideUnverifiedProfile = (await getSettingValue("hide_unverified_details")) === "true";
    const showDetails = isApplicantVerified || !hideUnverifiedProfile;

    res.json({
      id: applicant.id,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: showDetails ? applicant.email : null,
      phone: showDetails ? applicant.phone : null,
      profileImageUrl: applicant.profileImageUrl,
      gender: applicant.gender,
      age: applicant.age,
      bio: applicant.bio,
      location: applicant.location,
      cvUrl: showDetails ? applicant.cvUrl : null,
      expectedSalaryMin: applicant.expectedSalaryMin,
      expectedSalaryMax: applicant.expectedSalaryMax,
      isVerified: isApplicantVerified,
      createdAt: applicant.createdAt,
      jobHistory: history,
    });
  });

  // === JOB HISTORY ===

  app.get("/api/job-history", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const history = await storage.getJobHistoryByUser(userId);
    res.json(history);
  });

  app.post("/api/job-history", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    try {
      const input = insertJobHistorySchema.parse({
        ...req.body,
        userId,
      });
      const entry = await storage.createJobHistory(input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to add job history" });
    }
  });

  app.patch("/api/job-history/:id", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid job history ID" });
    try {
      const updateSchema = z.object({
        jobTitle: z.string().min(1).optional(),
        company: z.string().min(1).optional(),
        startDate: z.string().optional(),
        endDate: z.string().nullable().optional(),
        isCurrent: z.boolean().optional(),
        description: z.string().optional(),
      });
      const parsed = updateSchema.parse(req.body);
      const entry = await storage.updateJobHistory(id, userId, parsed);
      if (!entry) return res.status(404).json({ message: "Entry not found" });
      res.json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to update job history" });
    }
  });

  app.delete("/api/job-history/:id", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid job history ID" });
    await storage.deleteJobHistory(id, userId);
    res.status(204).send();
  });

  // === OFFERS ===

  // Create offer (employer or admin sends to applicant)
  app.post("/api/offers", isAuthenticated, async (req, res) => {
    const employerId = req.session.userId!;
    const employer = await storage.getUser(employerId);
    if (employer?.role !== "employer" && employer?.role !== "admin") return res.status(403).json({ message: "Only employers can send offers" });
    const restrictFreeOffer = (await getSettingValue("restrict_free_employer_management")) === "true";
    if (restrictFreeOffer && employer.role === "employer" && employer.subscriptionStatus === "free") return res.status(403).json({ message: "Please upgrade your subscription to send offers.", code: "SUBSCRIPTION_REQUIRED" });

    try {
      const offerSchema = z.object({
        applicationId: z.number(),
        salary: z.number().min(1, "Salary is required"),
        compensation: z.string().optional(),
        note: z.string().optional(),
      });
      const input = offerSchema.parse(req.body);

      const application = await storage.getApplication(input.applicationId);
      if (!application) return res.status(404).json({ message: "Application not found" });

      const job = await storage.getJob(application.jobId);
      if (!job || (job.employerId !== employerId && employer?.role !== 'admin')) return res.status(403).json({ message: "Not authorized" });

      const existingOffer = await storage.getOfferByApplication(input.applicationId);
      if (existingOffer) return res.status(400).json({ message: "An offer has already been sent for this application" });

      const offer = await storage.createOffer({
        applicationId: input.applicationId,
        jobId: application.jobId,
        employerId,
        applicantId: application.applicantId,
        salary: input.salary,
        compensation: input.compensation || null,
        note: input.note || null,
        status: "pending",
      });

      await storage.updateApplicationStatus(input.applicationId, "offered");

      res.status(201).json(offer);

      const applicant = await storage.getUser(application.applicantId);
      const companyName = employer?.companyName || `${employer?.firstName || ""} ${employer?.lastName || ""}`.trim() || "Employer";
      if (applicant && job) {
        const applicantName = `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim() || "Applicant";

        storage.createNotification({
          title: "You Received a Job Offer!",
          message: `${companyName} has sent you an offer for "${job.title}" with a salary of ₦${input.salary.toLocaleString()}.`,
          type: "individual",
          targetRole: null,
          targetUserId: application.applicantId,
          createdBy: employerId,
        }).catch(() => {});

        if (applicant.email) {
          sendOfferEmail(applicant.email, applicantName, job.title, companyName, input.salary, input.note).catch(() => {});
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to send offer" });
    }
  });

  // Get my offers (applicant)
  app.get("/api/my-offers", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const offerList = await storage.getOffersForApplicant(userId);
    
    const enriched = await Promise.all(offerList.map(async (offer) => {
      const job = await storage.getJob(offer.jobId);
      const employer = await storage.getUser(offer.employerId);
      return {
        ...offer,
        jobTitle: job?.title || "Unknown Job",
        jobLocation: job?.location || "",
        jobType: job?.jobType || "",
        employerName: employer?.companyName || `${employer?.firstName} ${employer?.lastName}`,
        employerLogo: employer?.companyLogo || null,
      };
    }));
    
    res.json(enriched);
  });

  // Get offer for a specific application (employer)
  app.get("/api/offers/application/:applicationId", isAuthenticated, async (req, res) => {
    const offer = await storage.getOfferByApplication(Number(req.params.applicationId));
    res.json(offer || null);
  });

  // Respond to offer (applicant accepts/declines)
  app.patch("/api/offers/:id/respond", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const offerId = Number(req.params.id);
    if (isNaN(offerId)) return res.status(400).json({ message: "Invalid offer ID" });

    const currentUser = await storage.getUser(userId);
    if (currentUser && currentUser.role === "applicant" && !currentUser.isVerified) {
      return res.status(403).json({ message: "Please get verified to respond to job offers.", code: "VERIFICATION_REQUIRED" });
    }

    const responseSchema = z.object({
      status: z.enum(["accepted", "declined"]),
    });

    try {
      const input = responseSchema.parse(req.body);
      const offer = await storage.getOffer(offerId);
      if (!offer) return res.status(404).json({ message: "Offer not found" });
      if (offer.applicantId !== userId) return res.status(403).json({ message: "Not authorized" });
      if (offer.status !== "pending") return res.status(400).json({ message: "Offer already responded to" });

      const updated = await storage.updateOfferStatus(offerId, input.status);
      
      if (input.status === "accepted") {
        await storage.updateApplicationStatus(offer.applicationId, "accepted");
        await storage.updateJob(offer.jobId, { status: "filled", isActive: false });
      } else {
        await storage.updateApplicationStatus(offer.applicationId, "pending");
      }

      res.json(updated);

      const employer = await storage.getUser(offer.employerId);
      const applicant = await storage.getUser(offer.applicantId);
      const job = await storage.getJob(offer.jobId);
      if (employer && applicant && job) {
        const employerName = employer.companyName || `${employer.firstName || ""} ${employer.lastName || ""}`.trim() || "Employer";
        const applicantName = `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim() || "Applicant";
        const responseLabel = input.status === "accepted" ? "Accepted" : "Declined";

        storage.createNotification({
          title: `Offer ${responseLabel}`,
          message: `${applicantName} has ${responseLabel.toLowerCase()} your offer for "${job.title}".`,
          type: "individual",
          targetRole: null,
          targetUserId: offer.employerId,
          createdBy: userId,
        }).catch(() => {});

        if (employer.email) {
          sendOfferResponseEmail(employer.email, employerName, applicantName, job.title, input.status).catch(() => {});
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to respond to offer" });
    }
  });

  app.patch("/api/offers/:id/counter", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const offerId = Number(req.params.id);
    if (isNaN(offerId)) return res.status(400).json({ message: "Invalid offer ID" });

    const currentUser = await storage.getUser(userId);
    if (currentUser && currentUser.role === "applicant" && !currentUser.isVerified) {
      return res.status(403).json({ message: "Please get verified to respond to job offers.", code: "VERIFICATION_REQUIRED" });
    }

    const counterSchema = z.object({
      counterSalary: z.number().min(1, "Salary must be greater than 0"),
      counterCompensation: z.string().optional(),
      counterNote: z.string().optional(),
    });

    try {
      const input = counterSchema.parse(req.body);
      const offer = await storage.getOffer(offerId);
      if (!offer) return res.status(404).json({ message: "Offer not found" });
      if (offer.applicantId !== userId) return res.status(403).json({ message: "Not authorized" });
      if (offer.status !== "pending") return res.status(400).json({ message: "Offer already responded to" });

      const updated = await storage.updateOffer(offerId, {
        counterSalary: input.counterSalary,
        counterCompensation: input.counterCompensation || null,
        counterNote: input.counterNote || null,
        status: "countered",
      });

      res.json(updated);

      const employer = await storage.getUser(offer.employerId);
      const applicant = await storage.getUser(offer.applicantId);
      const job = await storage.getJob(offer.jobId);
      if (employer && applicant && job) {
        const employerName = employer.companyName || `${employer.firstName || ""} ${employer.lastName || ""}`.trim() || "Employer";
        const applicantName = `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim() || "Applicant";

        storage.createNotification({
          title: "Counter Offer Received",
          message: `${applicantName} has submitted a counter offer of ₦${input.counterSalary.toLocaleString()} for "${job.title}". Your original offer was ₦${offer.salary.toLocaleString()}.`,
          type: "individual",
          targetRole: null,
          targetUserId: offer.employerId,
          createdBy: userId,
        }).catch(() => {});

        if (employer.email) {
          sendCounterOfferEmail(
            employer.email,
            employerName,
            applicantName,
            job.title,
            offer.salary,
            input.counterSalary,
            input.counterCompensation || null,
            input.counterNote || null
          ).catch(() => {});
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to submit counter offer" });
    }
  });

  app.patch("/api/offers/:id/respond-counter", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const offerId = Number(req.params.id);
    if (isNaN(offerId)) return res.status(400).json({ message: "Invalid offer ID" });

    const responseSchema = z.object({
      action: z.enum(["accept", "decline"]),
    });

    try {
      const input = responseSchema.parse(req.body);
      const offer = await storage.getOffer(offerId);
      if (!offer) return res.status(404).json({ message: "Offer not found" });
      if (offer.status !== "countered") return res.status(400).json({ message: "This offer does not have a pending counter offer" });

      const employer = await storage.getUser(userId);
      const isEmployer = offer.employerId === userId;
      const isAdmin = employer?.role === "admin";
      if (!isEmployer && !isAdmin) return res.status(403).json({ message: "Not authorized" });

      const restrictFreeCounter = (await getSettingValue("restrict_free_employer_management")) === "true";
      if (restrictFreeCounter && employer?.role === "employer" && employer.subscriptionStatus === "free") {
        return res.status(403).json({ message: "Please upgrade your subscription to respond to counter offers.", code: "SUBSCRIPTION_REQUIRED" });
      }

      if (input.action === "accept") {
        const updated = await storage.updateOffer(offerId, {
          salary: offer.counterSalary!,
          compensation: offer.counterCompensation || offer.compensation,
          status: "accepted",
        });
        await storage.updateApplicationStatus(offer.applicationId, "accepted");
        await storage.updateJob(offer.jobId, { status: "filled", isActive: false });
        res.json(updated);
      } else {
        const updated = await storage.updateOfferStatus(offerId, "declined");
        await storage.updateApplicationStatus(offer.applicationId, "pending");
        res.json(updated);
      }

      const applicant = await storage.getUser(offer.applicantId);
      const job = await storage.getJob(offer.jobId);
      if (applicant && job) {
        const applicantName = `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim() || "Applicant";
        const companyName = employer?.companyName || `${employer?.firstName || ""} ${employer?.lastName || ""}`.trim() || "Employer";
        const actionLabel = input.action === "accept" ? "accepted" : "declined";

        storage.createNotification({
          title: `Counter Offer ${input.action === "accept" ? "Accepted" : "Declined"}`,
          message: `${companyName} has ${actionLabel} your counter offer for "${job.title}".${input.action === "accept" ? " Congratulations!" : " The position may still be available — check your dashboard for updates."}`,
          type: "individual",
          targetRole: null,
          targetUserId: offer.applicantId,
          createdBy: userId,
        }).catch(() => {});

        if (applicant.email) {
          sendOfferResponseEmail(applicant.email, applicantName, companyName, job.title, input.action === "accept" ? "accepted" : "declined").catch(() => {});
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to respond to counter offer" });
    }
  });

  // === INTERVIEWS ===

  async function getInterviewCredits(): Promise<Record<string, number>> {
    return {
      free: parseInt(await getSettingValue("interview_credits_free")) || 0,
      standard: parseInt(await getSettingValue("interview_credits_standard")) || 0,
      premium: parseInt(await getSettingValue("interview_credits_premium")) || 3,
      enterprise: parseInt(await getSettingValue("interview_credits_enterprise")) || 5,
    };
  }

  function getBillingPeriodStart(user: any): Date {
    if (user.subscriptionEndDate) {
      const billingStart = new Date(user.subscriptionEndDate);
      billingStart.setDate(billingStart.getDate() - 30);
      return billingStart;
    }
    const fallback = new Date();
    fallback.setDate(fallback.getDate() - 30);
    return fallback;
  }

  app.get("/api/my-transactions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const txns = await storage.getTransactionsByUser(userId);
      res.json(txns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/interview-credits", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const user = await storage.getUser(userId);
    if (!user || (user.role !== "employer" && user.role !== "admin")) return res.status(403).json({ message: "Only employers can view interview credits" });

    if (user.role === "admin") {
      return res.json({ total: 999, used: 0, remaining: 999, plan: "admin" });
    }

    const plan = user.subscriptionStatus || "free";
    const interviewCreditsMap = await getInterviewCredits();
    const totalCredits = interviewCreditsMap[plan] || 0;

    let used = 0;
    if (totalCredits > 0) {
      const billingStart = getBillingPeriodStart(user);
      used = await storage.getInterviewCountForEmployer(userId, billingStart);
    }

    res.json({ total: totalCredits, used, remaining: Math.max(totalCredits - used, 0), plan });
  });

  app.get("/api/jobs/:jobId/recommended-applicants", isAuthenticated, async (req, res) => {
    const employerId = req.session.userId!;
    const employer = await storage.getUser(employerId);
    if (!employer || (employer.role !== "employer" && employer.role !== "admin")) return res.status(403).json({ message: "Only employers can view recommendations" });

    if (employer.role === "employer" && employer.subscriptionStatus !== "premium" && employer.subscriptionStatus !== "enterprise") {
      return res.status(403).json({ message: "Upgrade to Premium or Enterprise to get applicant recommendations.", code: "SUBSCRIPTION_REQUIRED" });
    }

    const jobId = Number(req.params.jobId);
    if (isNaN(jobId)) return res.status(400).json({ message: "Invalid job ID" });

    const job = await storage.getJob(jobId);
    if (!job || (job.employerId !== employerId && employer.role !== 'admin')) return res.status(403).json({ message: "Not authorized" });

    const apps = await storage.getApplicationsForJob(jobId);
    const hideUnverifiedRec = (await getSettingValue("hide_unverified_details")) === "true";

    const scored = await Promise.all(apps.map(async (app) => {
      const applicant = await storage.getUser(app.applicantId);
      if (!applicant) return null;

      let score = 0;
      const reasons: string[] = [];

      if (applicant.isVerified) { score += 30; reasons.push("Verified applicant"); }
      if (applicant.bio && applicant.bio.length > 20) { score += 10; reasons.push("Detailed bio"); }
      if (applicant.cvUrl) { score += 15; reasons.push("CV uploaded"); }
      if (applicant.phone) { score += 5; reasons.push("Phone provided"); }
      if (applicant.location) { score += 5; reasons.push("Location provided"); }
      if (applicant.profileImageUrl) { score += 5; reasons.push("Profile photo"); }

      const history = await storage.getJobHistoryByUser(applicant.id);
      if (history && history.length > 0) {
        score += Math.min(history.length * 5, 15);
        reasons.push(`${history.length} past job${history.length > 1 ? "s" : ""}`);
        const relevantExp = history.some(h =>
          h.jobTitle?.toLowerCase().includes(job.category?.toLowerCase()) ||
          job.category?.toLowerCase().includes(h.jobTitle?.toLowerCase() || "")
        );
        if (relevantExp) { score += 10; reasons.push("Relevant experience"); }
      }

      if (job.gender && job.gender !== "Any" && applicant.gender === job.gender) {
        score += 5; reasons.push("Gender preference match");
      }

      if (job.ageMin && job.ageMax && applicant.age) {
        if (applicant.age >= job.ageMin && applicant.age <= job.ageMax) {
          score += 5; reasons.push("Age range match");
        }
      }

      if (applicant.location && job.location) {
        if (applicant.location.toLowerCase().includes(job.location.toLowerCase()) ||
            job.location.toLowerCase().includes(applicant.location.toLowerCase())) {
          score += 10; reasons.push("Location match");
        }
      }

      const isApplicantVerified = applicant.isVerified || false;
      const showRecommendationDetails = isApplicantVerified || !hideUnverifiedRec;

      const interviewRecord = await storage.getInterviewByApplication(app.id);
      const interviewStatus = interviewRecord ? interviewRecord.status : null;
      const interviewDate = interviewRecord ? interviewRecord.interviewDate : null;
      const interviewType = interviewRecord ? interviewRecord.interviewType : null;

      if (app.adminRating && interviewStatus === "completed") {
        score += app.adminRating * 4;
        reasons.push(`Admin rated ${app.adminRating}/5`);
      }

      return {
        applicationId: app.id,
        applicantId: applicant.id,
        applicantName: `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim() || "Applicant",
        applicantEmail: showRecommendationDetails ? applicant.email : null,
        applicantPhone: showRecommendationDetails ? applicant.phone : null,
        applicantProfileImageUrl: applicant.profileImageUrl || null,
        applicantCvUrl: showRecommendationDetails ? applicant.cvUrl : null,
        applicantGender: applicant.gender || null,
        applicantAge: applicant.age || null,
        applicantLocation: applicant.location || null,
        applicantBio: applicant.bio || null,
        applicantIsVerified: isApplicantVerified,
        applicationStatus: app.status,
        score,
        reasons,
        matchLevel: score >= 60 ? "Excellent" : score >= 40 ? "Good" : score >= 20 ? "Fair" : "Basic",
        adminRating: app.adminRating || null,
        adminNote: app.adminNote || null,
        adminReviewedAt: app.adminReviewedAt || null,
        interviewStatus,
        interviewDate,
        interviewType,
      };
    }));

    const validScored = scored.filter(Boolean).sort((a: any, b: any) => b.score - a.score);
    res.json(validScored);
  });

  // Schedule interview (employer, agent, or admin)
  app.post("/api/interviews", isAuthenticated, async (req, res) => {
    const employerId = req.session.userId!;
    const employer = await storage.getUser(employerId);
    if (employer?.role !== "employer" && employer?.role !== "admin" && employer?.role !== "agent") return res.status(403).json({ message: "Only employers or agents can schedule interviews" });

    try {
      const interviewSchema = z.object({
        applicationId: z.number(),
        interviewDate: z.string().min(1, "Interview date is required"),
        interviewTime: z.string().min(1, "Interview time is required"),
        interviewType: z.enum(["in-person", "phone", "video"]),
        location: z.string().optional(),
        meetingLink: z.string().optional(),
        notes: z.string().optional(),
      });
      const input = interviewSchema.parse(req.body);

      const application = await storage.getApplication(input.applicationId);
      if (!application) return res.status(404).json({ message: "Application not found" });

      const job = await storage.getJob(application.jobId);
      const isJobOwner = job && (job.employerId === employerId || job.agentId === employerId);
      if (!job || (!isJobOwner && employer?.role !== 'admin')) return res.status(403).json({ message: "Not authorized" });

      if (application.status !== "pending" && application.status !== "offered") {
        return res.status(400).json({ message: "Can only schedule interviews for pending or offered applicants" });
      }

      const existingInterview = await storage.getInterviewByApplication(input.applicationId);
      if (existingInterview) return res.status(400).json({ message: "An interview is already scheduled for this application" });

      const isAdminScheduling = employer?.role === "admin";
      const isAgentScheduling = employer?.role === "agent";
      const actualEmployerId = job.employerId;

      const interview = await storage.createInterview({
        applicationId: input.applicationId,
        jobId: application.jobId,
        employerId: actualEmployerId,
        applicantId: application.applicantId,
        interviewDate: input.interviewDate,
        interviewTime: input.interviewTime,
        interviewType: input.interviewType,
        location: input.location || null,
        meetingLink: input.meetingLink || null,
        notes: input.notes || null,
        status: "scheduled",
      });

      res.status(201).json(interview);

      const applicant = await storage.getUser(application.applicantId);
      const jobEmployer = await storage.getUser(actualEmployerId);
      const agentName = isAgentScheduling
        ? (employer?.agencyName || `${employer?.firstName || ""} ${employer?.lastName || ""}`.trim() || "Agent")
        : null;
      const schedulerName = isAdminScheduling
        ? "Iṣéyá Team"
        : isAgentScheduling
        ? agentName!
        : (jobEmployer?.companyName || `${jobEmployer?.firstName || ""} ${jobEmployer?.lastName || ""}`.trim() || "Employer");

      if (applicant && job) {
        const applicantName = `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim() || "Applicant";

        storage.createNotification({
          title: "Interview Scheduled",
          message: `${schedulerName} has scheduled a ${input.interviewType} interview for "${job.title}" on ${input.interviewDate} at ${input.interviewTime}.`,
          type: "individual",
          targetRole: null,
          targetUserId: application.applicantId,
          createdBy: employerId,
        }).catch(() => {});

        if (applicant.email) {
          sendInterviewScheduledEmail(
            applicant.email, applicantName, job.title, schedulerName,
            input.interviewDate, input.interviewTime, input.interviewType,
            input.location, input.meetingLink, input.notes
          ).catch(() => {});
        }

        if (isAdminScheduling && jobEmployer) {
          const employerDisplayName = `${jobEmployer.firstName || ""} ${jobEmployer.lastName || ""}`.trim() || "Employer";

          storage.createNotification({
            title: "Interview Scheduled by Iṣéyá Team",
            message: `The Iṣéyá team has scheduled a ${input.interviewType} interview with ${applicantName} for your job "${job.title}" on ${input.interviewDate} at ${input.interviewTime}. We will recommend shortly after assessment.`,
            type: "individual",
            targetRole: null,
            targetUserId: actualEmployerId,
            createdBy: employerId,
          }).catch(() => {});

          if (jobEmployer.email) {
            sendInterviewScheduledEmail(
              jobEmployer.email, employerDisplayName, job.title, "Iṣéyá Team (on your behalf)",
              input.interviewDate, input.interviewTime, input.interviewType,
              input.location, input.meetingLink,
              `The Iṣéyá team has scheduled this interview with applicant ${applicantName} for your job posting. We will provide our recommendation shortly after the assessment.`
            ).catch(() => {});
          }
        }

        if (isAgentScheduling && jobEmployer) {
          const employerDisplayName = `${jobEmployer.firstName || ""} ${jobEmployer.lastName || ""}`.trim() || "Employer";

          storage.createNotification({
            title: "Interview Scheduled by Agent",
            message: `Your agent ${agentName} has scheduled a ${input.interviewType} interview with ${applicantName} for your job "${job.title}" on ${input.interviewDate} at ${input.interviewTime}.`,
            type: "individual",
            targetRole: null,
            targetUserId: actualEmployerId,
            createdBy: employerId,
          }).catch(() => {});

          if (jobEmployer.email) {
            sendInterviewScheduledEmail(
              jobEmployer.email, employerDisplayName, job.title, `${agentName} (your agent)`,
              input.interviewDate, input.interviewTime, input.interviewType,
              input.location, input.meetingLink,
              `Your agent ${agentName} has scheduled this interview with applicant ${applicantName} for your job posting.`
            ).catch(() => {});
          }
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to schedule interview" });
    }
  });

  // Get interviews for a job (employer or admin)
  app.get("/api/jobs/:jobId/interviews", isAuthenticated, async (req, res) => {
    const employerId = req.session.userId!;
    const currentUser = await storage.getUser(employerId);
    const jobId = Number(req.params.jobId);
    if (isNaN(jobId)) return res.status(400).json({ message: "Invalid job ID" });
    const job = await storage.getJob(jobId);
    const isJobOwner = job && (job.employerId === employerId || job.agentId === employerId);
    if (!job || (!isJobOwner && currentUser?.role !== 'admin')) return res.status(403).json({ message: "Not authorized" });

    const interviewList = await storage.getInterviewsForJob(jobId);
    const hideUnverifiedInterview = (await getSettingValue("hide_unverified_details")) === "true";
    const enriched = await Promise.all(interviewList.map(async (interview) => {
      const applicant = await storage.getUser(interview.applicantId);
      const isVerified = applicant?.isVerified || false;
      const showInfo = isVerified || !hideUnverifiedInterview || currentUser?.role === 'admin';
      return {
        ...interview,
        applicantName: applicant ? `${applicant.firstName} ${applicant.lastName}` : "Unknown",
        applicantEmail: showInfo ? (applicant?.email || null) : null,
      };
    }));
    res.json(enriched);
  });

  // Get my interviews (applicant)
  app.get("/api/my-interviews", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const interviewList = await storage.getInterviewsForApplicant(userId);
    
    const enriched = await Promise.all(interviewList.map(async (interview) => {
      const job = await storage.getJob(interview.jobId);
      const employer = await storage.getUser(interview.employerId);
      return {
        ...interview,
        jobTitle: job?.title || "Unknown Job",
        jobLocation: job?.location || "",
        employerName: employer?.companyName || `${employer?.firstName} ${employer?.lastName}`,
      };
    }));
    
    res.json(enriched);
  });

  // Update interview (employer, admin, or applicant for confirmation)
  app.patch("/api/interviews/:id", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const interviewId = Number(req.params.id);
    if (isNaN(interviewId)) return res.status(400).json({ message: "Invalid interview ID" });

    try {
      const updateSchema = z.object({
        interviewDate: z.string().optional(),
        interviewTime: z.string().optional(),
        interviewType: z.enum(["in-person", "phone", "video"]).optional(),
        location: z.string().nullable().optional(),
        meetingLink: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
        status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
      });
      const input = updateSchema.parse(req.body);

      const interview = await storage.getInterview(interviewId);
      if (!interview) return res.status(404).json({ message: "Interview not found" });
      const updatingUser = await storage.getUser(userId);

      const isEmployer = interview.employerId === userId;
      const isAdmin = updatingUser?.role === "admin";
      const isApplicant = interview.applicantId === userId;
      const job = await storage.getJob(interview.jobId);
      const isAgent = updatingUser?.role === "agent" && job?.agentId === userId;

      if (isApplicant) {
        if (Object.keys(input).length !== 1 || input.status !== "completed") {
          return res.status(403).json({ message: "Applicants can only confirm interviews as completed" });
        }
      } else if (!isEmployer && !isAdmin && !isAgent) {
        return res.status(403).json({ message: "Not authorized" });
      }

      if (input.status === "completed" && !isAdmin) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const interviewDay = new Date(interview.interviewDate);
        interviewDay.setHours(0, 0, 0, 0);
        if (interviewDay > today) {
          return res.status(400).json({ message: "Cannot confirm interview before the scheduled date" });
        }
      }

      const updated = await storage.updateInterview(interviewId, input);

      if (input.status === "completed") {
        const job = await storage.getJob(interview.jobId);
        const applicant = await storage.getUser(interview.applicantId);
        const employer = await storage.getUser(interview.employerId);
        const applicantName = `${applicant?.firstName || ""} ${applicant?.lastName || ""}`.trim() || "Applicant";
        const confirmerName = isAdmin ? "Iṣéyá Team" : isApplicant ? applicantName : (employer?.companyName || `${employer?.firstName || ""} ${employer?.lastName || ""}`.trim());

        if (isEmployer || isAdmin) {
          storage.createNotification({
            title: "Interview Completed",
            message: `Your interview for "${job?.title || "a job"}" has been confirmed as completed by ${confirmerName}. You will receive recommendations shortly.`,
            type: "individual",
            targetRole: null,
            targetUserId: interview.applicantId,
            createdBy: userId,
          }).catch(() => {});
        }

        if (isApplicant) {
          storage.createNotification({
            title: "Interview Confirmed by Applicant",
            message: `${applicantName} has confirmed the interview for "${job?.title || "a job"}" as completed.`,
            type: "individual",
            targetRole: null,
            targetUserId: interview.employerId,
            createdBy: userId,
          }).catch(() => {});
        }

        if (isAdmin && employer) {
          storage.createNotification({
            title: "Interview Completed — Recommendation Coming",
            message: `The Iṣéyá team has confirmed the interview with ${applicantName} for your job "${job?.title || "a job"}" as completed. We will provide our recommendation shortly.`,
            type: "individual",
            targetRole: null,
            targetUserId: interview.employerId,
            createdBy: userId,
          }).catch(() => {});
        }
      }

      if (input.status === "cancelled") {
        const job = await storage.getJob(interview.jobId);
        const applicant = await storage.getUser(interview.applicantId);
        const employer = await storage.getUser(interview.employerId);
        const applicantName = `${applicant?.firstName || ""} ${applicant?.lastName || ""}`.trim() || "Applicant";
        const companyName = employer?.companyName || `${employer?.firstName || ""} ${employer?.lastName || ""}`.trim() || "Employer";

        storage.createNotification({
          title: "Interview Cancelled",
          message: `Your interview for "${job?.title || "a job"}" scheduled on ${interview.interviewDate} at ${interview.interviewTime} has been cancelled.`,
          type: "individual",
          targetRole: null,
          targetUserId: interview.applicantId,
          createdBy: userId,
        }).catch(() => {});

        if (!isApplicant) {
          storage.createNotification({
            title: "Interview Cancelled",
            message: `The interview with ${applicantName} for "${job?.title || "a job"}" has been cancelled.`,
            type: "individual",
            targetRole: null,
            targetUserId: interview.employerId,
            createdBy: userId,
          }).catch(() => {});
        }

        if (applicant?.email) {
          sendInterviewCancelledEmail(
            applicant.email,
            applicantName,
            job?.title || "a job",
            companyName,
            interview.interviewDate,
            interview.interviewTime,
            input.notes || null
          ).catch(() => {});
        }
      }

      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to update interview" });
    }
  });

  // Get interview for a specific application
  app.get("/api/interviews/application/:applicationId", isAuthenticated, async (req, res) => {
    const interview = await storage.getInterviewByApplication(Number(req.params.applicationId));
    res.json(interview || null);
  });

  // === SUBSCRIPTIONS ===

  // Admin: Get users by subscription status
  app.get("/api/admin/subscriptions", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageSubscriptions) {
      return res.status(403).json({ message: "You do not have permission to manage subscriptions" });
    }
    const { status } = req.query;
    if (status) {
      const users = await storage.getUsersBySubscription(status as string);
      res.json(users);
    } else {
      const employers = await storage.getAllUsers({ role: "employer" });
      const agents = await storage.getAllUsers({ role: "agent" });
      res.json([...employers, ...agents]);
    }
  });

  // Admin: Update user subscription
  app.patch("/api/admin/subscriptions/:userId", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageSubscriptions) {
      return res.status(403).json({ message: "You don't have permission to manage subscriptions" });
    }
    try {
      const input = adminUpdateSubscriptionSchema.parse(req.body);
      const updates: any = {};
      if (input.subscriptionStatus) updates.subscriptionStatus = input.subscriptionStatus;
      if (input.subscriptionEndDate) updates.subscriptionEndDate = new Date(input.subscriptionEndDate);
      
      const user = await storage.updateUser(req.params.userId, updates);
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: "Failed to update subscription" });
    }
  });

  // === PAYSTACK SUBSCRIPTION PAYMENT ===
  async function getSubscriptionPlans() {
    const standardPrice = parseFloat(await getSettingValue("subscription_standard_price"));
    const premiumPrice = parseFloat(await getSettingValue("subscription_premium_price"));
    const enterprisePrice = parseFloat(await getSettingValue("subscription_enterprise_price"));
    const standardDiscount = parseFloat(await getSettingValue("subscription_standard_discount"));
    const premiumDiscount = parseFloat(await getSettingValue("subscription_premium_discount"));
    const enterpriseDiscount = parseFloat(await getSettingValue("subscription_enterprise_discount"));

    const jobLimitFree = parseInt(await getSettingValue("job_limit_free")) || 1;
    const jobLimitStandard = parseInt(await getSettingValue("job_limit_standard")) || 5;
    const jobLimitPremium = parseInt(await getSettingValue("job_limit_premium")) || 10;
    const jobLimitEnterprise = parseInt(await getSettingValue("job_limit_enterprise"));

    const applyDiscount = (price: number, discount: number) => Math.round(price * (1 - discount / 100));

    return {
      free: { name: "Basic", amount: 0, jobLimit: jobLimitFree, originalAmount: 0, discount: 0 },
      standard: { name: "Standard", amount: applyDiscount(standardPrice, standardDiscount) * 100, jobLimit: jobLimitStandard, originalAmount: standardPrice * 100, discount: standardDiscount },
      premium: { name: "Premium", amount: applyDiscount(premiumPrice, premiumDiscount) * 100, jobLimit: jobLimitPremium, originalAmount: premiumPrice * 100, discount: premiumDiscount },
      enterprise: { name: "Enterprise", amount: applyDiscount(enterprisePrice, enterpriseDiscount) * 100, jobLimit: isNaN(jobLimitEnterprise) ? -1 : jobLimitEnterprise, originalAmount: enterprisePrice * 100, discount: enterpriseDiscount },
    } as Record<string, { name: string; amount: number; jobLimit: number; originalAmount: number; discount: number }>;
  }

  app.get("/api/subscription/plans", async (_req, res) => {
    const plans = await getSubscriptionPlans();
    const result = Object.entries(plans).map(([id, plan]) => ({
      id,
      ...plan,
      amountFormatted: `₦${(plan.amount / 100).toLocaleString()}`,
    }));
    res.json(result);
  });

  app.post("/api/subscription/initialize", isAuthenticated, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user || user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can subscribe" });
    }

    const SUBSCRIPTION_PLANS = await getSubscriptionPlans();
    const { plan } = req.body;
    if (!plan || !SUBSCRIPTION_PLANS[plan] || plan === "free") {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return res.status(500).json({ message: "Payment system is not configured" });
    }

    try {
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: SUBSCRIPTION_PLANS[plan].amount,
          currency: "NGN",
          callback_url: `${req.protocol}://${req.get("host")}/subscription/verify`,
          metadata: {
            userId: user.id,
            plan,
            planName: SUBSCRIPTION_PLANS[plan].name,
          },
        }),
      });

      const data = await response.json();
      if (!data.status) {
        return res.status(400).json({ message: data.message || "Failed to initialize payment" });
      }

      res.json({
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: data.data.reference,
      });
    } catch (err) {
      console.error("Paystack initialization error:", err);
      res.status(500).json({ message: "Failed to initialize payment" });
    }
  });

  app.get("/api/subscription/verify", isAuthenticated, async (req, res) => {
    const { reference } = req.query;
    if (!reference) {
      return res.status(400).json({ message: "No payment reference provided" });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return res.status(500).json({ message: "Payment system is not configured" });
    }

    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
        },
      });

      const data = await response.json();
      if (!data.status || data.data.status !== "success") {
        const meta = data.data?.metadata || {};
        if (meta.userId && meta.plan) {
          await storage.createTransaction({
            userId: meta.userId,
            type: "subscription",
            gateway: "paystack",
            reference: data.data?.reference || String(reference),
            amount: data.data?.amount || 0,
            currency: "NGN",
            status: "failed",
            plan: meta.plan,
            metadata: JSON.stringify({ reason: "Gateway reported payment not successful", gatewayStatus: data.data?.status }),
          });
        }
        return res.status(400).json({ message: "Payment verification failed", verified: false });
      }

      const SUBSCRIPTION_PLANS = await getSubscriptionPlans();
      const { userId, plan } = data.data.metadata;
      if (!plan || !SUBSCRIPTION_PLANS[plan] || plan === "free") {
        return res.status(400).json({ message: "Invalid plan in payment metadata", verified: false });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await storage.updateUser(userId, {
        subscriptionStatus: plan,
        subscriptionEndDate: endDate,
        paystackCustomerId: data.data.customer?.customer_code || null,
      });

      await storage.createTransaction({
        userId,
        type: "subscription",
        gateway: "paystack",
        reference: data.data.reference || String(reference),
        amount: data.data.amount || SUBSCRIPTION_PLANS[plan].amount,
        currency: "NGN",
        status: "success",
        plan,
        metadata: JSON.stringify({ planName: SUBSCRIPTION_PLANS[plan].name, paystackRef: data.data.reference }),
      });

      res.json({ verified: true, plan, message: "Subscription activated successfully" });

      if (user.email) {
        const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
        sendSubscriptionEmail(user.email, userName, plan).catch(() => {});
      }
    } catch (err) {
      console.error("Paystack verification error:", err);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  app.post("/api/subscription/webhook", async (req, res) => {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) return res.sendStatus(200);

    const crypto = await import("crypto");
    const hash = crypto.createHmac("sha512", paystackSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");
    const signature = req.headers["x-paystack-signature"];
    if (hash !== signature) {
      return res.sendStatus(401);
    }

    const SUBSCRIPTION_PLANS = await getSubscriptionPlans();
    const event = req.body;
    if (event.event === "charge.success") {
      const { userId, plan } = event.data.metadata || {};
      if (userId && plan && SUBSCRIPTION_PLANS[plan]) {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        await storage.updateUser(userId, {
          subscriptionStatus: plan,
          subscriptionEndDate: endDate,
        });
        await storage.createTransaction({
          userId,
          type: "subscription",
          gateway: "paystack",
          reference: event.data?.reference || "",
          amount: event.data?.amount || SUBSCRIPTION_PLANS[plan].amount,
          currency: "NGN",
          status: "success",
          plan,
          metadata: JSON.stringify({ source: "webhook", planName: SUBSCRIPTION_PLANS[plan].name }),
        });
      }
    }
    res.sendStatus(200);
  });

  // === FLUTTERWAVE SUBSCRIPTION PAYMENT ===
  app.post("/api/subscription/flutterwave/initialize", isAuthenticated, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user || user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can subscribe" });
    }

    const SUBSCRIPTION_PLANS = await getSubscriptionPlans();
    const { plan } = req.body;
    if (!plan || !SUBSCRIPTION_PLANS[plan] || plan === "free") {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const flwSecret = process.env.FLW_SECRET_KEY;
    if (!flwSecret) {
      return res.status(500).json({ message: "Flutterwave payment system is not configured" });
    }

    try {
      const txRef = `iseya-${user.id}-${plan}-${Date.now()}`;
      const response = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${flwSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_ref: txRef,
          amount: SUBSCRIPTION_PLANS[plan].amount / 100,
          currency: "NGN",
          redirect_url: `${req.protocol}://${req.get("host")}/subscription/verify?gateway=flutterwave`,
          customer: {
            email: user.email,
            name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.email || "Customer"),
          },
          customizations: {
            title: "Iṣéyá Subscription",
            description: `${SUBSCRIPTION_PLANS[plan].name} Plan Subscription`,
          },
          meta: {
            userId: user.id,
            plan,
            planName: SUBSCRIPTION_PLANS[plan].name,
          },
        }),
      });

      const data = await response.json();
      if (data.status !== "success") {
        return res.status(400).json({ message: data.message || "Failed to initialize payment" });
      }

      res.json({
        payment_link: data.data.link,
        tx_ref: txRef,
      });
    } catch (err) {
      console.error("Flutterwave initialization error:", err);
      res.status(500).json({ message: "Failed to initialize payment" });
    }
  });

  app.get("/api/subscription/flutterwave/verify", isAuthenticated, async (req, res) => {
    const { transaction_id } = req.query;
    if (!transaction_id) {
      return res.status(400).json({ message: "No transaction ID provided", verified: false });
    }

    const flwSecret = process.env.FLW_SECRET_KEY;
    if (!flwSecret) {
      return res.status(500).json({ message: "Flutterwave payment system is not configured" });
    }

    try {
      const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
        headers: {
          Authorization: `Bearer ${flwSecret}`,
        },
      });

      const data = await response.json();
      if (data.status !== "success" || data.data.status !== "successful") {
        const meta = data.data?.meta || {};
        if (meta.userId && meta.plan) {
          await storage.createTransaction({
            userId: meta.userId,
            type: "subscription",
            gateway: "flutterwave",
            reference: data.data?.tx_ref || data.data?.flw_ref || String(transaction_id),
            amount: data.data?.amount ? Math.round(data.data.amount * 100) : 0,
            currency: "NGN",
            status: "failed",
            plan: meta.plan,
            metadata: JSON.stringify({ reason: "Gateway reported payment not successful", gatewayStatus: data.data?.status }),
          });
        }
        return res.status(400).json({ message: "Payment verification failed", verified: false });
      }

      const SUBSCRIPTION_PLANS = await getSubscriptionPlans();
      const { userId, plan } = data.data.meta || {};
      if (!plan || !SUBSCRIPTION_PLANS[plan] || plan === "free") {
        return res.status(400).json({ message: "Invalid plan in payment metadata", verified: false });
      }

      if (String(userId) !== String(req.session.userId)) {
        return res.status(403).json({ message: "Payment does not belong to this user", verified: false });
      }

      const expectedAmount = SUBSCRIPTION_PLANS[plan].amount / 100;
      if (data.data.amount !== expectedAmount || data.data.currency !== "NGN") {
        return res.status(400).json({ message: "Payment amount mismatch", verified: false });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await storage.updateUser(userId, {
        subscriptionStatus: plan,
        subscriptionEndDate: endDate,
      });

      await storage.createTransaction({
        userId,
        type: "subscription",
        gateway: "flutterwave",
        reference: data.data.tx_ref || data.data.flw_ref || String(transaction_id),
        amount: Math.round(data.data.amount * 100),
        currency: "NGN",
        status: "success",
        plan,
        metadata: JSON.stringify({ planName: SUBSCRIPTION_PLANS[plan].name, flwRef: data.data.flw_ref }),
      });

      res.json({ verified: true, plan, message: "Subscription activated successfully" });

      if (user.email) {
        const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
        sendSubscriptionEmail(user.email, userName, plan).catch(() => {});
      }
    } catch (err) {
      console.error("Flutterwave verification error:", err);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  app.post("/api/subscription/flutterwave/webhook", async (req, res) => {
    const secretHash = process.env.FLW_SECRET_HASH;
    if (!secretHash) return res.sendStatus(200);

    const signature = req.headers["verif-hash"];
    if (!signature || signature !== secretHash) {
      return res.sendStatus(401);
    }

    const SUBSCRIPTION_PLANS = await getSubscriptionPlans();
    const payload = req.body;
    if (payload.event === "charge.completed" && payload.data?.status === "successful") {
      const { userId, plan } = payload.data.meta || {};
      if (userId && plan && SUBSCRIPTION_PLANS[plan] && plan !== "free") {
        const expectedAmount = SUBSCRIPTION_PLANS[plan].amount / 100;
        if (payload.data.amount === expectedAmount && payload.data.currency === "NGN") {
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1);
          await storage.updateUser(userId, {
            subscriptionStatus: plan,
            subscriptionEndDate: endDate,
          });
          await storage.createTransaction({
            userId,
            type: "subscription",
            gateway: "flutterwave",
            reference: payload.data.tx_ref || payload.data.flw_ref || "",
            amount: Math.round(payload.data.amount * 100),
            currency: "NGN",
            status: "success",
            plan,
            metadata: JSON.stringify({ source: "webhook", planName: SUBSCRIPTION_PLANS[plan].name }),
          });
        }
      }
    }
    res.sendStatus(200);
  });

  app.get("/api/subscription/status", isAuthenticated, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user) return res.status(404).json({ message: "User not found" });

    const SUBSCRIPTION_PLANS = await getSubscriptionPlans();
    const plan = SUBSCRIPTION_PLANS[user.subscriptionStatus || "free"] || SUBSCRIPTION_PLANS.free;
    const employerJobs = await storage.getJobsByEmployer(user.id);
    const activeJobCount = employerJobs.filter(j => j.isActive).length;

    res.json({
      currentPlan: user.subscriptionStatus || "free",
      planName: plan.name,
      jobLimit: plan.jobLimit,
      activeJobCount,
      canPostJob: plan.jobLimit === -1 || activeJobCount < plan.jobLimit,
      subscriptionEndDate: user.subscriptionEndDate,
    });
  });

  // === APPLICANT VERIFICATION SYSTEM ===
  async function getVerificationFee() {
    const fee = parseFloat(await getSettingValue("verification_fee"));
    const discount = parseFloat(await getSettingValue("verification_discount"));
    const finalFee = Math.round(fee * (1 - discount / 100));
    return { feeKobo: finalFee * 100, feeNaira: finalFee, originalFee: fee, discount };
  }

  // Ensure uploads/verification directory exists
  if (!fs.existsSync(path.join(process.cwd(), "uploads", "verification"))) {
    fs.mkdirSync(path.join(process.cwd(), "uploads", "verification"), { recursive: true });
  }

  // Get verification status for current user
  app.get("/api/verification/status", isAuthenticated, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isExpired = user.verificationExpiry && new Date(user.verificationExpiry) < new Date();
    if (user.isVerified && isExpired) {
      await storage.updateUser(user.id, { isVerified: false });
    }

    const request = await storage.getVerificationRequestByUser(user.id);
    res.json({
      isVerified: user.isVerified && !isExpired ? true : false,
      verificationExpiry: user.verificationExpiry || null,
      request: request || null,
    });
  });

  // Submit verification request with ID documents
  app.post("/api/verification/submit", isAuthenticated, uploadVerificationDocs.fields([
    { name: "idDocument", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]), async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "applicant") return res.status(403).json({ message: "Only applicants can request verification" });
    const verificationExpired = user.verificationExpiry && new Date(user.verificationExpiry) < new Date();
    if (user.isVerified && !verificationExpired) return res.status(400).json({ message: "You are already verified" });

    const existing = await storage.getVerificationRequestByUser(user.id);
    if (existing && (existing.status === "awaiting_payment" || existing.status === "pending" || existing.status === "under_review")) {
      return res.status(400).json({ message: "You already have a pending verification request" });
    }

    const { idType, idNumber } = req.body;
    if (!idType || !idNumber) {
      return res.status(400).json({ message: "ID type and ID number are required" });
    }

    const validIdTypes = ["nin", "voters_card", "drivers_license", "international_passport"];
    if (!validIdTypes.includes(idType)) {
      return res.status(400).json({ message: "Invalid ID type" });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const idDocumentUrl = files?.idDocument?.[0] ? `/uploads/verification/${files.idDocument[0].filename}` : null;
    const selfieUrl = files?.selfie?.[0] ? `/uploads/verification/${files.selfie[0].filename}` : null;
    if (files?.idDocument?.[0]) storeFileInDb(idDocumentUrl!, files.idDocument[0].path).catch(() => {});
    if (files?.selfie?.[0]) storeFileInDb(selfieUrl!, files.selfie[0].path).catch(() => {});

    if (!idDocumentUrl) {
      return res.status(400).json({ message: "ID document photo is required. Please upload a clear photo of your government-issued ID card." });
    }
    if (!selfieUrl) {
      return res.status(400).json({ message: "Selfie photo is required. Please upload a clear selfie holding your ID card to verify your identity." });
    }

    const request = await storage.createVerificationRequest({
      userId: user.id,
      idType,
      idNumber,
      idDocumentUrl,
      selfieUrl,
      status: "awaiting_payment",
    });

    res.json(request);
  });

  // Initialize verification payment via Paystack
  app.post("/api/verification/pay/paystack", isAuthenticated, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user || user.role !== "applicant") return res.status(403).json({ message: "Only applicants can pay for verification" });
    const paysExpired = user.verificationExpiry && new Date(user.verificationExpiry) < new Date();
    if (user.isVerified && !paysExpired) return res.status(400).json({ message: "You are already verified" });

    const existing = await storage.getVerificationRequestByUser(user.id);
    if (!existing || existing.status !== "awaiting_payment") {
      return res.status(400).json({ message: "Please submit your verification documents first" });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) return res.status(500).json({ message: "Payment system is not configured" });

    try {
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: (await getVerificationFee()).feeKobo,
          currency: "NGN",
          callback_url: `${req.protocol}://${req.get("host")}/verification/verify`,
          metadata: {
            userId: user.id,
            type: "verification",
            requestId: existing.id,
          },
        }),
      });

      const data = await response.json();
      if (!data.status) return res.status(400).json({ message: data.message || "Failed to initialize payment" });

      res.json({ authorization_url: data.data.authorization_url, reference: data.data.reference });
    } catch (err) {
      console.error("Verification Paystack init error:", err);
      res.status(500).json({ message: "Failed to initialize payment" });
    }
  });

  // Verify verification payment via Paystack
  app.get("/api/verification/verify/paystack", isAuthenticated, async (req, res) => {
    const reference = req.query.reference as string;
    if (!reference) return res.status(400).json({ message: "No reference provided", verified: false });

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) return res.status(500).json({ message: "Payment system not configured" });

    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${paystackSecret}` },
      });
      const data = await response.json();

      if (!data.status || data.data.status !== "success") {
        const meta = data.data?.metadata || {};
        if (meta.userId) {
          await storage.createTransaction({
            userId: meta.userId,
            type: "verification",
            gateway: "paystack",
            reference: data.data?.reference || String(reference),
            amount: data.data?.amount || 0,
            currency: "NGN",
            status: "failed",
            metadata: JSON.stringify({ requestId: meta.requestId, reason: "Gateway reported payment not successful", gatewayStatus: data.data?.status }),
          });
        }
        return res.status(400).json({ message: "Payment verification failed", verified: false });
      }

      const { userId, type, requestId } = data.data.metadata || {};
      if (type !== "verification" || !requestId) {
        return res.status(400).json({ message: "Invalid payment metadata", verified: false });
      }

      await storage.updateVerificationRequest(Number(requestId), { status: "pending" });

      await storage.createTransaction({
        userId: userId || req.session.userId!,
        type: "verification",
        gateway: "paystack",
        reference: data.data.reference || String(reference),
        amount: data.data.amount || 0,
        currency: "NGN",
        status: "success",
        metadata: JSON.stringify({ requestId, paystackRef: data.data.reference }),
      });

      res.json({ verified: true, message: "Payment received! Your verification is now under review." });
    } catch (err) {
      console.error("Verification Paystack verify error:", err);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Initialize verification payment via Flutterwave
  app.post("/api/verification/pay/flutterwave", isAuthenticated, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user || user.role !== "applicant") return res.status(403).json({ message: "Only applicants can pay for verification" });
    const flwExpired = user.verificationExpiry && new Date(user.verificationExpiry) < new Date();
    if (user.isVerified && !flwExpired) return res.status(400).json({ message: "You are already verified" });

    const existing = await storage.getVerificationRequestByUser(user.id);
    if (!existing || existing.status !== "awaiting_payment") {
      return res.status(400).json({ message: "Please submit your verification documents first" });
    }

    const flwSecret = process.env.FLW_SECRET_KEY;
    if (!flwSecret) return res.status(500).json({ message: "Flutterwave payment system is not configured" });

    try {
      const txRef = `iseya-verify-${user.id}-${Date.now()}`;
      const response = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${flwSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_ref: txRef,
          amount: (await getVerificationFee()).feeNaira,
          currency: "NGN",
          redirect_url: `${req.protocol}://${req.get("host")}/verification/verify?gateway=flutterwave`,
          customer: {
            email: user.email,
            name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.email || "Customer"),
          },
          customizations: {
            title: "Iṣéyá Verification",
            description: "Applicant Identity Verification Fee",
          },
          meta: {
            userId: user.id,
            type: "verification",
            requestId: existing.id,
          },
        }),
      });

      const data = await response.json();
      if (data.status !== "success") return res.status(400).json({ message: data.message || "Failed to initialize payment" });

      res.json({ authorization_url: data.data.link, tx_ref: txRef });
    } catch (err) {
      console.error("Verification Flutterwave init error:", err);
      res.status(500).json({ message: "Failed to initialize payment" });
    }
  });

  // Verify verification payment via Flutterwave
  app.get("/api/verification/verify/flutterwave", isAuthenticated, async (req, res) => {
    const transactionId = req.query.transaction_id as string;
    if (!transactionId) return res.status(400).json({ message: "No transaction ID provided", verified: false });

    const flwSecret = process.env.FLW_SECRET_KEY;
    if (!flwSecret) return res.status(500).json({ message: "Flutterwave payment system not configured" });

    try {
      const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
        headers: { Authorization: `Bearer ${flwSecret}` },
      });
      const data = await response.json();

      if (data.status !== "success" || data.data.status !== "successful") {
        const meta = data.data?.meta || {};
        if (meta.userId) {
          await storage.createTransaction({
            userId: meta.userId,
            type: "verification",
            gateway: "flutterwave",
            reference: data.data?.tx_ref || data.data?.flw_ref || String(transactionId),
            amount: data.data?.amount ? Math.round(data.data.amount * 100) : 0,
            currency: "NGN",
            status: "failed",
            metadata: JSON.stringify({ requestId: meta.requestId, reason: "Gateway reported payment not successful", gatewayStatus: data.data?.status }),
          });
        }
        return res.status(400).json({ message: "Payment verification failed", verified: false });
      }

      const { userId, type, requestId } = data.data.meta || {};
      if (type !== "verification" || !requestId) {
        return res.status(400).json({ message: "Invalid payment metadata", verified: false });
      }

      await storage.updateVerificationRequest(Number(requestId), { status: "pending" });

      await storage.createTransaction({
        userId: userId || req.session.userId!,
        type: "verification",
        gateway: "flutterwave",
        reference: data.data.tx_ref || data.data.flw_ref || String(transactionId),
        amount: Math.round((data.data.amount || 0) * 100),
        currency: "NGN",
        status: "success",
        metadata: JSON.stringify({ requestId, flwRef: data.data.flw_ref }),
      });

      res.json({ verified: true, message: "Payment received! Your verification is now under review." });
    } catch (err) {
      console.error("Verification Flutterwave verify error:", err);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  app.post("/api/agent/buy-post-credits/paystack", isAuthenticated, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user || user.role !== "agent") {
      return res.status(403).json({ message: "Only agents can buy post credits" });
    }
    const credits = Number(req.body.credits) || 1;
    try {
      const settings = await storage.getAllPlatformSettings();
      const baseFee = Number(settings.agent_job_post_fee || "5000");
      const discount = Number(settings.agent_job_post_discount || "0");
      const feePerPost = Math.round(baseFee * (1 - discount / 100));
      const totalAmount = feePerPost * credits * 100;
      const reference = `agent_credit_${user.id}_${Date.now()}`;
      const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: totalAmount,
          reference,
          currency: "NGN",
          callback_url: `${req.protocol}://${req.get("host")}/api/agent/verify-post-payment/paystack?reference=${reference}`,
          metadata: { userId: user.id, credits, type: "agent_post_credit" },
        }),
      });
      const data = await paystackRes.json();
      if (!data.status) {
        return res.status(400).json({ message: data.message || "Paystack init failed" });
      }
      res.json({ url: data.data.authorization_url, reference });
    } catch (err) {
      console.error("Agent credit Paystack init error:", err);
      res.status(500).json({ message: "Failed to initialize payment" });
    }
  });

  app.get("/api/agent/verify-post-payment/paystack", isAuthenticated, async (req, res) => {
    const reference = req.query.reference as string;
    if (!reference) return res.redirect("/post-job?payment=failed");
    try {
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      });
      const data = await verifyRes.json();
      if (data.status && data.data.status === "success") {
        const meta = data.data.metadata || {};
        const userId = req.session.userId!;
        const credits = Number(meta.credits) || 1;
        const user = await storage.getUser(userId);
        if (user && user.role === "agent") {
          const current = (user as any).agentPostCredits || 0;
          await storage.updateUser(userId, { agentPostCredits: current + credits } as any);
        }
        await storage.createTransaction({
          userId,
          type: "agent_post_credit",
          gateway: "paystack",
          reference,
          amount: data.data.amount || 0,
          currency: "NGN",
          status: "success",
          metadata: JSON.stringify({ credits }),
        });
        return res.redirect("/post-job?payment=success");
      }
      return res.redirect("/post-job?payment=failed");
    } catch (err) {
      console.error("Agent credit Paystack verify error:", err);
      return res.redirect("/post-job?payment=failed");
    }
  });

  app.post("/api/agent/buy-post-credits/flutterwave", isAuthenticated, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user || user.role !== "agent") {
      return res.status(403).json({ message: "Only agents can buy post credits" });
    }
    const credits = Number(req.body.credits) || 1;
    try {
      const settings = await storage.getAllPlatformSettings();
      const baseFee = Number(settings.agent_job_post_fee || "5000");
      const discount = Number(settings.agent_job_post_discount || "0");
      const feePerPost = Math.round(baseFee * (1 - discount / 100));
      const totalAmount = feePerPost * credits;
      const txRef = `agent_credit_${user.id}_${Date.now()}`;
      const siteUrl = process.env.REPLIT_DOMAINS
        ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
        : `${req.protocol}://${req.get("host")}`;
      const flwRes = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_ref: txRef,
          amount: totalAmount,
          currency: "NGN",
          redirect_url: `${siteUrl}/api/agent/verify-post-payment/flutterwave`,
          customer: { email: user.email, name: `${user.firstName} ${user.lastName}` },
          meta: { userId: user.id, credits, type: "agent_post_credit" },
          customizations: { title: "Iṣéyá Agent Post Credit", description: `Purchase ${credits} job post credit(s)` },
        }),
      });
      const data = await flwRes.json();
      if (data.status === "success") {
        return res.json({ url: data.data.link, reference: txRef });
      }
      return res.status(400).json({ message: data.message || "Flutterwave init failed" });
    } catch (err) {
      console.error("Agent credit Flutterwave init error:", err);
      res.status(500).json({ message: "Failed to initialize payment" });
    }
  });

  app.get("/api/agent/verify-post-payment/flutterwave", isAuthenticated, async (req, res) => {
    const transactionId = req.query.transaction_id as string;
    if (!transactionId) return res.redirect("/post-job?payment=failed");
    try {
      const verifyRes = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
        headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
      });
      const data = await verifyRes.json();
      if (data.status === "success" && data.data.status === "successful") {
        const meta = data.data.meta || {};
        const userId = req.session.userId!;
        const credits = Number(meta.credits) || 1;
        const user = await storage.getUser(userId);
        if (user && user.role === "agent") {
          const current = (user as any).agentPostCredits || 0;
          await storage.updateUser(userId, { agentPostCredits: current + credits } as any);
        }
        await storage.createTransaction({
          userId,
          type: "agent_post_credit",
          gateway: "flutterwave",
          reference: data.data.tx_ref || data.data.flw_ref || String(transactionId),
          amount: Math.round((data.data.amount || 0) * 100),
          currency: "NGN",
          status: "success",
          metadata: JSON.stringify({ credits }),
        });
        return res.redirect("/post-job?payment=success");
      }
      return res.redirect("/post-job?payment=failed");
    } catch (err) {
      console.error("Agent credit Flutterwave verify error:", err);
      return res.redirect("/post-job?payment=failed");
    }
  });

  // === ADMIN AGENT CREDIT MANAGEMENT ===

  app.get("/api/admin/agent-credits", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageAgentCredits) {
      return res.status(403).json({ message: "You don't have permission to manage agent credits" });
    }
    const allUsers = await storage.getAllUsers();
    const agents = allUsers.filter(u => u.role === "agent");
    const result = agents.map(a => ({
      id: a.id,
      firstName: a.firstName,
      lastName: a.lastName,
      email: a.email,
      agencyName: a.agencyName,
      phone: a.phone,
      agentPostCredits: a.agentPostCredits || 0,
      subscriptionStatus: a.subscriptionStatus,
      createdAt: a.createdAt,
    }));
    res.json(result);
  });

  app.patch("/api/admin/agent-credits/:userId", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageAgentCredits) {
      return res.status(403).json({ message: "You don't have permission to manage agent credits" });
    }
    const { userId } = req.params;
    const { action, amount, reason } = req.body;
    if (!action || !amount || typeof amount !== "number" || amount < 1) {
      return res.status(400).json({ message: "Valid action and amount are required" });
    }
    const targetUser = await storage.getUser(userId);
    if (!targetUser || targetUser.role !== "agent") {
      return res.status(404).json({ message: "Agent not found" });
    }
    const current = targetUser.agentPostCredits || 0;
    let newCredits: number;
    if (action === "add") {
      newCredits = current + amount;
    } else if (action === "deduct") {
      newCredits = Math.max(0, current - amount);
    } else if (action === "set") {
      newCredits = Math.max(0, amount);
    } else {
      return res.status(400).json({ message: "Invalid action. Use 'add', 'deduct', or 'set'" });
    }
    await storage.updateUser(userId, { agentPostCredits: newCredits } as any);

    storage.createNotification({
      title: action === "add" ? "Post Credits Added" : action === "deduct" ? "Post Credits Deducted" : "Post Credits Updated",
      message: action === "add"
        ? `${amount} job post credit${amount !== 1 ? "s" : ""} have been added to your account by the admin team.${reason ? ` Reason: ${reason}` : ""}`
        : action === "deduct"
        ? `${amount} job post credit${amount !== 1 ? "s" : ""} have been deducted from your account.${reason ? ` Reason: ${reason}` : ""}`
        : `Your job post credits have been set to ${newCredits}.${reason ? ` Reason: ${reason}` : ""}`,
      type: "individual",
      targetRole: null,
      targetUserId: userId,
      createdBy: req.session.userId!,
    }).catch(() => {});

    res.json({ message: "Credits updated", previousCredits: current, newCredits, action, amount });
  });

  // Admin: Get all verification requests
  app.get("/api/admin/verification-requests", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageVerifications) {
      return res.status(403).json({ message: "You don't have permission to manage verifications" });
    }
    const status = req.query.status as string | undefined;
    let requests = await storage.getAllVerificationRequests(status ? { status } : undefined);
    if (!status) {
      requests = requests.filter(r => r.status !== "awaiting_payment");
    }
    const enriched = await Promise.all(requests.map(async (r) => {
      const user = await storage.getUser(r.userId);
      return {
        ...r,
        userName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Unknown",
        userEmail: user?.email || "Unknown",
        userProfileImage: user?.profileImageUrl || null,
      };
    }));
    res.json(enriched);
  });

  // Admin: Review verification request (approve/reject)
  app.patch("/api/admin/verification-requests/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageVerifications) {
      return res.status(403).json({ message: "You don't have permission to manage verifications" });
    }

    const { status, adminNotes } = req.body;
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
    }

    const requestId = Number(req.params.id);
    if (isNaN(requestId)) return res.status(400).json({ message: "Invalid verification request ID" });
    const request = await storage.getVerificationRequest(requestId);
    if (!request) return res.status(404).json({ message: "Verification request not found" });

    if (request.status === "awaiting_payment") {
      return res.status(400).json({ message: "Cannot review this request — applicant has not completed payment yet" });
    }

    const updated = await storage.updateVerificationRequest(request.id, {
      status,
      adminNotes: adminNotes || null,
      reviewedBy: req.session.userId!,
      reviewedAt: new Date(),
    });

    if (status === "approved") {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      await storage.updateUser(request.userId, { isVerified: true, verificationExpiry: expiryDate });
    }

    logActivity({ req, action: `verification_${status}`, category: "verifications", description: `Admin ${status} verification for user ${request.userId}`, targetType: "verification", targetId: String(request.id) });
    res.json(updated);

    const verifiedUser = await storage.getUser(request.userId);
    if (verifiedUser?.email) {
      const userName = `${verifiedUser.firstName || ""} ${verifiedUser.lastName || ""}`.trim() || "User";
      if (status === "approved") {
        sendVerificationApprovedEmail(verifiedUser.email, userName).catch(() => {});
      } else {
        sendVerificationRejectedEmail(verifiedUser.email, userName, adminNotes).catch(() => {});
      }
    }
  });

  // Admin: Get all applicants with verification status
  app.get("/api/admin/applicants-verification", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageVerifications) {
      return res.status(403).json({ message: "You don't have permission to manage verifications" });
    }
    const allUsers = await storage.getAllUsers({ role: "applicant" });
    const now = new Date();
    const enriched = allUsers.map((u) => {
      const isExpired = u.verificationExpiry ? new Date(u.verificationExpiry) < now : false;
      return {
        id: u.id,
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        email: u.email || "",
        profileImageUrl: u.profileImageUrl || null,
        phone: u.phone || null,
        isVerified: u.isVerified && !isExpired,
        verificationExpiry: u.verificationExpiry || null,
        isExpired,
        isSuspended: u.isSuspended || false,
        createdAt: u.createdAt,
      };
    });
    res.json(enriched);
  });

  // Admin: Manually verify/unverify an applicant and set expiry
  app.patch("/api/admin/applicants-verification/:userId", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageVerifications) {
      return res.status(403).json({ message: "You don't have permission to manage verifications" });
    }
    const { userId } = req.params;
    const { isVerified, verificationExpiry } = req.body;

    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "applicant") return res.status(400).json({ message: "Only applicants can be verified" });

    const updates: any = {};
    if (typeof isVerified === "boolean") {
      updates.isVerified = isVerified;
      if (!isVerified) {
        updates.verificationExpiry = null;
      }
    }
    if (verificationExpiry) {
      updates.verificationExpiry = new Date(verificationExpiry);
    }

    await storage.updateUser(userId, updates);
    const updated = await storage.getUser(userId);

    if (isVerified && updated?.email) {
      const userName = `${updated.firstName || ""} ${updated.lastName || ""}`.trim() || "User";
      sendVerificationApprovedEmail(updated.email, userName).catch(() => {});
    }

    res.json({
      message: isVerified ? "Applicant verified successfully" : "Verification removed",
      user: {
        id: updated?.id,
        isVerified: updated?.isVerified,
        verificationExpiry: updated?.verificationExpiry,
      },
    });
  });

  // ============ NOTIFICATION ROUTES ============

  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const notifs = await storage.getNotificationsForUser(userId, user.role || "applicant");
    res.json(notifs);
  });

  app.get("/api/notifications/unread-count", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const count = await storage.getUnreadCountForUser(userId, user.role || "applicant");
    res.json({ count });
  });

  app.post("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const notificationId = parseInt(req.params.id);
    if (isNaN(notificationId)) return res.status(400).json({ message: "Invalid notification ID" });
    await storage.markNotificationRead(notificationId, userId);
    res.json({ success: true });
  });

  app.post("/api/notifications/read-all", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    await storage.markAllNotificationsRead(userId, user.role || "applicant");
    res.json({ success: true });
  });

  app.get("/api/admin/notifications", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageNotifications) {
      return res.status(403).json({ message: "You do not have permission to manage notifications" });
    }
    const notifs = await storage.getAllNotifications();
    res.json(notifs);
  });

  app.post("/api/admin/notifications", isAuthenticated, isAdmin, uploadEmailPromo.single("image"), async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageNotifications) {
      return res.status(403).json({ message: "You do not have permission to manage notifications" });
    }
    const adminUserId = req.session.userId!;
    const { title, message, type, targetRole, targetEmail, delivery } = req.body;
    if (!title || !message) return res.status(400).json({ message: "Title and message are required" });
    const validTypes = ["all", "role", "individual"];
    if (type && !validTypes.includes(type)) return res.status(400).json({ message: "Invalid notification type" });
    if (type === "role" && !targetRole) return res.status(400).json({ message: "Target role is required for role-based notifications" });

    let targetUserId: string | null = null;
    if (type === "individual") {
      if (!targetEmail) return res.status(400).json({ message: "Email is required for individual notifications" });
      const [foundUser] = await db.select().from(users).where(eq(users.email, targetEmail.trim().toLowerCase()));
      if (!foundUser) return res.status(404).json({ message: `No user found with email: ${targetEmail}` });
      targetUserId = foundUser.id;
    }

    const deliveryMethod = delivery || "internal";
    const sendInternal = deliveryMethod === "internal" || deliveryMethod === "both";
    const sendExternal = deliveryMethod === "external" || deliveryMethod === "both";
    const imagePath = req.file ? req.file.path : undefined;

    let notification = null;
    if (sendInternal) {
      notification = await storage.createNotification({
        title,
        message,
        type: type || "all",
        targetRole: targetRole || null,
        targetUserId,
        createdBy: adminUserId,
      });
    }

    let emailResult = { sent: 0, total: 0 };
    if (sendExternal) {
      const { runNewsPush } = await import("./scheduler");
      if (type === "individual" && targetUserId) {
        const targetUser = await storage.getUser(targetUserId);
        if (targetUser?.email) {
          const { Resend } = await import("resend");
          const apiKey = process.env.RESEND_API_KEY;
          if (apiKey) {
            try {
              const client = new Resend(apiKey);
              const emailPayload: any = {
                from: "Iseya <support@iseya.ng>",
                to: [targetUser.email],
                subject: `${title} | Iṣéyá`,
                html: `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;">
                  <div style="background:#d4a017;padding:24px 32px;text-align:center;">
                    <h2 style="color:#fff;margin:0;font-size:20px;">Iṣéyá</h2>
                    <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px;">Hire Talent, Get Hired</p>
                  </div>
                  <div style="padding:32px 32px 16px;">
                    <h2 style="color:#333;margin:0 0 16px;font-size:20px;">${title}</h2>
                    <div style="color:#555;font-size:14px;line-height:1.6;">${message}</div>
                  </div>
                  <div style="border-top:1px solid #eee;padding:20px 32px;text-align:center;">
                    <p style="color:#999;font-size:12px;margin:0;">© ${new Date().getFullYear()} Iṣéyá. All rights reserved.</p>
                  </div>
                </div>`,
              };
              if (imagePath) {
                const fsSync = await import("fs");
                const pathMod = await import("path");
                if (fsSync.existsSync(imagePath)) {
                  emailPayload.attachments = [{
                    filename: pathMod.basename(imagePath),
                    content: fsSync.readFileSync(imagePath),
                  }];
                }
              }
              const { error } = await client.emails.send(emailPayload);
              emailResult = { sent: error ? 0 : 1, total: 1 };
            } catch (e) {
              console.error("Individual email send error:", e);
            }
          }
        }
      } else {
        const role = type === "role" ? targetRole : undefined;
        emailResult = await runNewsPush(title, message, role, imagePath);
      }
    }

    const responseMsg = [];
    if (sendInternal) responseMsg.push("In-app notification sent");
    if (sendExternal) responseMsg.push(`Email sent to ${emailResult.sent}/${emailResult.total} users`);

    res.json({ notification, message: responseMsg.join(". "), emailResult });
  });

  app.delete("/api/admin/notifications/all", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageNotifications) {
      return res.status(403).json({ message: "You do not have permission to manage notifications" });
    }
    await storage.deleteAllAdminNotifications();
    res.json({ success: true });
  });

  app.delete("/api/admin/notifications/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageNotifications) {
      return res.status(403).json({ message: "You do not have permission to manage notifications" });
    }
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid notification ID" });
    await storage.deleteNotification(id);
    res.json({ success: true });
  });

  // ============ TRANSACTION ROUTES ============

  app.get("/api/admin/transactions", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageTransactions) {
      return res.status(403).json({ message: "You do not have permission to manage transactions" });
    }
    const { type, status, gateway } = req.query as { type?: string; status?: string; gateway?: string };
    const filters: { type?: string; status?: string; gateway?: string } = {};
    if (type && type !== "all") filters.type = type;
    if (status && status !== "all") filters.status = status;
    if (gateway && gateway !== "all") filters.gateway = gateway;
    const txns = await storage.getAllTransactions(Object.keys(filters).length > 0 ? filters : undefined);
    const usersMap = new Map<string, User>();
    for (const t of txns) {
      if (!usersMap.has(t.userId)) {
        const u = await storage.getUser(t.userId);
        if (u) usersMap.set(t.userId, u);
      }
    }
    const result = txns.map(t => {
      const u = usersMap.get(t.userId);
      return {
        ...t,
        amount: t.amount / 100,
        userName: u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email : "Unknown",
        userEmail: u?.email || "",
      };
    });
    res.json(result);
  });

  app.get("/api/admin/transactions/stats", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageTransactions) {
      return res.status(403).json({ message: "You do not have permission to manage transactions" });
    }
    const stats = await storage.getTransactionStats();
    res.json({
      ...stats,
      totalRevenue: stats.totalRevenue / 100,
      subscriptionRevenue: stats.subscriptionRevenue / 100,
      verificationRevenue: stats.verificationRevenue / 100,
      agentCreditRevenue: stats.agentCreditRevenue / 100,
      monthlyRevenue: stats.monthlyRevenue.map(m => ({
        ...m,
        subscriptions: m.subscriptions / 100,
        verifications: m.verifications / 100,
        agentCredits: m.agentCredits / 100,
        total: m.total / 100,
      })),
    });
  });

  // Admin: Resolve a failed/pending transaction (mark as success and apply benefits)
  app.patch("/api/admin/transactions/:id/resolve", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageTransactions) {
      return res.status(403).json({ message: "You do not have permission to manage transactions" });
    }

    const txnId = Number(req.params.id);
    if (isNaN(txnId)) return res.status(400).json({ message: "Invalid transaction ID" });

    const txn = await storage.getTransaction(txnId);
    if (!txn) return res.status(404).json({ message: "Transaction not found" });

    if (txn.status === "success") {
      return res.status(400).json({ message: "Transaction is already successful" });
    }

    const adminNote = req.body.adminNote || "";

    try {
      let existingMeta: any = {};
      try { existingMeta = txn.metadata ? JSON.parse(txn.metadata) : {}; } catch {}
      const resolvedMeta = JSON.stringify({
        ...existingMeta,
        resolvedBy: req.session.userId,
        resolvedAt: new Date().toISOString(),
        adminNote: adminNote || undefined,
        originalStatus: txn.status,
      });
      const updatedTxn = await storage.updateTransactionStatus(txnId, "success", resolvedMeta);

      const user = await storage.getUser(txn.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found for this transaction" });
      }

      if (txn.type === "subscription" && txn.plan) {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        await storage.updateUser(txn.userId, {
          subscriptionStatus: txn.plan,
          subscriptionEndDate: endDate,
        });

        storage.createNotification({
          title: "Subscription Activated",
          message: `Your ${txn.plan.charAt(0).toUpperCase() + txn.plan.slice(1)} plan subscription has been activated by the admin team. Enjoy your new benefits!`,
          type: "individual",
          targetRole: null,
          targetUserId: txn.userId,
          createdBy: req.session.userId!,
        }).catch(() => {});
      } else if (txn.type === "verification") {
        let metadata: any = {};
        try { metadata = txn.metadata ? JSON.parse(txn.metadata) : {}; } catch {}
        if (metadata.requestId) {
          await storage.updateVerificationRequest(Number(metadata.requestId), { status: "pending" });
        }

        storage.createNotification({
          title: "Verification Payment Confirmed",
          message: "Your verification payment has been confirmed by the admin team. Your verification is now pending review.",
          type: "individual",
          targetRole: null,
          targetUserId: txn.userId,
          createdBy: req.session.userId!,
        }).catch(() => {});
      } else if (txn.type === "agent_post_credit") {
        let metadata: any = {};
        try { metadata = txn.metadata ? JSON.parse(txn.metadata) : {}; } catch {}
        const credits = metadata.credits || 1;
        const current = user.agentPostCredits || 0;
        await storage.updateUser(txn.userId, { agentPostCredits: current + credits } as any);

        storage.createNotification({
          title: "Post Credits Added",
          message: `${credits} job post credit${credits !== 1 ? "s" : ""} have been added to your account by the admin team.`,
          type: "individual",
          targetRole: null,
          targetUserId: txn.userId,
          createdBy: req.session.userId!,
        }).catch(() => {});
      }

      res.json({ message: "Transaction resolved successfully", transaction: updatedTxn });
    } catch (err) {
      console.error("Failed to resolve transaction:", err);
      res.status(500).json({ message: "Failed to resolve transaction" });
    }
  });

  // ============ PLATFORM SETTINGS ROUTES ============

  const DEFAULT_SETTINGS: Record<string, string> = {
    "subscription_standard_price": "9999",
    "subscription_premium_price": "24999",
    "subscription_enterprise_price": "44999",
    "subscription_standard_discount": "0",
    "subscription_premium_discount": "0",
    "subscription_enterprise_discount": "0",
    "verification_fee": "9999",
    "verification_discount": "0",
    "job_limit_free": "1",
    "job_limit_standard": "5",
    "job_limit_premium": "10",
    "job_limit_enterprise": "-1",
    "interview_credits_free": "0",
    "interview_credits_standard": "0",
    "interview_credits_premium": "3",
    "interview_credits_enterprise": "5",
    "agent_job_post_fee": "5000",
    "agent_job_post_discount": "0",
    "app_phone": "",
    "app_email": "",
    "app_address": "",
    "app_facebook": "",
    "app_twitter": "",
    "app_instagram": "",
    "app_linkedin": "",
    "app_tiktok": "",
    "app_whatsapp": "",
    "paystack_public_key": "",
    "paystack_secret_key": "",
    "flutterwave_public_key": "",
    "flutterwave_secret_key": "",
    "youtube_landing": "",
    "youtube_employers": "",
    "youtube_agents": "",
    "youtube_applicants": "",
    "hide_unverified_details": "true",
    "restrict_free_employer_management": "true",
    "footer_about_description": "Connecting Nigerian workers with opportunities. Find casual jobs or hire reliable workers through our trusted platform.",
    "auto_weekly_job_alerts": "true",
    "auto_application_reminders": "true",
    "auto_profile_reminders": "true",
    "job_alerts_schedule_days": "1",
    "job_alerts_schedule_time": "08:00",
    "app_reminders_schedule_days": "3,5",
    "app_reminders_schedule_time": "08:00",
    "profile_reminders_schedule_days": "2,4",
    "profile_reminders_schedule_time": "10:00",
  };

  const BOOLEAN_SETTINGS_KEYS = new Set([
    "hide_unverified_details",
    "restrict_free_employer_management",
    "auto_weekly_job_alerts",
    "auto_application_reminders",
    "auto_profile_reminders",
  ]);

  const TEXT_SETTINGS_KEYS = new Set([
    "app_phone", "app_email", "app_address", "footer_about_description",
    "job_alerts_schedule_days", "job_alerts_schedule_time",
    "app_reminders_schedule_days", "app_reminders_schedule_time",
    "profile_reminders_schedule_days", "profile_reminders_schedule_time",
    "app_facebook", "app_twitter", "app_instagram", "app_linkedin", "app_tiktok", "app_whatsapp",
    "paystack_public_key", "paystack_secret_key",
    "flutterwave_public_key", "flutterwave_secret_key",
    "youtube_landing", "youtube_employers", "youtube_agents", "youtube_applicants",
  ]);

  async function getSettingValue(key: string): Promise<string> {
    const val = await storage.getSetting(key);
    return val ?? DEFAULT_SETTINGS[key] ?? "0";
  }

  // === INTERNAL ADS ===

  app.get("/api/platform-settings", async (_req, res) => {
    try {
      const settings = await storage.getAllPlatformSettings();
      const baseFee = Number(settings.agent_job_post_fee || "5000");
      const discount = Number(settings.agent_job_post_discount || "0");
      const discountedFee = Math.round(baseFee * (1 - discount / 100));
      res.json({ agent_job_post_fee: String(baseFee), agent_job_post_discount: settings.agent_job_post_discount || "0", agent_job_post_final: String(discountedFee) });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.get("/api/ads", async (req, res) => {
    try {
      const page = req.query.page as string;
      if (!page) return res.status(400).json({ message: "Page parameter is required" });
      const ads = await storage.getActiveAdsForPage(page);
      res.json(ads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ads" });
    }
  });

  app.get("/api/admin/ads", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageSettings) {
      return res.status(403).json({ message: "You do not have permission to manage ads" });
    }
    const ads = await storage.getAllAds();
    res.json(ads);
  });

  app.post("/api/admin/ads", isAuthenticated, isAdmin, uploadAdMedia.single("image"), async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageSettings) {
      return res.status(403).json({ message: "You do not have permission to manage ads" });
    }
    try {
      let targetPages = req.body.targetPages;
      if (typeof targetPages === "string") {
        try { targetPages = JSON.parse(targetPages); } catch { targetPages = [targetPages]; }
      }
      const adType = req.body.type;
      let position = req.body.position;
      if (typeof position === "string") {
        try { position = JSON.parse(position); } catch { position = [position]; }
      }
      const adSchema = z.object({
        title: adType === "popup" ? z.string().min(1, "Title is required") : z.string().optional().default(""),
        content: adType === "popup" ? z.string().min(1, "Content is required") : z.string().optional().default(""),
        type: z.enum(["banner", "popup"]),
        targetPages: z.array(z.string()).min(1, "Select at least one target page"),
        linkUrl: z.string().nullable().optional(),
        linkText: z.string().nullable().optional(),
        bgColor: z.string().nullable().optional(),
        textColor: z.string().nullable().optional(),
        position: z.array(z.enum(["top", "middle", "bottom", "right"])).min(1, "Select at least one position").optional(),
        bannerWidth: z.preprocess((v) => typeof v === "string" ? parseInt(v) || 250 : v, z.number()).optional(),
        bannerHeight: z.preprocess((v) => typeof v === "string" ? parseInt(v) || 92 : v, z.number()).optional(),
        popupWidth: z.preprocess((v) => typeof v === "string" ? parseInt(v) || 400 : v, z.number()).optional(),
        popupHeight: z.preprocess((v) => typeof v === "string" ? parseInt(v) || 500 : v, z.number()).optional(),
        isActive: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
        priority: z.preprocess((v) => typeof v === "string" ? parseInt(v) || 0 : v, z.number()).optional(),
        startDate: z.string().nullable().optional(),
        endDate: z.string().nullable().optional(),
      });
      const input = adSchema.parse({ ...req.body, targetPages, position });
      const imageUrl = req.file ? `/uploads/ads/${req.file.filename}` : null;
      if (req.file) storeFileInDb(imageUrl!, req.file.path).catch(() => {});
      const ad = await storage.createAd({
        ...input,
        linkUrl: input.linkUrl && input.linkUrl.trim() ? input.linkUrl : null,
        linkText: input.linkText && input.linkText.trim() ? input.linkText : null,
        bgColor: input.bgColor && input.bgColor.trim() ? input.bgColor : null,
        textColor: input.textColor && input.textColor.trim() ? input.textColor : null,
        imageUrl,
        position: input.position || ["top"],
        bannerWidth: input.bannerWidth ?? 250,
        bannerHeight: input.bannerHeight ?? 92,
        popupWidth: input.popupWidth ?? 400,
        popupHeight: input.popupHeight ?? 500,
        isActive: input.isActive ?? true,
        priority: input.priority ?? 0,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        createdBy: req.session.userId!,
      });
      res.status(201).json(ad);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create ad" });
    }
  });

  app.patch("/api/admin/ads/:id", isAuthenticated, isAdmin, uploadAdMedia.single("image"), async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageSettings) {
      return res.status(403).json({ message: "You do not have permission to manage ads" });
    }
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ad ID" });
    try {
      const existing = await storage.getAd(id);
      if (!existing) return res.status(404).json({ message: "Ad not found" });
      let targetPages = req.body.targetPages;
      if (targetPages !== undefined) {
        if (typeof targetPages === "string") {
          try { targetPages = JSON.parse(targetPages); } catch { targetPages = [targetPages]; }
        }
      }
      let position = req.body.position;
      if (position !== undefined) {
        if (typeof position === "string") {
          try { position = JSON.parse(position); } catch { position = [position]; }
        }
      }
      const updateSchema = z.object({
        title: z.string().optional(),
        content: z.string().optional(),
        type: z.enum(["banner", "popup"]).optional(),
        targetPages: z.array(z.string()).min(1).optional(),
        linkUrl: z.string().nullable().optional(),
        linkText: z.string().nullable().optional(),
        bgColor: z.string().nullable().optional(),
        textColor: z.string().nullable().optional(),
        position: z.array(z.enum(["top", "middle", "bottom", "right"])).min(1).optional(),
        bannerWidth: z.preprocess((v) => typeof v === "string" ? parseInt(v) || 250 : v, z.number()).optional(),
        bannerHeight: z.preprocess((v) => typeof v === "string" ? parseInt(v) || 92 : v, z.number()).optional(),
        popupWidth: z.preprocess((v) => typeof v === "string" ? parseInt(v) || 400 : v, z.number()).optional(),
        popupHeight: z.preprocess((v) => typeof v === "string" ? parseInt(v) || 500 : v, z.number()).optional(),
        isActive: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
        priority: z.preprocess((v) => typeof v === "string" ? parseInt(v) || 0 : v, z.number()).optional(),
        startDate: z.string().nullable().optional(),
        endDate: z.string().nullable().optional(),
        removeImage: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
      });
      const parsed = updateSchema.parse({ ...req.body, ...(targetPages !== undefined ? { targetPages } : {}), ...(position !== undefined ? { position } : {}) });
      const updates: any = { ...parsed };
      delete updates.removeImage;
      if (updates.startDate !== undefined) updates.startDate = updates.startDate ? new Date(updates.startDate) : null;
      if (updates.endDate !== undefined) updates.endDate = updates.endDate ? new Date(updates.endDate) : null;
      if (req.file) {
        updates.imageUrl = `/uploads/ads/${req.file.filename}`;
        storeFileInDb(updates.imageUrl, req.file.path).catch(() => {});
      } else if (parsed.removeImage) {
        updates.imageUrl = null;
      }
      const updated = await storage.updateAd(id, updates);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to update ad" });
    }
  });

  app.delete("/api/admin/ads/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageSettings) {
      return res.status(403).json({ message: "You do not have permission to manage ads" });
    }
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ad ID" });
    try {
      await storage.deleteAd(id);
      res.json({ message: "Ad deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete ad" });
    }
  });

  // === GOOGLE ADS MANAGEMENT ===

  app.get("/api/google-ads/codes", async (_req, res) => {
    try {
      const settings = await storage.getAllPlatformSettings();
      res.json({
        adsenseHeaderScript: settings.google_adsense_header_script || "",
        gadsTrackingId: settings.google_ads_tracking_id || "",
        gadsHeaderScript: settings.google_ads_header_script || "",
        gaMeasurementId: settings.google_analytics_measurement_id || "",
        gaScript: settings.google_analytics_script || "",
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Google Ad codes" });
    }
  });

  app.get("/api/google-ads", async (req, res) => {
    try {
      const page = req.query.page as string;
      if (!page) return res.status(400).json({ message: "Page parameter is required" });
      const settings = await storage.getAllPlatformSettings();
      const publisherId = settings.google_adsense_publisher_id;
      if (!publisherId) return res.json({ publisherId: null, placements: [] });
      const placements = await storage.getActiveGoogleAdsForPage(page);
      res.json({ publisherId, placements });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Google Ads" });
    }
  });

  app.get("/api/admin/google-ads", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageSettings) {
      return res.status(403).json({ message: "You do not have permission to manage ads" });
    }
    try {
      const placements = await storage.getAllGoogleAdPlacements();
      const settings = await storage.getAllPlatformSettings();
      res.json({
        publisherId: settings.google_adsense_publisher_id || "",
        adsenseHeaderScript: settings.google_adsense_header_script || "",
        gadsTrackingId: settings.google_ads_tracking_id || "",
        gadsHeaderScript: settings.google_ads_header_script || "",
        gaMeasurementId: settings.google_analytics_measurement_id || "",
        gaScript: settings.google_analytics_script || "",
        placements,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Google Ads" });
    }
  });

  app.post("/api/admin/google-ads/settings", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageSettings) {
      return res.status(403).json({ message: "You do not have permission to manage ads" });
    }
    try {
      const { publisherId, adsenseHeaderScript, gadsTrackingId, gadsHeaderScript, gaMeasurementId, gaScript } = req.body;
      if (typeof publisherId === "string") {
        await storage.upsertSetting("google_adsense_publisher_id", publisherId.trim(), req.session.userId!);
      }
      if (typeof adsenseHeaderScript === "string") {
        await storage.upsertSetting("google_adsense_header_script", adsenseHeaderScript, req.session.userId!);
      }
      if (typeof gadsTrackingId === "string") {
        await storage.upsertSetting("google_ads_tracking_id", gadsTrackingId.trim(), req.session.userId!);
      }
      if (typeof gadsHeaderScript === "string") {
        await storage.upsertSetting("google_ads_header_script", gadsHeaderScript, req.session.userId!);
      }
      if (typeof gaMeasurementId === "string") {
        await storage.upsertSetting("google_analytics_measurement_id", gaMeasurementId.trim(), req.session.userId!);
      }
      if (typeof gaScript === "string") {
        await storage.upsertSetting("google_analytics_script", gaScript, req.session.userId!);
      }
      res.json({ message: "Settings saved" });
    } catch (error) {
      res.status(500).json({ message: "Failed to save settings" });
    }
  });

  app.post("/api/admin/google-ads", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageSettings) {
      return res.status(403).json({ message: "You do not have permission to manage ads" });
    }
    try {
      const placementSchema = z.object({
        name: z.string().min(1, "Name is required"),
        adSlotId: z.string().min(1, "Ad Slot ID is required"),
        adFormat: z.enum(["auto", "horizontal", "vertical", "rectangle", "fluid"]).default("auto"),
        targetPages: z.array(z.string()).min(1, "Select at least one page"),
        position: z.array(z.enum(["top", "middle", "bottom", "right"])).min(1, "Select at least one position").default(["right"]),
        isActive: z.boolean().default(true),
        isResponsive: z.boolean().default(true),
        customWidth: z.number().nullable().optional(),
        customHeight: z.number().nullable().optional(),
      });
      const input = placementSchema.parse(req.body);
      const placement = await storage.createGoogleAdPlacement({
        ...input,
        createdBy: req.session.userId!,
      });
      res.status(201).json(placement);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to create placement" });
    }
  });

  app.patch("/api/admin/google-ads/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageSettings) {
      return res.status(403).json({ message: "You do not have permission to manage ads" });
    }
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    try {
      const existing = await storage.getGoogleAdPlacement(id);
      if (!existing) return res.status(404).json({ message: "Placement not found" });
      const updateSchema = z.object({
        name: z.string().optional(),
        adSlotId: z.string().optional(),
        adFormat: z.enum(["auto", "horizontal", "vertical", "rectangle", "fluid"]).optional(),
        targetPages: z.array(z.string()).min(1).optional(),
        position: z.array(z.enum(["top", "middle", "bottom", "right"])).min(1).optional(),
        isActive: z.boolean().optional(),
        isResponsive: z.boolean().optional(),
        customWidth: z.number().nullable().optional(),
        customHeight: z.number().nullable().optional(),
      });
      const updates = updateSchema.parse(req.body);
      const updated = await storage.updateGoogleAdPlacement(id, updates);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to update placement" });
    }
  });

  app.delete("/api/admin/google-ads/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageSettings) {
      return res.status(403).json({ message: "You do not have permission to manage ads" });
    }
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    try {
      await storage.deleteGoogleAdPlacement(id);
      res.json({ message: "Placement deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete placement" });
    }
  });

  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email is required" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const normalizedEmail = email.toLowerCase().trim();
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }
      const [existingUser] = await db.select().from(users).where(eq(users.email, normalizedEmail));
      if (existingUser) {
        await storage.updateUser(existingUser.id, { subscribedToNewsletter: true });
      } else {
        await storage.addNewsletterSubscriber(normalizedEmail);
      }
      res.json({ message: "Successfully subscribed to newsletter!" });
    } catch (error: any) {
      console.error("Newsletter subscribe error:", error);
      res.status(500).json({ message: "Failed to subscribe. Please try again." });
    }
  });

  app.get("/api/settings/public", async (_req, res) => {
    const sensitiveKeys = new Set(["paystack_public_key", "paystack_secret_key", "flutterwave_public_key", "flutterwave_secret_key"]);
    const keys = Object.keys(DEFAULT_SETTINGS);
    const result: Record<string, string> = {};
    for (const key of keys) {
      if (sensitiveKeys.has(key)) continue;
      result[key] = await getSettingValue(key);
    }
    res.json(result);
  });

  app.get("/api/admin/settings", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageSettings) {
      return res.status(403).json({ message: "You do not have permission to view platform settings" });
    }
    const settings = await storage.getAllSettings();
    const result: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const s of settings) {
      result[s.key] = s.value;
    }
    res.json(result);
  });

  app.patch("/api/admin/settings", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageSettings) {
      return res.status(403).json({ message: "You do not have permission to modify platform settings" });
    }
    const userId = req.session.userId!;
    const updates = req.body as Record<string, string>;
    if (!updates || typeof updates !== "object") return res.status(400).json({ message: "Invalid settings data" });
    const validKeys = Object.keys(DEFAULT_SETTINGS);
    for (const [key, value] of Object.entries(updates)) {
      if (!validKeys.includes(key)) continue;
      if (BOOLEAN_SETTINGS_KEYS.has(key)) {
        await storage.upsertSetting(key, value === "true" ? "true" : "false", userId);
      } else if (TEXT_SETTINGS_KEYS.has(key)) {
        await storage.upsertSetting(key, String(value || "").trim(), userId);
      } else {
        const numVal = parseFloat(value);
        if (isNaN(numVal)) continue;
        if (key.startsWith("job_limit_")) {
          if (!Number.isInteger(numVal) || numVal < -1) continue;
        } else if (key.startsWith("interview_credits_")) {
          if (!Number.isInteger(numVal) || numVal < 0) continue;
        } else {
          if (numVal < 0) continue;
          if (key.includes("discount") && numVal > 100) continue;
        }
        await storage.upsertSetting(key, String(numVal), userId);
      }
    }
    const settings = await storage.getAllSettings();
    const result: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const s of settings) {
      result[s.key] = s.value;
    }
    logActivity({ req, action: "update_settings", category: "settings", description: `Admin updated platform settings: ${Object.keys(updates).join(", ")}`, metadata: updates });
    res.json(result);
  });

  // === AUTOMATED EMAILS ===

  app.post("/api/admin/automated-emails/job-alerts", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageAutomatedEmails) {
      return res.status(403).json({ message: "You do not have permission to manage automated emails" });
    }
    try {
      const { runWeeklyJobAlerts } = await import("./scheduler");
      const result = await runWeeklyJobAlerts();
      res.json({ message: `Job alerts sent to ${result.sent} of ${result.total} applicants.`, ...result });
    } catch (err: any) {
      console.error("Manual job alert trigger error:", err);
      res.status(500).json({ message: "Failed to send job alerts" });
    }
  });

  app.post("/api/admin/automated-emails/application-reminders", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageAutomatedEmails) {
      return res.status(403).json({ message: "You do not have permission to manage automated emails" });
    }
    try {
      const { runApplicationReminders } = await import("./scheduler");
      const result = await runApplicationReminders();
      res.json({ message: `Reminders sent to ${result.sent} of ${result.total} applicants.`, ...result });
    } catch (err: any) {
      console.error("Manual reminder trigger error:", err);
      res.status(500).json({ message: "Failed to send reminders" });
    }
  });

  app.post("/api/admin/automated-emails/profile-reminders", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageAutomatedEmails) {
      return res.status(403).json({ message: "You do not have permission to manage automated emails" });
    }
    try {
      const { runProfileReminders } = await import("./scheduler");
      const result = await runProfileReminders();
      res.json({ message: `Profile reminders sent to ${result.sent} of ${result.total} users with incomplete profiles.`, ...result });
    } catch (err: any) {
      console.error("Manual profile reminder trigger error:", err);
      res.status(500).json({ message: "Failed to send profile reminders" });
    }
  });

  app.post("/api/admin/automated-emails/news-push", isAuthenticated, isAdmin, uploadEmailPromo.single("image"), async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageAutomatedEmails) {
      return res.status(403).json({ message: "You do not have permission to send news push" });
    }
    try {
      const title = req.body.title;
      const content = req.body.content;
      const targetRole = req.body.targetRole;
      const sendNotification = req.body.sendNotification === "true";

      if (!title || !title.trim()) return res.status(400).json({ message: "Title is required" });
      if (!content || !content.trim()) return res.status(400).json({ message: "Content is required" });

      const imagePath = req.file ? req.file.path : undefined;

      const { runNewsPush } = await import("./scheduler");
      const roles = targetRole && targetRole !== "all" ? targetRole.split(",").map((r: string) => r.trim()).filter(Boolean) : [];
      let totalSent = 0;
      let totalUsers = 0;

      if (roles.length > 0) {
        for (const role of roles) {
          const result = await runNewsPush(title, content, role, imagePath);
          totalSent += result.sent;
          totalUsers += result.total;
        }
        if (sendNotification) {
          for (const role of roles) {
            await storage.createNotification({
              title,
              message: content.replace(/<[^>]*>/g, "").substring(0, 500),
              type: "role",
              targetRole: role,
              createdBy: req.session.userId!,
            });
          }
        }
      } else {
        const result = await runNewsPush(title, content, "all", imagePath);
        totalSent = result.sent;
        totalUsers = result.total;
        if (sendNotification) {
          await storage.createNotification({
            title,
            message: content.replace(/<[^>]*>/g, "").substring(0, 500),
            type: "all",
            createdBy: req.session.userId!,
          });
        }
      }

      res.json({ message: `News push sent to ${totalSent} of ${totalUsers} users.`, sent: totalSent, total: totalUsers });
    } catch (err: any) {
      console.error("News push error:", err);
      res.status(500).json({ message: "Failed to send news push" });
    }
  });

  app.get("/api/admin/activity-logs", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageActivityLogs) {
      return res.status(403).json({ message: "You don't have permission to view activity logs" });
    }
    try {
      const { category, userId, action, limit, offset } = req.query;
      const result = await storage.getActivityLogs({
        category: category || undefined,
        userId: userId || undefined,
        action: action || undefined,
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0,
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  app.delete("/api/admin/activity-logs", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageActivityLogs) {
      return res.status(403).json({ message: "You don't have permission to clear activity logs" });
    }
    try {
      const { before } = req.query;
      const deleted = await storage.clearActivityLogs(before ? new Date(before as string) : undefined);
      await logActivity({ req, action: "clear_logs", category: "admin", description: `Cleared ${deleted} activity log entries`, metadata: { deleted } });
      res.json({ message: `Cleared ${deleted} log entries`, deleted });
    } catch (err) {
      res.status(500).json({ message: "Failed to clear activity logs" });
    }
  });

  return httpServer;
}
