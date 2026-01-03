import { db } from "./db";
import { users, jobs, applications, type User, type UpsertUser, type Job, type InsertJob, type Application, type InsertApplication } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User>;
  
  // Jobs
  createJob(job: InsertJob): Promise<Job>;
  getJob(id: number): Promise<Job | undefined>;
  getJobs(filters?: { category?: string; location?: string }): Promise<Job[]>;
  deleteJob(id: number): Promise<void>;
  
  // Applications
  createApplication(app: InsertApplication): Promise<Application>;
  getApplicationsForJob(jobId: number): Promise<Application[]>;
  getApplicationsForApplicant(applicantId: string): Promise<Application[]>;
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

  async getJobs(filters?: { category?: string; location?: string }): Promise<Job[]> {
    let query = db.select().from(jobs).where(eq(jobs.isActive, true)).orderBy(desc(jobs.createdAt));
    
    if (filters?.category) {
      query = query.where(eq(jobs.category, filters.category)) as any;
    }
    
    if (filters?.location) {
      // Simple exact match for MVP, or like match
      // For now, let's just do exact or handle in memory if needed, but SQL is better
      // Since filters are optional, we chain
      // Note: Chaining with Drizzle query builder requires careful type handling or building the conditions array
    }
    
    const conditions = [eq(jobs.isActive, true)];
    if (filters?.category) conditions.push(eq(jobs.category, filters.category));
    if (filters?.location) conditions.push(eq(jobs.location, filters.location));
    
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
}

export const storage = new DatabaseStorage();
export const authStorage = storage; // Export for auth module
