import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up auth first
  await setupAuth(app);
  registerAuthRoutes(app);

  // === USERS ===
  app.patch(api.users.update.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
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
    const user = await storage.getUser((req.user as any).claims.sub);
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

    const userId = (req.user as any).claims.sub;
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

    const userId = (req.user as any).claims.sub;
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
    const userId = (req.user as any).claims.sub;
    const user = await storage.getUser(userId);
    
    if (!user || (user.role !== 'employer' && user.role !== 'admin')) {
      return res.status(403).json({ message: "Only employers can access this" });
    }

    const jobs = await storage.getJobsByEmployer(userId);
    res.json(jobs);
  });

  // === APPLICATIONS ===
  app.post(api.applications.create.path, isAuthenticated, async (req, res) => {
    const user = await storage.getUser((req.user as any).claims.sub);
    
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
    const userId = (req.user as any).claims.sub;

    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.employerId !== userId) return res.status(403).json({ message: "Forbidden" });

    const apps = await storage.getApplicationsForJob(jobId);
    res.json(apps);
  });

  app.get(api.applications.listForApplicant.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
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

    const userId = (req.user as any).claims.sub;
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
    const userId = (req.user as any)?.claims?.sub;
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
      const user = await storage.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (err) {
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
      const job = await storage.updateJob(Number(req.params.id), req.body);
      res.json(job);
    } catch (err) {
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
      const { userId, permissions } = req.body;
      
      // Update user role to admin
      await storage.updateUser(userId, { role: 'admin' });
      
      // Create permissions
      const adminPerms = await storage.createAdminPermissions({
        userId,
        createdBy: req.adminUser.id,
        ...permissions
      });
      
      res.status(201).json(adminPerms);
    } catch (err) {
      res.status(400).json({ message: "Failed to create admin" });
    }
  });

  app.patch("/api/admin/admins/:userId/permissions", isAuthenticated, isAdmin, async (req: any, res) => {
    if (req.adminPermissions && !req.adminPermissions.canManageAdmins) {
      return res.status(403).json({ message: "You don't have permission to update admin permissions" });
    }
    
    try {
      const perms = await storage.updateAdminPermissions(req.params.userId, req.body);
      res.json(perms);
    } catch (err) {
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

  return httpServer;
}
