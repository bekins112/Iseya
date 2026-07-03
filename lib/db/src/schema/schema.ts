import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, integer, boolean, text } from "drizzle-orm/pg-core";
import { users } from "./auth";

// Export users and sessions from auth model
export * from "./auth";

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

// Admin roles — reusable permission bundles assigned to sub-admins
export const adminRoles = pgTable("admin_roles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  color: varchar("color"),
  isSystem: boolean("is_system").default(false),
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
  canManageChats: boolean("can_manage_chats").default(false),
  canManageJobAid: boolean("can_manage_job_aid").default(false),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AdminRole = typeof adminRoles.$inferSelect;
export type InsertAdminRole = typeof adminRoles.$inferInsert;

// Admin permissions table for sub-admin access control
export const adminPermissions = pgTable("admin_permissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  roleId: integer("role_id").references(() => adminRoles.id, { onDelete: "set null" }),
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
  canManageChats: boolean("can_manage_chats").default(false),
  canManageJobAid: boolean("can_manage_job_aid").default(false),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod Schemas

// Manual schema for admin permissions to avoid drizzle-zod type issues

// Schema for updating admin permissions

// Schema for admin user updates

// Schema for admin job updates

// Schema for creating sub-admin


// Schema for admin ticket updates

// Schema for admin report updates

// Schema for admin subscription updates

// Types
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


export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;

export const emailHealthChecks = pgTable("email_health_checks", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  checkedAt: timestamp("checked_at").notNull().defaultNow(),
  status: varchar("status").notNull(),
  recipient: varchar("recipient").notNull(),
  message: text("message").notNull(),
  emailId: varchar("email_id"),
}, (t) => ({
  checkedAtIdx: index("email_health_checks_checked_at_idx").on(t.checkedAt),
}));

export type EmailHealthCheck = typeof emailHealthChecks.$inferSelect;
export type InsertEmailHealthCheck = typeof emailHealthChecks.$inferInsert;

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


export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: varchar("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
});

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

// Visitor/user chatbot conversations + admin handoff
export const chatConversations = pgTable("chat_conversations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar("session_id").notNull().unique(),
  accessToken: varchar("access_token"),
  userId: varchar("user_id").references(() => users.id),
  visitorName: varchar("visitor_name"),
  visitorEmail: varchar("visitor_email"),
  mode: varchar("mode").notNull().default("bot"),
  status: varchar("status").notNull().default("open"),
  adminId: varchar("admin_id").references(() => users.id),
  unreadForAdmin: integer("unread_for_admin").default(0),
  unreadForUser: integer("unread_for_user").default(0),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  statusLastIdx: index("chat_conv_status_last_idx").on(t.status, t.lastMessageAt),
}));

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;

export const chatMessages = pgTable("chat_messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  conversationId: integer("conversation_id").notNull().references(() => chatConversations.id, { onDelete: "cascade" }),
  sender: varchar("sender").notNull(),
  senderUserId: varchar("sender_user_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  convIdx: index("chat_msg_conv_idx").on(t.conversationId, t.id),
}));

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// Job-Aid benefit requests — applicant requests a benefit, admin fulfills manually
export const jobAidRequests = pgTable("job_aid_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  plan: varchar("plan").notNull(),
  benefitKey: varchar("benefit_key").notNull(),
  status: varchar("status").notNull().default("pending"),
  note: text("note"),
  adminNote: text("admin_note"),
  processedBy: varchar("processed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => ({
  userIdx: index("job_aid_req_user_idx").on(t.userId, t.createdAt),
  statusIdx: index("job_aid_req_status_idx").on(t.status, t.createdAt),
}));

export type JobAidRequest = typeof jobAidRequests.$inferSelect;
export type InsertJobAidRequest = typeof jobAidRequests.$inferInsert;

export type CreateJobRequest = InsertJob;
export type CreateApplicationRequest = InsertApplication;
