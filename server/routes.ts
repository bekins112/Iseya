import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, isAuthenticated } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { adminUpdateUserSchema, updateAdminPermissionsSchema, insertAdminPermissionsSchema, adminUpdateJobSchema, createSubAdminSchema, insertTicketSchema, insertReportSchema, adminUpdateTicketSchema, adminUpdateReportSchema, adminUpdateSubscriptionSchema, insertJobHistorySchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

for (const dir of ["uploads/cv", "uploads/profile", "uploads/logo"]) {
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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);

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
    const job = await storage.getJob(Number(req.params.id));
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
    if (!user || (user.role !== 'employer' && user.role !== 'admin')) {
      return res.status(403).json({ message: "Only employers can post jobs" });
    }

    if (user.role === 'employer') {
      const planLimits: Record<string, number> = { free: 1, standard: 5, premium: 10, enterprise: -1 };
      const currentPlan = user.subscriptionStatus || "free";
      const limit = planLimits[currentPlan] ?? 0;

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

    try {
      const input = api.jobs.create.input.parse({
        ...req.body,
        employerId: user.id
      });
      const job = await storage.createJob(input);
      res.status(201).json(job);
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

  app.delete(api.jobs.delete.path, isAuthenticated, async (req, res) => {
    const jobId = Number(req.params.id);
    const job = await storage.getJob(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const userId = req.session.userId!;
    const user = await storage.getUser(userId);

    // Only owner or admin can delete
    if (job.employerId !== userId && user?.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }

    await storage.deleteJob(jobId);
    res.status(204).send();
  });

  app.patch(api.jobs.update.path, isAuthenticated, async (req, res) => {
    const jobId = Number(req.params.id);
    const job = await storage.getJob(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const userId = req.session.userId!;
    const user = await storage.getUser(userId);

    if (job.employerId !== userId && user?.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      const input = api.jobs.update.input.parse(req.body);
      const updatedJob = await storage.updateJob(jobId, input);
      res.json(updatedJob);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.jobs.listByEmployer.path, isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const user = await storage.getUser(userId);
    
    if (!user || (user.role !== 'employer' && user.role !== 'admin')) {
      return res.status(403).json({ message: "Only employers can access this" });
    }

    const jobs = await storage.getJobsByEmployer(userId);
    res.json(jobs);
  });

  // === APPLICATIONS ===
  app.post(api.applications.create.path, isAuthenticated, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    
    if (!user?.age || user.age < 16) {
       return res.status(403).json({ message: "You must be at least 16 years old to apply." });
    }
    try {
      const input = api.applications.create.input.parse({
        ...req.body,
        applicantId: user.id
      });
      const app = await storage.createApplication(input);
      res.status(201).json(app);
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
    const job = await storage.getJob(jobId);
    const userId = req.session.userId!;

    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.employerId !== userId) return res.status(403).json({ message: "Forbidden" });

    const apps = await storage.getApplicationsForJob(jobId);
    const enriched = await Promise.all(apps.map(async (app) => {
      const applicant = await storage.getUser(app.applicantId);
      return {
        ...app,
        applicantName: applicant ? `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim() : 'Unknown',
        applicantEmail: applicant?.email || null,
        applicantProfileImageUrl: applicant?.profileImageUrl || null,
        applicantCvUrl: applicant?.cvUrl || null,
        applicantGender: applicant?.gender || null,
        applicantAge: applicant?.age || null,
        applicantIsVerified: applicant?.isVerified || false,
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
    const application = await storage.getApplication(appId);
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.json(application);
  });

  app.patch(api.applications.updateStatus.path, isAuthenticated, async (req, res) => {
    const appId = Number(req.params.id);
    const application = await storage.getApplication(appId);
    if (!application) return res.status(404).json({ message: "Application not found" });

    const userId = req.session.userId!;
    const job = await storage.getJob(application.jobId);
    
    if (!job || job.employerId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      const input = api.applications.updateStatus.input.parse(req.body);
      const updatedApp = await storage.updateApplicationStatus(appId, input.status);
      res.json(updatedApp);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Cancel/withdraw application (applicant)
  app.delete("/api/applications/:id", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const appId = Number(req.params.id);
    const application = await storage.getApplication(appId);
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.applicantId !== userId) return res.status(403).json({ message: "Not authorized" });
    if (application.status === "accepted") return res.status(400).json({ message: "Cannot cancel an accepted application" });

    await storage.deleteApplication(appId, userId);
    res.status(204).send();
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

  app.patch("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageUsers) {
      return res.status(403).json({ message: "You don't have permission to manage users" });
    }
    try {
      const input = adminUpdateUserSchema.parse(req.body);
      const user = await storage.updateUser(req.params.id, input);
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  // Admin jobs management
  app.get("/api/admin/jobs", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageJobs && !req.adminPermissions.canViewStats) {
      return res.status(403).json({ message: "You don't have permission to view jobs" });
    }
    const jobs = await storage.getAllJobs();
    res.json(jobs);
  });

  app.patch("/api/admin/jobs/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageJobs) {
      return res.status(403).json({ message: "You don't have permission to manage jobs" });
    }
    try {
      const input = adminUpdateJobSchema.parse(req.body);
      const job = await storage.updateJob(Number(req.params.id), input);
      res.json(job);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: "Failed to update job" });
    }
  });

  app.delete("/api/admin/jobs/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageJobs) {
      return res.status(403).json({ message: "You don't have permission to delete jobs" });
    }
    try {
      await storage.deleteJob(Number(req.params.id));
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
      });
      
      res.status(201).json(adminPerms);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: "Failed to create admin" });
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

  // === TICKETS ===
  
  // Create a support ticket (any authenticated user)
  app.post("/api/tickets", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    try {
      const input = insertTicketSchema.parse({
        ...req.body,
        userId,
        status: "open",
        priority: req.body.priority || "medium",
      });
      const ticket = await storage.createTicket(input);
      res.status(201).json(ticket);
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

  // Admin: Get all tickets
  app.get("/api/admin/tickets", isAuthenticated, isAdmin, async (req: any, res) => {
    const { status, priority } = req.query;
    const tickets = await storage.getAllTickets({ 
      status: status as string, 
      priority: priority as string 
    });
    res.json(tickets);
  });

  // Admin: Get single ticket
  app.get("/api/admin/tickets/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    const ticket = await storage.getTicket(Number(req.params.id));
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  });

  // Admin: Update ticket
  app.patch("/api/admin/tickets/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const input = adminUpdateTicketSchema.parse(req.body);
      const ticket = await storage.updateTicket(Number(req.params.id), input);
      res.json(ticket);
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
    const { status, type } = req.query;
    const reports = await storage.getAllReports({ 
      status: status as string, 
      type: type as string 
    });
    res.json(reports);
  });

  // Admin: Get single report
  app.get("/api/admin/reports/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    const report = await storage.getReport(Number(req.params.id));
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  });

  // Admin: Update report
  app.patch("/api/admin/reports/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const input = adminUpdateReportSchema.parse(req.body);
      const report = await storage.updateReport(Number(req.params.id), input);
      res.json(report);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: "Failed to update report" });
    }
  });

  // === FILE UPLOADS ===
  
  app.use("/uploads", (await import("express")).default.static("uploads"));

  app.get("/api/download/cv/:filename", isAuthenticated, async (req, res) => {
    const filename = req.params.filename;
    if (!/^[a-zA-Z0-9_\-]+\.\w+$/.test(filename)) {
      return res.status(400).json({ message: "Invalid filename" });
    }
    const filePath = path.resolve(process.cwd(), "uploads", "cv", filename);
    if (!filePath.startsWith(path.resolve(process.cwd(), "uploads", "cv"))) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found" });
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.sendFile(filePath);
  });

  app.post("/api/upload/cv", isAuthenticated, uploadCV.single("cv"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const userId = req.session.userId!;
    const filePath = `/uploads/cv/${req.file.filename}`;
    await storage.updateUser(userId, { cvUrl: filePath });
    res.json({ url: filePath });
  });

  app.post("/api/upload/profile-picture", isAuthenticated, uploadProfile.single("picture"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const userId = req.session.userId!;
    const filePath = `/uploads/profile/${req.file.filename}`;
    await storage.updateUser(userId, { profileImageUrl: filePath });
    res.json({ url: filePath });
  });

  app.post("/api/upload/company-logo", isAuthenticated, uploadLogo.single("logo"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const userId = req.session.userId!;
    const user = await storage.getUser(userId);
    if (user?.role !== "employer") return res.status(403).json({ message: "Only employers can upload a company logo" });
    const filePath = `/uploads/logo/${req.file.filename}`;
    await storage.updateUser(userId, { companyLogo: filePath });
    res.json({ url: filePath });
  });

  // === APPLICANT PROFILE (for employer viewing - scoped to their job applicants) ===

  app.get("/api/applicant-profile/:applicantId", isAuthenticated, async (req, res) => {
    const viewerId = req.session.userId!;
    const viewer = await storage.getUser(viewerId);
    if (!viewer || (viewer.role !== "employer" && viewer.role !== "admin")) {
      return res.status(403).json({ message: "Only employers can view applicant profiles" });
    }

    const applicantId = req.params.applicantId;

    if (viewer.role === "employer") {
      const employerJobs = await storage.getJobsByEmployer(viewerId);
      let hasApplied = false;
      for (const job of employerJobs) {
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

    res.json({
      id: applicant.id,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: applicant.email,
      profileImageUrl: applicant.profileImageUrl,
      gender: applicant.gender,
      age: applicant.age,
      bio: applicant.bio,
      location: applicant.location,
      cvUrl: applicant.cvUrl,
      expectedSalaryMin: applicant.expectedSalaryMin,
      expectedSalaryMax: applicant.expectedSalaryMax,
      isVerified: applicant.isVerified,
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
    await storage.deleteJobHistory(Number(req.params.id), userId);
    res.status(204).send();
  });

  // === OFFERS ===

  // Create offer (employer sends to applicant)
  app.post("/api/offers", isAuthenticated, async (req, res) => {
    const employerId = req.session.userId!;
    const employer = await storage.getUser(employerId);
    if (employer?.role !== "employer") return res.status(403).json({ message: "Only employers can send offers" });

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
      if (!job || job.employerId !== employerId) return res.status(403).json({ message: "Not authorized" });

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
      } else {
        await storage.updateApplicationStatus(offer.applicationId, "pending");
      }

      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to respond to offer" });
    }
  });

  // === INTERVIEWS ===

  // Schedule interview (employer)
  app.post("/api/interviews", isAuthenticated, async (req, res) => {
    const employerId = req.session.userId!;
    const employer = await storage.getUser(employerId);
    if (employer?.role !== "employer") return res.status(403).json({ message: "Only employers can schedule interviews" });

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
      if (!job || job.employerId !== employerId) return res.status(403).json({ message: "Not authorized" });

      if (application.status !== "pending" && application.status !== "offered") {
        return res.status(400).json({ message: "Can only schedule interviews for pending or offered applicants" });
      }

      const existingInterview = await storage.getInterviewByApplication(input.applicationId);
      if (existingInterview) return res.status(400).json({ message: "An interview is already scheduled for this application" });

      const interview = await storage.createInterview({
        applicationId: input.applicationId,
        jobId: application.jobId,
        employerId,
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
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to schedule interview" });
    }
  });

  // Get interviews for a job (employer)
  app.get("/api/jobs/:jobId/interviews", isAuthenticated, async (req, res) => {
    const employerId = req.session.userId!;
    const jobId = Number(req.params.jobId);
    const job = await storage.getJob(jobId);
    if (!job || job.employerId !== employerId) return res.status(403).json({ message: "Not authorized" });

    const interviewList = await storage.getInterviewsForJob(jobId);
    const enriched = await Promise.all(interviewList.map(async (interview) => {
      const applicant = await storage.getUser(interview.applicantId);
      return {
        ...interview,
        applicantName: applicant ? `${applicant.firstName} ${applicant.lastName}` : "Unknown",
        applicantEmail: applicant?.email || null,
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

  // Update interview (employer - reschedule or cancel)
  app.patch("/api/interviews/:id", isAuthenticated, async (req, res) => {
    const employerId = req.session.userId!;
    const interviewId = Number(req.params.id);

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
      if (interview.employerId !== employerId) return res.status(403).json({ message: "Not authorized" });

      const updated = await storage.updateInterview(interviewId, input);
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
    const { status } = req.query;
    if (status) {
      const users = await storage.getUsersBySubscription(status as string);
      res.json(users);
    } else {
      // Return all employers with subscription info
      const users = await storage.getAllUsers({ role: "employer" });
      res.json(users);
    }
  });

  // Admin: Update user subscription
  app.patch("/api/admin/subscriptions/:userId", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageUsers) {
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
  const SUBSCRIPTION_PLANS: Record<string, { name: string; amount: number; jobLimit: number }> = {
    free: { name: "Basic", amount: 0, jobLimit: 1 },
    standard: { name: "Standard", amount: 999900, jobLimit: 5 },
    premium: { name: "Premium", amount: 2499900, jobLimit: 10 },
    enterprise: { name: "Enterprise", amount: 4499900, jobLimit: -1 },
  };

  app.get("/api/subscription/plans", (_req, res) => {
    const plans = Object.entries(SUBSCRIPTION_PLANS).map(([id, plan]) => ({
      id,
      ...plan,
      amountFormatted: `₦${(plan.amount / 100).toLocaleString()}`,
    }));
    res.json(plans);
  });

  app.post("/api/subscription/initialize", isAuthenticated, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user || user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can subscribe" });
    }

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
        return res.status(400).json({ message: "Payment verification failed", verified: false });
      }

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

      res.json({ verified: true, plan, message: "Subscription activated successfully" });
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
        return res.status(400).json({ message: "Payment verification failed", verified: false });
      }

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

      res.json({ verified: true, plan, message: "Subscription activated successfully" });
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
        }
      }
    }
    res.sendStatus(200);
  });

  app.get("/api/subscription/status", isAuthenticated, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user) return res.status(404).json({ message: "User not found" });

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
  const VERIFICATION_FEE = 999900; // ₦9,999 in kobo for Paystack
  const VERIFICATION_FEE_NAIRA = 9999; // ₦9,999 for Flutterwave

  // Ensure uploads/verification directory exists
  if (!fs.existsSync(path.join(process.cwd(), "uploads", "verification"))) {
    fs.mkdirSync(path.join(process.cwd(), "uploads", "verification"), { recursive: true });
  }

  // Get verification status for current user
  app.get("/api/verification/status", isAuthenticated, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user) return res.status(404).json({ message: "User not found" });
    const request = await storage.getVerificationRequestByUser(user.id);
    res.json({
      isVerified: user.isVerified || false,
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
    if (user.isVerified) return res.status(400).json({ message: "You are already verified" });

    const existing = await storage.getVerificationRequestByUser(user.id);
    if (existing && (existing.status === "pending" || existing.status === "under_review")) {
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

    const request = await storage.createVerificationRequest({
      userId: user.id,
      idType,
      idNumber,
      idDocumentUrl,
      selfieUrl,
      status: "pending",
    });

    res.json(request);
  });

  // Initialize verification payment via Paystack
  app.post("/api/verification/pay/paystack", isAuthenticated, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user || user.role !== "applicant") return res.status(403).json({ message: "Only applicants can pay for verification" });
    if (user.isVerified) return res.status(400).json({ message: "You are already verified" });

    const existing = await storage.getVerificationRequestByUser(user.id);
    if (!existing || existing.status !== "pending") {
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
          amount: VERIFICATION_FEE,
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
        return res.status(400).json({ message: "Payment verification failed", verified: false });
      }

      const { userId, type, requestId } = data.data.metadata || {};
      if (type !== "verification" || !requestId) {
        return res.status(400).json({ message: "Invalid payment metadata", verified: false });
      }

      await storage.updateVerificationRequest(Number(requestId), { status: "under_review" });
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
    if (user.isVerified) return res.status(400).json({ message: "You are already verified" });

    const existing = await storage.getVerificationRequestByUser(user.id);
    if (!existing || existing.status !== "pending") {
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
          amount: VERIFICATION_FEE_NAIRA,
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
        return res.status(400).json({ message: "Payment verification failed", verified: false });
      }

      const { userId, type, requestId } = data.data.meta || {};
      if (type !== "verification" || !requestId) {
        return res.status(400).json({ message: "Invalid payment metadata", verified: false });
      }

      await storage.updateVerificationRequest(Number(requestId), { status: "under_review" });
      res.json({ verified: true, message: "Payment received! Your verification is now under review." });
    } catch (err) {
      console.error("Verification Flutterwave verify error:", err);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Admin: Get all verification requests
  app.get("/api/admin/verification-requests", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageUsers) {
      return res.status(403).json({ message: "You don't have permission to manage verifications" });
    }
    const status = req.query.status as string | undefined;
    const requests = await storage.getAllVerificationRequests(status ? { status } : undefined);
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
    if (req.adminPermissions && !req.adminPermissions.canManageUsers) {
      return res.status(403).json({ message: "You don't have permission to manage verifications" });
    }

    const { status, adminNotes } = req.body;
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
    }

    const request = await storage.getVerificationRequest(Number(req.params.id));
    if (!request) return res.status(404).json({ message: "Verification request not found" });

    const updated = await storage.updateVerificationRequest(request.id, {
      status,
      adminNotes: adminNotes || null,
      reviewedBy: req.session.userId!,
      reviewedAt: new Date(),
    });

    if (status === "approved") {
      await storage.updateUser(request.userId, { isVerified: true });
    }

    res.json(updated);
  });

  return httpServer;
}
