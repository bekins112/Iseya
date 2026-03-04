import { db } from "./db";
import { users, jobs, applications, adminPermissions, tickets, ticketMessages, reports, jobHistory, offers, interviews, verificationRequests, notifications, notificationReads, platformSettings, transactions, type User, type UpsertUser, type Job, type InsertJob, type Application, type InsertApplication, type AdminPermissions, type InsertAdminPermissions, type Ticket, type InsertTicket, type TicketMessage, type InsertTicketMessage, type Report, type InsertReport, type JobHistory, type InsertJobHistory, type Offer, type InsertOffer, type Interview, type InsertInterview, type VerificationRequest, type InsertVerificationRequest, type Notification, type InsertNotification, type PlatformSetting, type Transaction, type InsertTransaction } from "@shared/schema";
import { eq, and, desc, sql, count, or, like } from "drizzle-orm";
export interface IStorage {
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
  getUserByCvFilename(filename: string): Promise<User | undefined>;
  getAllUsers(filters?: { role?: string; search?: string }): Promise<User[]>;
  getAllJobs(): Promise<Job[]>;
  getAllApplications(): Promise<Application[]>;
  getAdminPermissions(userId: string): Promise<AdminPermissions | undefined>;
  createAdminPermissions(permissions: InsertAdminPermissions): Promise<AdminPermissions>;
  updateAdminPermissions(userId: string, permissions: Partial<AdminPermissions>): Promise<AdminPermissions>;
  deleteAdminPermissions(userId: string): Promise<void>;
  getAllAdmins(): Promise<(User & { permissions?: AdminPermissions })[]>;
  getStats(): Promise<{ totalUsers: number; totalJobs: number; totalApplications: number; totalEmployers: number; totalApplicants: number; premiumEmployers: number; activeJobs: number; pendingApplications: number }>;
  getDetailedStats(): Promise<{
    usersByRole: { role: string; count: number }[];
    jobsByCategory: { category: string; count: number }[];
    applicationsByStatus: { status: string; count: number }[];
    subscriptionStats: { status: string; count: number }[];
    recentActivity: { date: string; users: number; jobs: number; applications: number }[];
  }>;
  
  // Ticket methods
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  getTicket(id: number): Promise<Ticket | undefined>;
  getAllTickets(filters?: { status?: string; priority?: string }): Promise<Ticket[]>;
  getTicketsByUser(userId: string): Promise<Ticket[]>;
  updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket>;
  
  // Ticket message methods
  createTicketMessage(msg: InsertTicketMessage): Promise<TicketMessage>;
  getTicketMessages(ticketId: number): Promise<TicketMessage[]>;
  getUnreadMessageCount(ticketId: number, role: string): Promise<number>;
  markTicketMessagesRead(ticketId: number, readerRole: string): Promise<void>;
  getTicketsWithUnreadCounts(userId: string, role: string): Promise<Record<number, number>>;

  // Report methods
  createReport(report: InsertReport): Promise<Report>;
  getReport(id: number): Promise<Report | undefined>;
  getAllReports(filters?: { status?: string; type?: string }): Promise<Report[]>;
  updateReport(id: number, updates: Partial<Report>): Promise<Report>;
  
  // Job history methods
  getJobHistoryByUser(userId: string): Promise<JobHistory[]>;
  createJobHistory(entry: InsertJobHistory): Promise<JobHistory>;
  updateJobHistory(id: number, userId: string, updates: Partial<InsertJobHistory>): Promise<JobHistory>;
  deleteJobHistory(id: number, userId: string): Promise<void>;
  
  // Offer methods
  createOffer(offer: InsertOffer): Promise<Offer>;
  getOffer(id: number): Promise<Offer | undefined>;
  getOfferByApplication(applicationId: number): Promise<Offer | undefined>;
  getOffersForApplicant(applicantId: string): Promise<Offer[]>;
  getOffersForEmployer(employerId: string): Promise<Offer[]>;
  updateOfferStatus(id: number, status: string): Promise<Offer>;
  
  // Interview methods
  createInterview(interview: InsertInterview): Promise<Interview>;
  getInterview(id: number): Promise<Interview | undefined>;
  getInterviewByApplication(applicationId: number): Promise<Interview | undefined>;
  getInterviewsForJob(jobId: number): Promise<Interview[]>;
  getInterviewsForApplicant(applicantId: string): Promise<Interview[]>;
  updateInterview(id: number, updates: Partial<Interview>): Promise<Interview>;

