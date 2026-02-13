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
    const jobs = await storage.getJobs(filters);
    res.json(jobs);
  });

  app.get(api.jobs.get.path, async (req, res) => {
    const job = await storage.getJob(Number(req.params.id));
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  });

  app.post(api.jobs.create.path, isAuthenticated, async (req, res) => {
    // Check if user is employer or admin
    const user = await storage.getUser(req.session.userId!);
    if (!user || (user.role !== 'employer' && user.role !== 'admin')) {
      return res.status(403).json({ message: "Only employers can post jobs" });
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
    
    // Check age (16+)
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
      };
    }));
    res.json(enriched);
  });

  app.get(api.applications.listForApplicant.path, isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const apps = await storage.getApplicationsForApplicant(userId);
    res.json(apps);
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

  app.delete("/api/job-history/:id", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    await storage.deleteJobHistory(Number(req.params.id), userId);
    res.status(204).send();
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

  return httpServer;
}
