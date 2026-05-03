export interface User {
  id: string;
  email?: string | null;
  password?: string | null;
  googleId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  role?: string | null;
  age?: number | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  phone?: string | null;
  bio?: string | null;
  cvUrl?: string | null;
  location?: string | null;
  state?: string | null;
  lga?: string | null;
  city?: string | null;
  expectedSalaryMin?: number | null;
  expectedSalaryMax?: number | null;
  companyName?: string | null;
  businessCategory?: string | null;
  companyLogo?: string | null;
  companyAddress?: string | null;
  companyCity?: string | null;
  companyState?: string | null;
  isRegisteredCompany?: boolean | null;
  companyRegNo?: string | null;
  emailVerified?: boolean | null;
  emailVerificationCode?: string | null;
  isVerified?: boolean | null;
  subscriptionStatus?: string | null;
  subscriptionEndDate?: Date | null;
  paystackCustomerId?: string | null;
  paystackSubscriptionCode?: string | null;
  subscribedToNewsletter?: boolean | null;
  interviewCreditsUsed?: number | null;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  isAdmin?: boolean | null;
  isSuperAdmin?: boolean | null;
  isSubAdmin?: boolean | null;
  isAgent?: boolean | null;
  agentCode?: string | null;
  agentCredits?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface Job {
  id: number;
  employerId: string;
  title: string;
  description: string;
  category: string;
  jobType: string;
  salaryMin: number;
  salaryMax: number;
  wage: string;
  location: string;
  state?: string | null;
  lga?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  deadline?: Date | null;
  status?: string | null;
  slug?: string | null;
  views?: number | null;
  isVerified?: boolean | null;
  isFeatured?: boolean | null;
  applicationCount?: number | null;
  tags?: string[] | null;
  employerName?: string | null;
  employerLogo?: string | null;
  employerPhone?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface Application {
  id: number;
  jobId: number;
  applicantId: string;
  status?: string | null;
  coverLetter?: string | null;
  cvUrl?: string | null;
  notes?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface AdminPermissions {
  id: number;
  userId: string;
  canManageUsers?: boolean | null;
  canManageJobs?: boolean | null;
  canManageSubscriptions?: boolean | null;
  canViewStatistics?: boolean | null;
  canManageTickets?: boolean | null;
  canManageReports?: boolean | null;
  canManageVerifications?: boolean | null;
  canManageNotifications?: boolean | null;
  canManageSettings?: boolean | null;
  canManageTransactions?: boolean | null;
  canManageAds?: boolean | null;
  canManageHiringCompanies?: boolean | null;
  createdAt?: Date | null;
}

export interface Ticket {
  id: number;
  userId: string;
  subject: string;
  status?: string | null;
  priority?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface TicketMessage {
  id: number;
  ticketId: number;
  senderId: string;
  message: string;
  isAdmin?: boolean | null;
  createdAt?: Date | null;
}

export interface Transaction {
  id: number;
  userId: string;
  amount: number;
  type: string;
  status?: string | null;
  reference?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: Date | null;
}

export interface JobHistory {
  id: number;
  userId: string;
  jobId?: number | null;
  action: string;
  details?: Record<string, unknown> | null;
  createdAt?: Date | null;
}

export interface InternalAd {
  id: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  placement?: string | null;
  isActive?: boolean | null;
  startDate?: Date | null;
  endDate?: Date | null;
  impressions?: number | null;
  clicks?: number | null;
  createdAt?: Date | null;
}

export interface GoogleAdPlacement {
  id: number;
  name: string;
  adCode: string;
  placement?: string | null;
  isActive?: boolean | null;
  createdAt?: Date | null;
}

export interface ActivityLog {
  id: number;
  userId?: string | null;
  action: string;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt?: Date | null;
}

export interface HiringCompany {
  id: number;
  name: string;
  logoUrl?: string | null;
  website?: string | null;
  isActive?: boolean | null;
  createdAt?: Date | null;
}

export type InsertUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertJob = Omit<Job, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertApplication = Omit<Application, 'id' | 'createdAt' | 'updatedAt'>;