  // Verification request methods
  createVerificationRequest(request: InsertVerificationRequest): Promise<VerificationRequest>;
  getVerificationRequest(id: number): Promise<VerificationRequest | undefined>;
  getVerificationRequestByUser(userId: string): Promise<VerificationRequest | undefined>;
  getAllVerificationRequests(filters?: { status?: string }): Promise<VerificationRequest[]>;
  updateVerificationRequest(id: number, updates: Partial<VerificationRequest>): Promise<VerificationRequest>;

  // Subscription methods
  getUsersBySubscription(status: string): Promise<User[]>;

  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsForUser(userId: string, role: string): Promise<(Notification & { isRead: boolean })[]>;
  getUnreadCountForUser(userId: string, role: string): Promise<number>;
  markNotificationRead(notificationId: number, userId: string): Promise<void>;
  markAllNotificationsRead(userId: string, role: string): Promise<void>;
  getAllNotifications(): Promise<Notification[]>;
  deleteNotification(id: number): Promise<void>;

  // Platform settings methods
  getSetting(key: string): Promise<string | null>;
  getAllSettings(): Promise<PlatformSetting[]>;
  upsertSetting(key: string, value: string, updatedBy: string): Promise<PlatformSetting>;

  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getAllTransactions(filters?: { type?: string; status?: string; gateway?: string }): Promise<Transaction[]>;
  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction>;
  getTransactionStats(): Promise<{
    totalRevenue: number;
    subscriptionRevenue: number;
    verificationRevenue: number;
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    monthlyRevenue: { month: string; subscriptions: number; verifications: number; total: number }[];
  }>;
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
    await this.expireOverdueJobs();
    const conditions = [
      eq(jobs.isActive, true),
      eq(jobs.status, "active"),
    ];
    
    if (filters?.category) conditions.push(eq(jobs.category, filters.category));
    if (filters?.location) conditions.push(sql`${jobs.location} ILIKE ${`%${filters.location}%`}`);
    if (filters?.jobType) conditions.push(eq(jobs.jobType, filters.jobType));
    if (filters?.minSalary) conditions.push(sql`${jobs.salaryMin} >= ${filters.minSalary}`);
    if (filters?.maxSalary) conditions.push(sql`${jobs.salaryMax} <= ${filters.maxSalary}`);
    
