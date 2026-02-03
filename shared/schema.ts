import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, integer, boolean, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

// Export users and sessions from auth model
export * from "./models/auth";

export const jobs = pgTable("jobs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  employerId: varchar("employer_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // 'waitress', 'cleaner', etc.
  jobType: varchar("job_type").notNull().default("Full-time"), // 'Full-time', 'Part-time', 'Contract'
  salaryMin: integer("salary_min").notNull().default(0),
  salaryMax: integer("salary_max").notNull().default(0),
  wage: varchar("wage").notNull(),
  location: varchar("location").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  applicantId: varchar("applicant_id").notNull().references(() => users.id),
  status: varchar("status").default("pending"), // 'pending', 'accepted', 'rejected'
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin permissions table for sub-admin access control
export const adminPermissions = pgTable("admin_permissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  canManageUsers: boolean("can_manage_users").default(false),
  canManageJobs: boolean("can_manage_jobs").default(false),
  canManageApplications: boolean("can_manage_applications").default(false),
  canManageAdmins: boolean("can_manage_admins").default(false),
  canViewStats: boolean("can_view_stats").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, createdAt: true });

// Manual schema for admin permissions to avoid drizzle-zod type issues
export const insertAdminPermissionsSchema = z.object({
  userId: z.string(),
  canManageUsers: z.boolean().default(false),
  canManageJobs: z.boolean().default(false),
  canManageApplications: z.boolean().default(false),
  canManageAdmins: z.boolean().default(false),
  canViewStats: z.boolean().default(true),
  createdBy: z.string().optional().nullable(),
});

// Schema for updating admin permissions
export const updateAdminPermissionsSchema = z.object({
  canManageUsers: z.boolean().optional(),
  canManageJobs: z.boolean().optional(),
  canManageApplications: z.boolean().optional(),
  canManageAdmins: z.boolean().optional(),
  canViewStats: z.boolean().optional(),
});

// Schema for admin user updates
export const adminUpdateUserSchema = z.object({
  role: z.enum(["applicant", "employer", "admin"]).optional(),
  isVerified: z.boolean().optional(),
});

// Schema for admin job updates
export const adminUpdateJobSchema = z.object({
  isActive: z.boolean().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  jobType: z.string().optional(),
  location: z.string().optional(),
  wage: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
});

// Schema for creating sub-admin
export const createSubAdminSchema = z.object({
  userId: z.string(),
  permissions: z.object({
    canManageUsers: z.boolean().optional(),
    canManageJobs: z.boolean().optional(),
    canManageApplications: z.boolean().optional(),
    canManageAdmins: z.boolean().optional(),
    canViewStats: z.boolean().optional(),
  }),
});

// Types
// User types are already exported from ./models/auth but we can re-export or aliases if needed
// export type User = typeof users.$inferSelect; // Already in auth.ts
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type AdminPermissions = typeof adminPermissions.$inferSelect;
export type InsertAdminPermissions = z.infer<typeof insertAdminPermissionsSchema>;

export type CreateJobRequest = InsertJob;
export type CreateApplicationRequest = InsertApplication;
