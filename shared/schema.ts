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
  jobType: varchar("job_type").notNull().default("Full-time"), // 'Full-time', 'Part-time', 'Contract', 'Remote', 'Freelance'
  salaryMin: integer("salary_min").notNull().default(0),
  salaryMax: integer("salary_max").notNull().default(0),
  wage: varchar("wage").notNull(),
  location: varchar("location").notNull(),
  state: varchar("state"),
  lga: varchar("lga"),
  city: varchar("city"),
  gender: varchar("gender").default("Any"),
  ageMin: integer("age_min"),
  ageMax: integer("age_max"),
  agentId: varchar("agent_id").references(() => users.id),
  onBehalfOf: varchar("on_behalf_of"),
  isActive: boolean("is_active").default(true),
  status: varchar("status").default("active"),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  applicantId: varchar("applicant_id").notNull().references(() => users.id),
  status: varchar("status").default("pending"),
  message: text("message"),
  adminRating: integer("admin_rating"),
  adminNote: text("admin_note"),
  adminReviewedBy: varchar("admin_reviewed_by"),
  adminReviewedAt: timestamp("admin_reviewed_at"),
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
  userId: varchar("user_id").references(() => users.id),
  subject: varchar("subject").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull().default("general"), // 'general', 'payment', 'account', 'job', 'technical', 'contact'
  priority: varchar("priority").notNull().default("medium"), // 'low', 'medium', 'high', 'urgent'
  status: varchar("status").notNull().default("open"), // 'open', 'in_progress', 'resolved', 'closed'
  assignedTo: varchar("assigned_to").references(() => users.id),
  adminNotes: text("admin_notes"),
  isExternal: boolean("is_external").default(false),
  externalName: varchar("external_name"),
  externalEmail: varchar("external_email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ticket messages for conversation thread
export const ticketMessages = pgTable("ticket_messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  ticketId: integer("ticket_id").notNull().references(() => tickets.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").references(() => users.id),
  senderRole: varchar("sender_role").notNull(), // 'user', 'admin', or 'external'
  message: text("message").notNull(),
  attachmentUrl: varchar("attachment_url"),
  attachmentName: varchar("attachment_name"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTicketMessageSchema = createInsertSchema(ticketMessages).omit({ id: true, createdAt: true });
export type TicketMessage = typeof ticketMessages.$inferSelect;
export type InsertTicketMessage = z.infer<typeof insertTicketMessageSchema>;

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
  counterSalary: integer("counter_salary"),
  counterCompensation: text("counter_compensation"),
  counterNote: text("counter_note"),
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

// Verification requests table for applicant identity verification
export const verificationRequests = pgTable("verification_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  idType: varchar("id_type").notNull(), // 'nin', 'voters_card', 'drivers_license', 'international_passport'
  idNumber: varchar("id_number").notNull(),
  idDocumentUrl: varchar("id_document_url"),
  selfieUrl: varchar("selfie_url"),
  status: varchar("status").notNull().default("pending"), // 'pending', 'under_review', 'approved', 'rejected'
  adminNotes: text("admin_notes"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
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
  canManageSubscriptions: boolean("can_manage_subscriptions").default(false),
  canManageTransactions: boolean("can_manage_transactions").default(false),
  canManageTickets: boolean("can_manage_tickets").default(false),
  canManageReports: boolean("can_manage_reports").default(false),
  canManageVerifications: boolean("can_manage_verifications").default(false),
  canManageNotifications: boolean("can_manage_notifications").default(false),
  canManageAutomatedEmails: boolean("can_manage_automated_emails").default(false),
  canManageAds: boolean("can_manage_ads").default(false),
  canManageAgentCredits: boolean("can_manage_agent_credits").default(false),
  canManageSettings: boolean("can_manage_settings").default(false),
  canManageActivityLogs: boolean("can_manage_activity_logs").default(false),
  canManageHiringCompanies: boolean("can_manage_hiring_companies").default(false),
  canManageGoogleSettings: boolean("can_manage_google_settings").default(false),
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
export const insertVerificationRequestSchema = createInsertSchema(verificationRequests).omit({ id: true, createdAt: true, updatedAt: true });
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
  canManageSubscriptions: z.boolean().default(false),
  canManageTransactions: z.boolean().default(false),
  canManageTickets: z.boolean().default(false),
  canManageReports: z.boolean().default(false),
  canManageVerifications: z.boolean().default(false),
  canManageNotifications: z.boolean().default(false),
  canManageAutomatedEmails: z.boolean().default(false),
  canManageAds: z.boolean().default(false),
  canManageAgentCredits: z.boolean().default(false),
  canManageSettings: z.boolean().default(false),
  canManageActivityLogs: z.boolean().default(false),
  canManageHiringCompanies: z.boolean().default(false),
  canManageGoogleSettings: z.boolean().default(false),
  createdBy: z.string().optional().nullable(),
});

// Schema for updating admin permissions
export const updateAdminPermissionsSchema = z.object({
  canManageUsers: z.boolean().optional(),
  canManageJobs: z.boolean().optional(),
  canManageApplications: z.boolean().optional(),
  canManageAdmins: z.boolean().optional(),
  canViewStats: z.boolean().optional(),
  canManageSubscriptions: z.boolean().optional(),
  canManageTransactions: z.boolean().optional(),
  canManageTickets: z.boolean().optional(),
  canManageReports: z.boolean().optional(),
  canManageVerifications: z.boolean().optional(),
  canManageNotifications: z.boolean().optional(),
  canManageAutomatedEmails: z.boolean().optional(),
  canManageAds: z.boolean().optional(),
  canManageAgentCredits: z.boolean().optional(),
  canManageSettings: z.boolean().optional(),
  canManageActivityLogs: z.boolean().optional(),
  canManageHiringCompanies: z.boolean().optional(),
  canManageGoogleSettings: z.boolean().optional(),
});

// Schema for admin user updates
export const adminUpdateUserSchema = z.object({
  role: z.enum(["applicant", "employer", "agent", "admin"]).optional(),
  isVerified: z.boolean().optional(),
  isSuspended: z.boolean().optional(),
  suspendedReason: z.string().optional().nullable(),
  subscriptionStatus: z.enum(["free", "standard", "premium", "enterprise"]).optional(),
  subscriptionEndDate: z.string().optional().nullable(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  age: z.number().min(16).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  businessCategory: z.string().optional().nullable(),
});

// Schema for admin job updates
export const adminUpdateJobSchema = z.object({
  isActive: z.boolean().optional(),
  status: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  jobType: z.string().optional(),
  location: z.string().optional(),
  state: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  wage: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  gender: z.string().optional().nullable(),
  ageMin: z.number().optional().nullable(),
  ageMax: z.number().optional().nullable(),
  deadline: z.string().optional().nullable(),
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
    canManageSubscriptions: z.boolean().optional(),
    canManageTransactions: z.boolean().optional(),
    canManageTickets: z.boolean().optional(),
    canManageReports: z.boolean().optional(),
    canManageVerifications: z.boolean().optional(),
    canManageNotifications: z.boolean().optional(),
    canManageAutomatedEmails: z.boolean().optional(),
    canManageAds: z.boolean().optional(),
    canManageAgentCredits: z.boolean().optional(),
    canManageSettings: z.boolean().optional(),
    canManageActivityLogs: z.boolean().optional(),
    canManageHiringCompanies: z.boolean().optional(),
    canManageGoogleSettings: z.boolean().optional(),
  }),
});

export const createNewAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  permissions: z.object({
    canManageUsers: z.boolean().optional(),
    canManageJobs: z.boolean().optional(),
    canManageApplications: z.boolean().optional(),
    canManageAdmins: z.boolean().optional(),
    canViewStats: z.boolean().optional(),
    canManageSubscriptions: z.boolean().optional(),
    canManageTransactions: z.boolean().optional(),
    canManageTickets: z.boolean().optional(),
    canManageReports: z.boolean().optional(),
    canManageVerifications: z.boolean().optional(),
    canManageNotifications: z.boolean().optional(),
    canManageAutomatedEmails: z.boolean().optional(),
    canManageAds: z.boolean().optional(),
    canManageAgentCredits: z.boolean().optional(),
    canManageSettings: z.boolean().optional(),
    canManageActivityLogs: z.boolean().optional(),
    canManageHiringCompanies: z.boolean().optional(),
    canManageGoogleSettings: z.boolean().optional(),
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

export type VerificationRequest = typeof verificationRequests.$inferSelect;
export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;

export const notifications = pgTable("notifications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull().default("all"),
  targetRole: varchar("target_role"),
  targetUserId: varchar("target_user_id").references(() => users.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationReads = pgTable("notification_reads", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  notificationId: integer("notification_id").notNull().references(() => notifications.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  readAt: timestamp("read_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertNotificationReadSchema = createInsertSchema(notificationReads).omit({ id: true, readAt: true });

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type NotificationRead = typeof notificationReads.$inferSelect;
export type InsertNotificationRead = z.infer<typeof insertNotificationReadSchema>;

export const platformSettings = pgTable("platform_settings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  key: varchar("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by").references(() => users.id),
});

export const insertPlatformSettingSchema = createInsertSchema(platformSettings).omit({ id: true, updatedAt: true });

export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;

export const transactions = pgTable("transactions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(),
  gateway: varchar("gateway").notNull(),
  reference: varchar("reference"),
  amount: integer("amount").notNull(),
  currency: varchar("currency").notNull().default("NGN"),
  status: varchar("status").notNull().default("pending"),
  plan: varchar("plan"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: varchar("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({ id: true, subscribedAt: true });
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;

export const internalAds = pgTable("internal_ads", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  type: varchar("type").notNull().default("banner"),
  targetPages: text("target_pages").array().notNull(),
  linkUrl: varchar("link_url"),
  linkText: varchar("link_text"),
  bgColor: varchar("bg_color"),
  textColor: varchar("text_color"),
  imageUrl: varchar("image_url"),
  position: text("position").array().default(["top"]),
  bannerWidth: integer("banner_width").default(250),
  bannerHeight: integer("banner_height").default(92),
  popupWidth: integer("popup_width").default(400),
  popupHeight: integer("popup_height").default(500),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInternalAdSchema = createInsertSchema(internalAds).omit({ id: true, createdAt: true });
export type InternalAd = typeof internalAds.$inferSelect;
export type InsertInternalAd = z.infer<typeof insertInternalAdSchema>;

export const hiringCompanies = pgTable("hiring_companies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull(),
  logoUrl: varchar("logo_url").notNull(),
  websiteUrl: varchar("website_url"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertHiringCompanySchema = createInsertSchema(hiringCompanies).omit({ id: true, createdAt: true });
export type HiringCompany = typeof hiringCompanies.$inferSelect;
export type InsertHiringCompany = z.infer<typeof insertHiringCompanySchema>;

export const googleAdPlacements = pgTable("google_ad_placements", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull(),
  adSlotId: varchar("ad_slot_id").notNull(),
  adFormat: varchar("ad_format").notNull().default("auto"),
  targetPages: text("target_pages").array().notNull(),
  position: text("position").array().default(["right"]),
  isActive: boolean("is_active").default(true),
  isResponsive: boolean("is_responsive").default(true),
  customWidth: integer("custom_width"),
  customHeight: integer("custom_height"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGoogleAdPlacementSchema = createInsertSchema(googleAdPlacements).omit({ id: true, createdAt: true });
export type GoogleAdPlacement = typeof googleAdPlacements.$inferSelect;
export type InsertGoogleAdPlacement = z.infer<typeof insertGoogleAdPlacementSchema>;

export const activityLogs = pgTable("activity_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").references(() => users.id),
  userEmail: varchar("user_email"),
  userRole: varchar("user_role"),
  action: varchar("action").notNull(),
  category: varchar("category").notNull(),
  description: text("description").notNull(),
  targetType: varchar("target_type"),
  targetId: varchar("target_id"),
  metadata: text("metadata"),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

export const fileUploads = pgTable("file_uploads", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  filePath: varchar("file_path").notNull().unique(),
  data: text("data").notNull(),
  mimeType: varchar("mime_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type CreateJobRequest = InsertJob;
export type CreateApplicationRequest = InsertApplication;
