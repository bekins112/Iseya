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
  gender: varchar("gender").default("Any"),
  ageMin: integer("age_min"),
  ageMax: integer("age_max"),
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

// Job history table for applicant profiles
export const jobHistory = pgTable("job_history", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  jobTitle: varchar("job_title").notNull(),
  company: varchar("company").notNull(),
  startDate: varchar("start_date"),
  endDate: varchar("end_date"),
  isCurrent: boolean("is_current").default(false),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Support tickets table
export const tickets = pgTable("tickets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  subject: varchar("subject").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull().default("general"), // 'general', 'payment', 'account', 'job', 'technical'
  priority: varchar("priority").notNull().default("medium"), // 'low', 'medium', 'high', 'urgent'
  status: varchar("status").notNull().default("open"), // 'open', 'in_progress', 'resolved', 'closed'
  assignedTo: varchar("assigned_to").references(() => users.id),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reports table for user/job reports
export const reports = pgTable("reports", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  reportedType: varchar("reported_type").notNull(), // 'user', 'job'
  reportedUserId: varchar("reported_user_id").references(() => users.id),
  reportedJobId: integer("reported_job_id").references(() => jobs.id),
  reason: varchar("reason").notNull(), // 'spam', 'fraud', 'inappropriate', 'harassment', 'other'
  description: text("description"),
  status: varchar("status").notNull().default("pending"), // 'pending', 'reviewed', 'action_taken', 'dismissed'
  adminNotes: text("admin_notes"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Offers table - employers send offers to applicants
export const offers = pgTable("offers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  applicationId: integer("application_id").notNull().references(() => applications.id),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  employerId: varchar("employer_id").notNull().references(() => users.id),
  applicantId: varchar("applicant_id").notNull().references(() => users.id),
  salary: integer("salary").notNull(),
  compensation: text("compensation"),
  note: text("note"),
  status: varchar("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Interviews table - employers schedule interviews with applicants
export const interviews = pgTable("interviews", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  applicationId: integer("application_id").notNull().references(() => applications.id),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  employerId: varchar("employer_id").notNull().references(() => users.id),
  applicantId: varchar("applicant_id").notNull().references(() => users.id),
  interviewDate: varchar("interview_date").notNull(),
  interviewTime: varchar("interview_time").notNull(),
  interviewType: varchar("interview_type").notNull().default("in-person"),
  location: varchar("location"),
  meetingLink: varchar("meeting_link"),
  notes: text("notes"),
  status: varchar("status").notNull().default("scheduled"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
export const insertJobHistorySchema = createInsertSchema(jobHistory).omit({ id: true, createdAt: true });
export const insertOfferSchema = createInsertSchema(offers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInterviewSchema = createInsertSchema(interviews).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTicketSchema = createInsertSchema(tickets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true, updatedAt: true });

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

// Schema for admin ticket updates
export const adminUpdateTicketSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assignedTo: z.string().nullable().optional(),
  adminNotes: z.string().optional(),
});

// Schema for admin report updates
export const adminUpdateReportSchema = z.object({
  status: z.enum(["pending", "reviewed", "action_taken", "dismissed"]).optional(),
  adminNotes: z.string().optional(),
});

// Schema for admin subscription updates
export const adminUpdateSubscriptionSchema = z.object({
  subscriptionStatus: z.enum(["free", "standard", "premium", "enterprise"]).optional(),
  subscriptionEndDate: z.string().optional(),
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

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type JobHistory = typeof jobHistory.$inferSelect;
export type InsertJobHistory = z.infer<typeof insertJobHistorySchema>;

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;

export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;

export type CreateJobRequest = InsertJob;
export type CreateApplicationRequest = InsertApplication;
