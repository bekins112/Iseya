import { db } from "./db";
import { users, jobs, applications, adminPermissions, type User, type UpsertUser, type Job, type InsertJob, type Application, type InsertApplication, type AdminPermissions, type InsertAdminPermissions } from "@shared/schema";
import { eq, and, desc, sql, count, or, like } from "drizzle-orm";
import { IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User>;
  
  // Jobs
  createJob(job: InsertJob): Promise<Job>;
  getJob(id: number): Promise<Job | undefined>;
  getJobs(filters?: { 
    category?: string; 
    location?: string;
    jobType?: string;
    minSalary?: number;
    maxSalary?: number;
  }): Promise<Job[]>;
  deleteJob(id: number): Promise<void>;
  
  // Applications
  createApplication(app: InsertApplication): Promise<Application>;
  getApplicationsForJob(jobId: number): Promise<Application[]>;
  getApplicationsForApplicant(applicantId: string): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  updateApplicationStatus(id: number, status: string): Promise<Application>;
  
  // Jobs - additional
  updateJob(id: number, updates: Partial<Job>): Promise<Job>;
  getJobsByEmployer(employerId: string): Promise<Job[]>;
  
  // Admin methods
  getAllUsers(filters?: { role?: string; search?: string }): Promise<User[]>;
  getAllJobs(): Promise<Job[]>;
  getAllApplications(): Promise<Application[]>;
  getAdminPermissions(userId: string): Promise<AdminPermissions | undefined>;
  createAdminPermissions(permissions: InsertAdminPermissions): Promise<AdminPermissions>;
  updateAdminPermissions(userId: string, permissions: Partial<AdminPermissions>): Promise<AdminPermissions>;
  deleteAdminPermissions(userId: string): Promise<void>;
  getAllAdmins(): Promise<(User & { permissions?: AdminPermissions })[]>;
  getStats(): Promise<{ totalUsers: number; totalJobs: number; totalApplications: number; totalEmployers: number; totalApplicants: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async getJobs(filters?: { 
    category?: string; 
    location?: string;
    jobType?: string;
    minSalary?: number;
    maxSalary?: number;
  }): Promise<Job[]> {
    const conditions = [eq(jobs.isActive, true)];
    
    if (filters?.category) conditions.push(eq(jobs.category, filters.category));
    if (filters?.location) conditions.push(sql`${jobs.location} ILIKE ${`%${filters.location}%`}`);
    if (filters?.jobType) conditions.push(eq(jobs.jobType, filters.jobType));
    if (filters?.minSalary) conditions.push(sql`${jobs.salaryMin} >= ${filters.minSalary}`);
    if (filters?.maxSalary) conditions.push(sql`${jobs.salaryMax} <= ${filters.maxSalary}`);
    
    return await db.select().from(jobs).where(and(...conditions)).orderBy(desc(jobs.createdAt));
  }

  async deleteJob(id: number): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  async createApplication(app: InsertApplication): Promise<Application> {
    const [newApp] = await db.insert(applications).values(app).returning();
    return newApp;
  }

  async getApplicationsForJob(jobId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.jobId, jobId));
  }

  async getApplicationsForApplicant(applicantId: string): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.applicantId, applicantId));
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [app] = await db.select().from(applications).where(eq(applications.id, id));
    return app;
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application> {
    const [app] = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return app;
  }

  async updateJob(id: number, updates: Partial<Job>): Promise<Job> {
    const [job] = await db
      .update(jobs)
      .set(updates)
      .where(eq(jobs.id, id))
      .returning();
    return job;
  }

  async getJobsByEmployer(employerId: string): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(eq(jobs.employerId, employerId))
      .orderBy(desc(jobs.createdAt));
  }

  // Admin methods
  async getAllUsers(filters?: { role?: string; search?: string }): Promise<User[]> {
    const conditions: any[] = [];
    
    if (filters?.role) {
      conditions.push(eq(users.role, filters.role));
    }
    if (filters?.search) {
      conditions.push(
        or(
          like(users.firstName, `%${filters.search}%`),
          like(users.lastName, `%${filters.search}%`),
          like(users.email, `%${filters.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      return await db.select().from(users).where(and(...conditions)).orderBy(desc(users.createdAt));
    }
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllJobs(): Promise<Job[]> {
    return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  }

  async getAllApplications(): Promise<Application[]> {
    return await db.select().from(applications).orderBy(desc(applications.createdAt));
  }

  async getAdminPermissions(userId: string): Promise<AdminPermissions | undefined> {
    const [perms] = await db.select().from(adminPermissions).where(eq(adminPermissions.userId, userId));
    return perms;
  }

  async createAdminPermissions(permissions: InsertAdminPermissions): Promise<AdminPermissions> {
    const [perms] = await db.insert(adminPermissions).values(permissions).returning();
    return perms;
  }

  async updateAdminPermissions(userId: string, updates: Partial<AdminPermissions>): Promise<AdminPermissions> {
    const [perms] = await db
      .update(adminPermissions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(adminPermissions.userId, userId))
      .returning();
    return perms;
  }

  async deleteAdminPermissions(userId: string): Promise<void> {
    await db.delete(adminPermissions).where(eq(adminPermissions.userId, userId));
  }

  async getAllAdmins(): Promise<(User & { permissions?: AdminPermissions })[]> {
    const adminUsers = await db.select().from(users).where(eq(users.role, "admin")).orderBy(desc(users.createdAt));
    const result = await Promise.all(
      adminUsers.map(async (user) => {
        const permissions = await this.getAdminPermissions(user.id);
        return { ...user, permissions };
      })
    );
    return result;
  }

  async getStats(): Promise<{ totalUsers: number; totalJobs: number; totalApplications: number; totalEmployers: number; totalApplicants: number }> {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [jobCount] = await db.select({ count: count() }).from(jobs);
    const [appCount] = await db.select({ count: count() }).from(applications);
    const [employerCount] = await db.select({ count: count() }).from(users).where(eq(users.role, "employer"));
    const [applicantCount] = await db.select({ count: count() }).from(users).where(eq(users.role, "applicant"));
    
    return {
      totalUsers: userCount.count,
      totalJobs: jobCount.count,
      totalApplications: appCount.count,
      totalEmployers: employerCount.count,
      totalApplicants: applicantCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
export const authStorage = storage; // Export for auth module
