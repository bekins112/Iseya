import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import {
  users,
  jobs,
  applications,
  jobHistory,
  offers,
  interviews,
  verificationRequests,
  tickets,
  reports,
  notifications,
  notificationReads,
  platformSettings,
  transactions,
  newsletterSubscribers,
  internalAds,
  hiringCompanies,
  googleAdPlacements,
} from "./schema";

export const insertUserSchema = createInsertSchema(users);
export const insertJobSchema = createInsertSchema(jobs);
export const insertApplicationSchema = createInsertSchema(applications);
export const insertJobHistorySchema = createInsertSchema(jobHistory);
export const insertOfferSchema = createInsertSchema(offers);
export const insertInterviewSchema = createInsertSchema(interviews);
export const insertVerificationRequestSchema = createInsertSchema(verificationRequests);
export const insertTicketSchema = createInsertSchema(tickets);
export const insertReportSchema = createInsertSchema(reports);
export const insertNotificationSchema = createInsertSchema(notifications);
export const insertNotificationReadSchema = createInsertSchema(notificationReads);
export const insertPlatformSettingSchema = createInsertSchema(platformSettings);
export const insertTransactionSchema = createInsertSchema(transactions);
export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers);
export const insertInternalAdSchema = createInsertSchema(internalAds);
export const insertHiringCompanySchema = createInsertSchema(hiringCompanies);
export const insertGoogleAdPlacementSchema = createInsertSchema(googleAdPlacements);

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

export const adminUpdateTicketSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assignedTo: z.string().nullable().optional(),
  adminNotes: z.string().optional(),
});

export const adminUpdateReportSchema = z.object({
  status: z.enum(["pending", "reviewed", "action_taken", "dismissed"]).optional(),
  adminNotes: z.string().optional(),
});

export const adminUpdateSubscriptionSchema = z.object({
  subscriptionStatus: z.enum(["free", "standard", "premium", "enterprise"]).optional(),
  subscriptionEndDate: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type InsertAdminPermissions = z.infer<typeof insertAdminPermissionsSchema>;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type InsertJobHistory = z.infer<typeof insertJobHistorySchema>;
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertNotificationRead = z.infer<typeof insertNotificationReadSchema>;
export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type InsertInternalAd = z.infer<typeof insertInternalAdSchema>;
export type InsertHiringCompany = z.infer<typeof insertHiringCompanySchema>;
export type InsertGoogleAdPlacement = z.infer<typeof insertGoogleAdPlacementSchema>;
