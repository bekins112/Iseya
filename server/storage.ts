import { db } from "./db";
import { users, jobs, applications, type User, type UpsertUser, type Job, type InsertJob, type Application, type InsertApplication } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
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
}

export const storage = new DatabaseStorage();
export const authStorage = storage; // Export for auth module