    return await db.select().from(jobs).where(and(...conditions)).orderBy(desc(jobs.createdAt));
  }

  async expireOverdueJobs(): Promise<void> {
    await db
      .update(jobs)
      .set({ status: "expired", isActive: false })
      .where(
        and(
          eq(jobs.status, "active"),
          sql`${jobs.deadline} IS NOT NULL AND ${jobs.deadline} < NOW()`
        )
      );
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

  async deleteApplication(id: number, applicantId: string): Promise<void> {
    await db.delete(applications).where(and(eq(applications.id, id), eq(applications.applicantId, applicantId)));
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
  async getUserByCvFilename(filename: string): Promise<User | undefined> {
    const pattern = `%${filename}`;
    const result = await db.select().from(users).where(like(users.cvUrl, pattern)).limit(1);
    return result[0];
  }

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

  async getStats(): Promise<{ totalUsers: number; totalJobs: number; totalApplications: number; totalEmployers: number; totalApplicants: number; premiumEmployers: number; activeJobs: number; pendingApplications: number }> {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [jobCount] = await db.select({ count: count() }).from(jobs);
    const [appCount] = await db.select({ count: count() }).from(applications);
    const [employerCount] = await db.select({ count: count() }).from(users).where(eq(users.role, "employer"));
    const [applicantCount] = await db.select({ count: count() }).from(users).where(eq(users.role, "applicant"));
    const [premiumCount] = await db.select({ count: count() }).from(users).where(and(eq(users.role, "employer"), eq(users.subscriptionStatus, "premium")));
    const [activeJobCount] = await db.select({ count: count() }).from(jobs).where(eq(jobs.isActive, true));
    const [pendingAppCount] = await db.select({ count: count() }).from(applications).where(eq(applications.status, "pending"));
    
    return {
      totalUsers: userCount.count,
      totalJobs: jobCount.count,
      totalApplications: appCount.count,
      totalEmployers: employerCount.count,
      totalApplicants: applicantCount.count,
      premiumEmployers: premiumCount.count,
      activeJobs: activeJobCount.count,
      pendingApplications: pendingAppCount.count,
    };
  }

  async getDetailedStats(): Promise<{
    usersByRole: { role: string; count: number }[];
    jobsByCategory: { category: string; count: number }[];
    applicationsByStatus: { status: string; count: number }[];
    subscriptionStats: { status: string; count: number }[];
    recentActivity: { date: string; users: number; jobs: number; applications: number }[];
  }> {
    const usersByRole = await db
      .select({ role: users.role, count: count() })
      .from(users)
      .groupBy(users.role);
    
    const jobsByCategory = await db
      .select({ category: jobs.category, count: count() })
      .from(jobs)
      .groupBy(jobs.category);
    
    const applicationsByStatus = await db
      .select({ status: applications.status, count: count() })
      .from(applications)
      .groupBy(applications.status);
    
    const subscriptionStats = await db
      .select({ status: users.subscriptionStatus, count: count() })
      .from(users)
      .where(eq(users.role, "employer"))
      .groupBy(users.subscriptionStatus);
    
    return {
      usersByRole: usersByRole.map(r => ({ role: r.role || 'unknown', count: r.count })),
      jobsByCategory: jobsByCategory.map(j => ({ category: j.category, count: j.count })),
      applicationsByStatus: applicationsByStatus.map(a => ({ status: a.status || 'pending', count: a.count })),
      subscriptionStats: subscriptionStats.map(s => ({ status: s.status || 'free', count: s.count })),
      recentActivity: [],
    };
  }

  // Ticket methods
  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const [newTicket] = await db.insert(tickets).values(ticket).returning();
    return newTicket;
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }

  async getAllTickets(filters?: { status?: string; priority?: string }): Promise<(Ticket & { senderName?: string; senderEmail?: string; senderRole?: string })[]> {
    const conditions: any[] = [];
    if (filters?.status) conditions.push(eq(tickets.status, filters.status));
    if (filters?.priority) conditions.push(eq(tickets.priority, filters.priority));
    
    const query = db
      .select({
        ticket: tickets,
        senderFirstName: users.firstName,
        senderLastName: users.lastName,
        senderEmail: users.email,
        senderRole: users.role,
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.userId, users.id))
      .orderBy(desc(tickets.createdAt));

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }
    
    const rows = await query;
    return rows.map(r => ({
      ...r.ticket,
      senderName: `${r.senderFirstName || ""} ${r.senderLastName || ""}`.trim() || "Unknown",
      senderEmail: r.senderEmail || undefined,
      senderRole: r.senderRole || undefined,
    }));
  }

  async getTicketsByUser(userId: string): Promise<Ticket[]> {
    return await db.select().from(tickets).where(eq(tickets.userId, userId)).orderBy(desc(tickets.createdAt));
  }

  async updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket> {
    const [ticket] = await db
      .update(tickets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return ticket;
  }

  // Ticket message methods
  async createTicketMessage(msg: InsertTicketMessage): Promise<TicketMessage> {
    const [created] = await db.insert(ticketMessages).values(msg).returning();
    return created;
  }

  async getTicketMessages(ticketId: number): Promise<TicketMessage[]> {
    return await db
      .select()
      .from(ticketMessages)
      .where(eq(ticketMessages.ticketId, ticketId))
      .orderBy(ticketMessages.createdAt);
  }

  async getUnreadMessageCount(ticketId: number, role: string): Promise<number> {
    const oppositeRole = role === "admin" ? "user" : "admin";
    const [result] = await db
      .select({ count: count() })
      .from(ticketMessages)
      .where(
        and(
          eq(ticketMessages.ticketId, ticketId),
          eq(ticketMessages.senderRole, oppositeRole),
          eq(ticketMessages.isRead, false)
        )
      );
    return result?.count || 0;
  }

  async markTicketMessagesRead(ticketId: number, readerRole: string): Promise<void> {
    const oppositeRole = readerRole === "admin" ? "user" : "admin";
    await db
      .update(ticketMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(ticketMessages.ticketId, ticketId),
          eq(ticketMessages.senderRole, oppositeRole),
          eq(ticketMessages.isRead, false)
        )
      );
  }

  async getTicketsWithUnreadCounts(userId: string, role: string): Promise<Record<number, number>> {
    const oppositeRole = role === "admin" ? "user" : "admin";
    let rows;
    if (role === "admin") {
      rows = await db
        .select({
          ticketId: ticketMessages.ticketId,
          unread: count(),
        })
        .from(ticketMessages)
        .where(
          and(
            eq(ticketMessages.senderRole, oppositeRole),
            eq(ticketMessages.isRead, false)
          )
        )
        .groupBy(ticketMessages.ticketId);
    } else {
      rows = await db
        .select({
          ticketId: ticketMessages.ticketId,
          unread: count(),
        })
        .from(ticketMessages)
        .innerJoin(tickets, eq(ticketMessages.ticketId, tickets.id))
        .where(
          and(
            eq(tickets.userId, userId),
            eq(ticketMessages.senderRole, oppositeRole),
            eq(ticketMessages.isRead, false)
          )
        )
        .groupBy(ticketMessages.ticketId);
    }
    const result: Record<number, number> = {};
    for (const row of rows) {
      result[row.ticketId] = row.unread;
    }
    return result;
  }

  // Report methods
  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }

  async getAllReports(filters?: { status?: string; type?: string }): Promise<Report[]> {
    const conditions: any[] = [];
    if (filters?.status) conditions.push(eq(reports.status, filters.status));
    if (filters?.type) conditions.push(eq(reports.reportedType, filters.type));
    
    if (conditions.length > 0) {
      return await db.select().from(reports).where(and(...conditions)).orderBy(desc(reports.createdAt));
    }
    return await db.select().from(reports).orderBy(desc(reports.createdAt));
  }

  async updateReport(id: number, updates: Partial<Report>): Promise<Report> {
    const [report] = await db
      .update(reports)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(reports.id, id))
      .returning();
    return report;
  }

  // Job history methods
  async getJobHistoryByUser(userId: string): Promise<JobHistory[]> {
    return await db.select().from(jobHistory).where(eq(jobHistory.userId, userId)).orderBy(desc(jobHistory.createdAt));
  }

  async createJobHistory(entry: InsertJobHistory): Promise<JobHistory> {
    const [newEntry] = await db.insert(jobHistory).values(entry).returning();
    return newEntry;
  }

  async updateJobHistory(id: number, userId: string, updates: Partial<InsertJobHistory>): Promise<JobHistory> {
    const [updated] = await db
      .update(jobHistory)
      .set(updates)
      .where(and(eq(jobHistory.id, id), eq(jobHistory.userId, userId)))
      .returning();
    return updated;
  }

  async deleteJobHistory(id: number, userId: string): Promise<void> {
    await db.delete(jobHistory).where(and(eq(jobHistory.id, id), eq(jobHistory.userId, userId)));
  }

  // Offer methods
  async createOffer(offer: InsertOffer): Promise<Offer> {
    const [newOffer] = await db.insert(offers).values(offer).returning();
    return newOffer;
  }

  async getOffer(id: number): Promise<Offer | undefined> {
    const [offer] = await db.select().from(offers).where(eq(offers.id, id));
    return offer;
  }

  async getOfferByApplication(applicationId: number): Promise<Offer | undefined> {
    const [offer] = await db.select().from(offers).where(eq(offers.applicationId, applicationId));
    return offer;
  }

  async getOffersForApplicant(applicantId: string): Promise<Offer[]> {
    return await db.select().from(offers).where(eq(offers.applicantId, applicantId)).orderBy(desc(offers.createdAt));
  }

  async getOffersForEmployer(employerId: string): Promise<Offer[]> {
    return await db.select().from(offers).where(eq(offers.employerId, employerId)).orderBy(desc(offers.createdAt));
  }

  async updateOfferStatus(id: number, status: string): Promise<Offer> {
    const [updated] = await db
      .update(offers)
      .set({ status, updatedAt: new Date() })
      .where(eq(offers.id, id))
      .returning();
    return updated;
  }

  // Interview methods
  async createInterview(interview: InsertInterview): Promise<Interview> {
    const [newInterview] = await db.insert(interviews).values(interview).returning();
    return newInterview;
  }

  async getInterview(id: number): Promise<Interview | undefined> {
    const [interview] = await db.select().from(interviews).where(eq(interviews.id, id));
    return interview;
  }

  async getInterviewByApplication(applicationId: number): Promise<Interview | undefined> {
    const [interview] = await db.select().from(interviews).where(
      and(eq(interviews.applicationId, applicationId), eq(interviews.status, "scheduled"))
    );
    return interview;
  }

  async getInterviewsForJob(jobId: number): Promise<Interview[]> {
    return await db.select().from(interviews).where(eq(interviews.jobId, jobId)).orderBy(desc(interviews.createdAt));
  }

  async getInterviewsForApplicant(applicantId: string): Promise<Interview[]> {
    return await db.select().from(interviews).where(eq(interviews.applicantId, applicantId)).orderBy(desc(interviews.createdAt));
  }

  async updateInterview(id: number, updates: Partial<Interview>): Promise<Interview> {
    const [updated] = await db
      .update(interviews)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(interviews.id, id))
      .returning();
    return updated;
  }

  // Verification request methods
  async createVerificationRequest(request: InsertVerificationRequest): Promise<VerificationRequest> {
    const [newRequest] = await db.insert(verificationRequests).values(request).returning();
    return newRequest;
  }

  async getVerificationRequest(id: number): Promise<VerificationRequest | undefined> {
    const [request] = await db.select().from(verificationRequests).where(eq(verificationRequests.id, id));
    return request;
  }

  async getVerificationRequestByUser(userId: string): Promise<VerificationRequest | undefined> {
    const [request] = await db.select().from(verificationRequests)
      .where(eq(verificationRequests.userId, userId))
      .orderBy(desc(verificationRequests.createdAt))
      .limit(1);
    return request;
  }

  async getAllVerificationRequests(filters?: { status?: string }): Promise<VerificationRequest[]> {
    const conditions = [];
    if (filters?.status) conditions.push(eq(verificationRequests.status, filters.status));
    return await db.select().from(verificationRequests)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(verificationRequests.createdAt));
  }

  async updateVerificationRequest(id: number, updates: Partial<VerificationRequest>): Promise<VerificationRequest> {
    const [updated] = await db
      .update(verificationRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(verificationRequests.id, id))
      .returning();
    return updated;
  }

  // Subscription methods
  async getUsersBySubscription(status: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(and(eq(users.role, "employer"), eq(users.subscriptionStatus, status)))
      .orderBy(desc(users.createdAt));
  }

  // Notification methods
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async getNotificationsForUser(userId: string, role: string): Promise<(Notification & { isRead: boolean })[]> {
    const allNotifs = await db
      .select()
      .from(notifications)
      .where(
        or(
          eq(notifications.type, "all"),
          and(eq(notifications.type, "role"), eq(notifications.targetRole, role)),
          and(eq(notifications.type, "individual"), eq(notifications.targetUserId, userId))
        )
      )
      .orderBy(desc(notifications.createdAt));

    const reads = await db
      .select({ notificationId: notificationReads.notificationId })
      .from(notificationReads)
      .where(eq(notificationReads.userId, userId));

    const readSet = new Set(reads.map(r => r.notificationId));
    return allNotifs.map(n => ({ ...n, isRead: readSet.has(n.id) }));
  }

  async getUnreadCountForUser(userId: string, role: string): Promise<number> {
    const allNotifs = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(
        or(
          eq(notifications.type, "all"),
          and(eq(notifications.type, "role"), eq(notifications.targetRole, role)),
          and(eq(notifications.type, "individual"), eq(notifications.targetUserId, userId))
        )
      );

    if (allNotifs.length === 0) return 0;

    const reads = await db
      .select({ notificationId: notificationReads.notificationId })
      .from(notificationReads)
      .where(eq(notificationReads.userId, userId));

    const readSet = new Set(reads.map(r => r.notificationId));
    return allNotifs.filter(n => !readSet.has(n.id)).length;
  }

  async markNotificationRead(notificationId: number, userId: string): Promise<void> {
    const existing = await db
      .select()
      .from(notificationReads)
      .where(and(eq(notificationReads.notificationId, notificationId), eq(notificationReads.userId, userId)));
    if (existing.length === 0) {
      await db.insert(notificationReads).values({ notificationId, userId });
    }
  }

  async markAllNotificationsRead(userId: string, role: string): Promise<void> {
    const allNotifs = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(
        or(
          eq(notifications.type, "all"),
          and(eq(notifications.type, "role"), eq(notifications.targetRole, role)),
          and(eq(notifications.type, "individual"), eq(notifications.targetUserId, userId))
        )
      );

    const reads = await db
      .select({ notificationId: notificationReads.notificationId })
      .from(notificationReads)
      .where(eq(notificationReads.userId, userId));

    const readSet = new Set(reads.map(r => r.notificationId));
    const unread = allNotifs.filter(n => !readSet.has(n.id));

    if (unread.length > 0) {
      await db.insert(notificationReads).values(
        unread.map(n => ({ notificationId: n.id, userId }))
      );
    }
  }

  async getAllNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async deleteNotification(id: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  // Platform settings methods
  async getSetting(key: string): Promise<string | null> {
    const [setting] = await db.select().from(platformSettings).where(eq(platformSettings.key, key));
    return setting?.value ?? null;
  }

  async getAllSettings(): Promise<PlatformSetting[]> {
    return await db.select().from(platformSettings).orderBy(platformSettings.key);
  }

  async upsertSetting(key: string, value: string, updatedBy: string): Promise<PlatformSetting> {
    const [existing] = await db.select().from(platformSettings).where(eq(platformSettings.key, key));
    if (existing) {
      const [updated] = await db
        .update(platformSettings)
        .set({ value, updatedBy, updatedAt: new Date() })
        .where(eq(platformSettings.key, key))
        .returning();
      return updated;
    }
    const [created] = await db.insert(platformSettings).values({ key, value, updatedBy }).returning();
    return created;
  }

  // Transaction methods
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [created] = await db.insert(transactions).values(transaction).returning();
    return created;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getAllTransactions(filters?: { type?: string; status?: string; gateway?: string }): Promise<Transaction[]> {
    const conditions = [];
    if (filters?.type) conditions.push(eq(transactions.type, filters.type));
    if (filters?.status) conditions.push(eq(transactions.status, filters.status));
    if (filters?.gateway) conditions.push(eq(transactions.gateway, filters.gateway));

    if (conditions.length > 0) {
      return await db.select().from(transactions).where(and(...conditions)).orderBy(desc(transactions.createdAt));
    }
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction> {
    const [updated] = await db.update(transactions).set({ status }).where(eq(transactions.id, id)).returning();
    return updated;
  }

  async getTransactionStats(): Promise<{
    totalRevenue: number;
    subscriptionRevenue: number;
    verificationRevenue: number;
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    monthlyRevenue: { month: string; subscriptions: number; verifications: number; total: number }[];
  }> {
    const allTxns = await db.select().from(transactions).orderBy(desc(transactions.createdAt));

    const successful = allTxns.filter(t => t.status === "success");
    const totalRevenue = successful.reduce((sum, t) => sum + t.amount, 0);
    const subscriptionRevenue = successful.filter(t => t.type === "subscription").reduce((sum, t) => sum + t.amount, 0);
    const verificationRevenue = successful.filter(t => t.type === "verification").reduce((sum, t) => sum + t.amount, 0);

    const monthlyMap = new Map<string, { subscriptions: number; verifications: number }>();
    for (const t of successful) {
      if (!t.createdAt) continue;
      const month = `${t.createdAt.getFullYear()}-${String(t.createdAt.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyMap.get(month) || { subscriptions: 0, verifications: 0 };
      if (t.type === "subscription") existing.subscriptions += t.amount;
      else if (t.type === "verification") existing.verifications += t.amount;
      monthlyMap.set(month, existing);
    }

    const monthlyRevenue = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        subscriptions: data.subscriptions,
        verifications: data.verifications,
        total: data.subscriptions + data.verifications,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalRevenue,
      subscriptionRevenue,
      verificationRevenue,
      totalTransactions: allTxns.length,
      successfulTransactions: successful.length,
      failedTransactions: allTxns.filter(t => t.status === "failed").length,
      monthlyRevenue,
    };
  }
}

export const storage = new DatabaseStorage();
