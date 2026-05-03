import { useState } from "react";
import { PageHeader } from "@/components/ui-extension";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  ShieldX,
  CheckCircle2,
  XCircle,
  Eye,
  User,
  FileText,
  Camera,
  Loader2,
  Search,
  EyeOff,
  Calendar,
  Users,
  AlertTriangle,
  Building2,
  Crown,
  Briefcase,
  Coins,
  Plus,
  Minus,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdminPagination, usePagination } from "@/components/AdminPagination";
import { usePageTitle } from "@/hooks/use-page-title";
import type { User as UserType } from "@shared/schema";
import { format } from "date-fns";

type ApplicantVerification = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl: string | null;
  phone: string | null;
  isVerified: boolean;
  verificationExpiry: string | null;
  isExpired: boolean;
  isSuspended: boolean;
  createdAt: string;
};

type VerificationRequest = {
  id: number;
  userId: string;
  idType: string;
  idNumber: string;
  idDocumentUrl: string | null;
  selfieUrl: string | null;
  status: string;
  adminNotes: string | null;
  reviewedBy: string | null;
  createdAt: string;
  userName: string;
  userEmail: string;
  userProfileImage: string | null;
};

type AgentCredit = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  agencyName: string | null;
  phone: string | null;
  agentPostCredits: number;
  subscriptionStatus: string | null;
  createdAt: string | null;
};

const idTypeLabels: Record<string, string> = {
  nin: "NIN",
  voters_card: "Voter's Card",
  drivers_license: "Driver's License",
  international_passport: "Int'l Passport",
};

const statusColors: Record<string, string> = {
  awaiting_payment: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  under_review: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

function SubscriptionBadge({ status }: { status: string | null }) {
  switch (status) {
    case "enterprise": return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs"><Crown className="w-3 h-3 mr-1" />Enterprise</Badge>;
    case "premium": return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs"><Crown className="w-3 h-3 mr-1" />Premium</Badge>;
    case "standard": return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">Standard</Badge>;
    default: return <Badge variant="secondary" className="text-xs">Free</Badge>;
  }
}

export default function AdminVerifications() {
  usePageTitle("Admin Verifications");
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("applicants");
  const [searchQuery, setSearchQuery] = useState("");
  const [verifyFilter, setVerifyFilter] = useState<string>("all");
  const [appPage, setAppPage] = useState(0);
  const [appPageSize, setAppPageSize] = useState(20);
  const [reqPage, setReqPage] = useState(0);
  const [reqPageSize, setReqPageSize] = useState(20);
  const [empPage, setEmpPage] = useState(0);
  const [empPageSize, setEmpPageSize] = useState(20);
  const [agentPage, setAgentPage] = useState(0);
  const [agentPageSize, setAgentPageSize] = useState(20);

  const [requestStatusFilter, setRequestStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantVerification | null>(null);
  const [expiryDate, setExpiryDate] = useState("");

  const [empSearch, setEmpSearch] = useState("");
  const [empSubFilter, setEmpSubFilter] = useState<string>("all");
  const [editingEmployer, setEditingEmployer] = useState<UserType | null>(null);
  const [editSubForm, setEditSubForm] = useState({ subscriptionStatus: "free" as string, subscriptionEndDate: "" });

  const [agentSearch, setAgentSearch] = useState("");
  const [managingAgent, setManagingAgent] = useState<AgentCredit | null>(null);
  const [creditAction, setCreditAction] = useState<"add" | "deduct" | "set">("add");
  const [creditAmount, setCreditAmount] = useState(1);
  const [creditReason, setCreditReason] = useState("");
  const [editingAgentSub, setEditingAgentSub] = useState<UserType | null>(null);
  const [editAgentSubForm, setEditAgentSubForm] = useState({ subscriptionStatus: "free" as string, subscriptionEndDate: "" });

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/admin/settings"],
  });

  const hideUnverified = settings?.hide_unverified_details !== "false";

  const toggleHideUnverifiedMutation = useMutation({
    mutationFn: async (value: boolean) => {
      await apiRequest("PATCH", "/api/admin/settings", { hide_unverified_details: value ? "true" : "false" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Setting updated" });
    },
  });

  const { data: applicants = [], isLoading: applicantsLoading } = useQuery<ApplicantVerification[]>({
    queryKey: ["/api/admin/applicants-verification"],
  });

  const { data: requests = [], isLoading: requestsLoading } = useQuery<VerificationRequest[]>({
    queryKey: ["/api/admin/verification-requests", requestStatusFilter],
    queryFn: async () => {
      const url = requestStatusFilter !== "all"
        ? `/api/admin/verification-requests?status=${requestStatusFilter}`
        : "/api/admin/verification-requests";
      const res = await fetch(url, { credentials: "include" });
      return res.json();
    },
  });

  const { data: employers = [], isLoading: employersLoading } = useQuery<UserType[]>({
    queryKey: ["/api/admin/subscriptions", empSubFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (empSubFilter !== "all") params.set("status", empSubFilter);
      const url = `/api/admin/subscriptions${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url, { credentials: "include" });
      return res.json();
    },
  });

  const { data: agents = [], isLoading: agentsLoading } = useQuery<AgentCredit[]>({
    queryKey: ["/api/admin/agent-credits"],
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ userId, isVerified, verificationExpiry }: { userId: string; isVerified: boolean; verificationExpiry?: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/applicants-verification/${userId}`, { isVerified, verificationExpiry: verificationExpiry || undefined });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applicants-verification"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verification-requests"] });
      setVerifyDialogOpen(false);
      setSelectedApplicant(null);
      setExpiryDate("");
      toast({ title: variables.isVerified ? "Applicant Verified" : "Verification Removed" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/verification-requests/${id}`, { status, adminNotes: notes });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verification-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applicants-verification"] });
      setReviewDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes("");
      toast({ title: variables.status === "approved" ? "Applicant Verified" : "Verification Rejected" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: { subscriptionStatus?: string; subscriptionEndDate?: string } }) => {
      return apiRequest("PATCH", `/api/admin/subscriptions/${userId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/agent-credits"] });
      toast({ title: "Subscription updated" });
      setEditingEmployer(null);
      setEditingAgentSub(null);
    },
    onError: () => {
      toast({ title: "Failed to update subscription", variant: "destructive" });
    },
  });

  const updateCreditsMutation = useMutation({
    mutationFn: async ({ userId, action, amount, reason }: { userId: string; action: string; amount: number; reason: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/agent-credits/${userId}`, { action, amount, reason });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/agent-credits"] });
      toast({ title: "Credits Updated", description: `Credits changed from ${data.previousCredits} to ${data.newCredits}` });
      setManagingAgent(null);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const openVerifyDialog = (applicant: ApplicantVerification) => {
    setSelectedApplicant(applicant);
    if (applicant.verificationExpiry) {
      setExpiryDate(new Date(applicant.verificationExpiry).toISOString().split("T")[0]);
    } else {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setExpiryDate(d.toISOString().split("T")[0]);
    }
    setVerifyDialogOpen(true);
  };

  const openReview = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || "");
    setReviewDialogOpen(true);
  };

  const openEditEmployerSub = (employer: UserType) => {
    setEditingEmployer(employer);
    setEditSubForm({
      subscriptionStatus: employer.subscriptionStatus || "free",
      subscriptionEndDate: employer.subscriptionEndDate ? format(new Date(employer.subscriptionEndDate), "yyyy-MM-dd") : "",
    });
  };

  const openEditAgentSub = (agent: AgentCredit) => {
    setEditingAgentSub({ id: agent.id, subscriptionStatus: agent.subscriptionStatus } as any);
    setEditAgentSubForm({
      subscriptionStatus: agent.subscriptionStatus || "free",
      subscriptionEndDate: "",
    });
  };

  const filteredApplicants = applicants.filter((a) => {
    const matchesSearch = searchQuery === "" ||
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      verifyFilter === "all" ||
      (verifyFilter === "verified" && a.isVerified) ||
      (verifyFilter === "unverified" && !a.isVerified && !a.isExpired) ||
      (verifyFilter === "expired" && a.isExpired);
    return matchesSearch && matchesFilter;
  });

  const filteredEmployers = (employers || []).filter((e: UserType) => {
    if (e.role === "agent") return false;
    if (!empSearch) return true;
    const q = empSearch.toLowerCase();
    return e.firstName?.toLowerCase().includes(q) || e.lastName?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q) || e.companyName?.toLowerCase().includes(q);
  });

  const filteredAgents = agents.filter((a) => {
    if (!agentSearch) return true;
    const q = agentSearch.toLowerCase();
    return a.firstName?.toLowerCase().includes(q) || a.lastName?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q) || a.agencyName?.toLowerCase().includes(q);
  });

  const paginatedApplicants = usePagination(filteredApplicants, appPageSize, appPage);
  const paginatedRequests = usePagination(requests, reqPageSize, reqPage);
  const paginatedEmployers = usePagination(filteredEmployers, empPageSize, empPage);
  const paginatedAgents = usePagination(filteredAgents, agentPageSize, agentPage);

  const verifiedCount = applicants.filter(a => a.isVerified).length;
  const unverifiedCount = applicants.filter(a => !a.isVerified && !a.isExpired).length;
  const expiredCount = applicants.filter(a => a.isExpired).length;
  const pendingRequestsCount = requests.filter(r => r.status === "pending" || r.status === "under_review").length;
  const empPaidCount = filteredEmployers.filter((e: UserType) => e.subscriptionStatus && e.subscriptionStatus !== "free").length;
  const agentCreditsTotal = agents.reduce((sum, a) => sum + a.agentPostCredits, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verifications & User Management"
        description="Manage applicant verification, employer subscriptions, and agent credits"
      />

      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="flex items-center justify-between py-4 px-5">
          <div className="flex items-center gap-3">
            <EyeOff className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div>
              <Label htmlFor="hide-unverified-toggle" className="font-medium text-sm cursor-pointer">
                Hide unverified applicant details
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                When enabled, employers and agents cannot see contact info, CV, or email of unverified applicants.
              </p>
            </div>
          </div>
          <Switch
            id="hide-unverified-toggle"
            data-testid="toggle-hide-unverified"
            checked={hideUnverified}
            disabled={toggleHideUnverifiedMutation.isPending}
            onCheckedChange={(checked) => toggleHideUnverifiedMutation.mutate(checked)}
          />
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="applicants" data-testid="tab-applicants" className="text-xs sm:text-sm">
            Applicants
          </TabsTrigger>
          <TabsTrigger value="requests" data-testid="tab-requests" className="text-xs sm:text-sm">
            Requests {pendingRequestsCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-[10px] px-1.5 py-0">{pendingRequestsCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="employers" data-testid="tab-employers" className="text-xs sm:text-sm">
            Employers
          </TabsTrigger>
          <TabsTrigger value="agents" data-testid="tab-agents" className="text-xs sm:text-sm">
            Agents
          </TabsTrigger>
        </TabsList>

        {/* ========== APPLICANTS TAB ========== */}
        <TabsContent value="applicants" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="p-3 text-center"><Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" /><p className="text-xl font-bold">{applicants.length}</p><p className="text-[11px] text-muted-foreground">Total</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><ShieldCheck className="w-4 h-4 mx-auto mb-1 text-green-600" /><p className="text-xl font-bold text-green-600">{verifiedCount}</p><p className="text-[11px] text-muted-foreground">Verified</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><ShieldX className="w-4 h-4 mx-auto mb-1 text-red-500" /><p className="text-xl font-bold text-red-500">{unverifiedCount}</p><p className="text-[11px] text-muted-foreground">Unverified</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><AlertTriangle className="w-4 h-4 mx-auto mb-1 text-orange-500" /><p className="text-xl font-bold text-orange-500">{expiredCount}</p><p className="text-[11px] text-muted-foreground">Expired</p></CardContent></Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" data-testid="input-search-applicants" />
            </div>
            <Select value={verifyFilter} onValueChange={setVerifyFilter}>
              <SelectTrigger className="w-40" data-testid="select-verify-filter"><SelectValue placeholder="Filter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {applicantsLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
          ) : filteredApplicants.length === 0 ? (
            <Card><CardContent className="p-8 text-center"><Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><p className="text-muted-foreground">No applicants found.</p></CardContent></Card>
          ) : (
            <div className="space-y-2">
              {paginatedApplicants.map((applicant) => (
                <motion.div key={applicant.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="hover-elevate" data-testid={`card-applicant-${applicant.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 shrink-0">
                          {applicant.profileImageUrl && <AvatarImage src={applicant.profileImageUrl} />}
                          <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm truncate">{applicant.firstName} {applicant.lastName}</h3>
                            {applicant.isVerified ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs gap-1"><ShieldCheck className="w-3 h-3" /> Verified</Badge>
                            ) : applicant.isExpired ? (
                              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 text-xs gap-1"><AlertTriangle className="w-3 h-3" /> Expired</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs gap-1"><ShieldX className="w-3 h-3" /> Unverified</Badge>
                            )}
                            {applicant.isSuspended && <Badge variant="destructive" className="text-xs">Suspended</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{applicant.email}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {applicant.verificationExpiry && (
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Expires: {new Date(applicant.verificationExpiry).toLocaleDateString()}</span>
                            )}
                            <span>Joined: {new Date(applicant.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button variant={applicant.isVerified ? "outline" : "default"} size="sm" className="gap-1 shrink-0" onClick={() => openVerifyDialog(applicant)} data-testid={`button-manage-${applicant.id}`}>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {applicant.isVerified ? "Manage" : "Verify"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              <AdminPagination totalItems={filteredApplicants.length} currentPage={appPage} pageSize={appPageSize} onPageChange={setAppPage} onPageSizeChange={setAppPageSize} />
            </div>
          )}
        </TabsContent>

        {/* ========== VERIFICATION REQUESTS TAB ========== */}
        <TabsContent value="requests" className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <Select value={requestStatusFilter} onValueChange={setRequestStatusFilter}>
              <SelectTrigger className="w-48" data-testid="select-status-filter"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {requestsLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}</div>
          ) : requests.length === 0 ? (
            <Card><CardContent className="p-8 text-center"><ShieldCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><p className="text-muted-foreground">No verification requests found.</p></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {paginatedRequests.map((request) => (
                <motion.div key={request.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="hover-elevate" data-testid={`card-verification-${request.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 shrink-0">
                          {request.userProfileImage && <AvatarImage src={request.userProfileImage} />}
                          <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm truncate">{request.userName || "Unknown"}</h3>
                            <Badge className={`text-xs ${statusColors[request.status] || ""}`}>
                              {request.status === "under_review" ? "Under Review" : request.status === "awaiting_payment" ? "Awaiting Payment" : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{request.userEmail}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{idTypeLabels[request.idType] || request.idType}</span>
                            <span>{request.idNumber}</span>
                            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1 shrink-0" onClick={() => openReview(request)} data-testid={`button-review-${request.id}`}>
                          <Eye className="w-3.5 h-3.5" />Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              <AdminPagination totalItems={requests.length} currentPage={reqPage} pageSize={reqPageSize} onPageChange={setReqPage} onPageSizeChange={setReqPageSize} />
            </div>
          )}
        </TabsContent>

        {/* ========== EMPLOYERS TAB ========== */}
        <TabsContent value="employers" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Card><CardContent className="p-3 text-center"><Building2 className="w-4 h-4 mx-auto mb-1 text-blue-600" /><p className="text-xl font-bold">{filteredEmployers.length}</p><p className="text-[11px] text-muted-foreground">Total Employers</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><Crown className="w-4 h-4 mx-auto mb-1 text-amber-600" /><p className="text-xl font-bold text-amber-600">{empPaidCount}</p><p className="text-[11px] text-muted-foreground">Paid Plans</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><Building2 className="w-4 h-4 mx-auto mb-1 text-muted-foreground" /><p className="text-xl font-bold">{filteredEmployers.length - empPaidCount}</p><p className="text-[11px] text-muted-foreground">Free Tier</p></CardContent></Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, email, or company..." value={empSearch} onChange={(e) => setEmpSearch(e.target.value)} className="pl-9" data-testid="input-search-employers" />
            </div>
            <Select value={empSubFilter} onValueChange={setEmpSubFilter}>
              <SelectTrigger className="w-44" data-testid="select-employer-sub-filter"><SelectValue placeholder="Filter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {employersLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
          ) : filteredEmployers.length === 0 ? (
            <Card><CardContent className="p-8 text-center"><Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><p className="text-muted-foreground">No employers found.</p></CardContent></Card>
          ) : (
            <div className="space-y-2">
              {paginatedEmployers.map((employer: UserType) => (
                <motion.div key={employer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="hover-elevate" data-testid={`card-employer-${employer.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 shrink-0">
                          {employer.profileImageUrl && <AvatarImage src={employer.profileImageUrl} />}
                          <AvatarFallback><Building2 className="w-5 h-5" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm truncate">{employer.companyName || `${employer.firstName || ""} ${employer.lastName || ""}`.trim() || employer.email}</h3>
                            <SubscriptionBadge status={employer.subscriptionStatus} />
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{employer.email}</p>
                          {employer.subscriptionEndDate && (
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />Expires: {format(new Date(employer.subscriptionEndDate), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                        <Button variant="outline" size="sm" className="gap-1 shrink-0" onClick={() => openEditEmployerSub(employer)} data-testid={`button-edit-employer-${employer.id}`}>
                          <Settings className="w-3.5 h-3.5" />Manage
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              <AdminPagination totalItems={filteredEmployers.length} currentPage={empPage} pageSize={empPageSize} onPageChange={setEmpPage} onPageSizeChange={setEmpPageSize} />
            </div>
          )}
        </TabsContent>

        {/* ========== AGENTS TAB ========== */}
        <TabsContent value="agents" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="p-3 text-center"><Briefcase className="w-4 h-4 mx-auto mb-1 text-teal-500" /><p className="text-xl font-bold">{agents.length}</p><p className="text-[11px] text-muted-foreground">Total Agents</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><Coins className="w-4 h-4 mx-auto mb-1 text-primary" /><p className="text-xl font-bold">{agentCreditsTotal}</p><p className="text-[11px] text-muted-foreground">Total Credits</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><Plus className="w-4 h-4 mx-auto mb-1 text-green-500" /><p className="text-xl font-bold text-green-600">{agents.filter(a => a.agentPostCredits > 0).length}</p><p className="text-[11px] text-muted-foreground">With Credits</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><Minus className="w-4 h-4 mx-auto mb-1 text-red-500" /><p className="text-xl font-bold text-red-500">{agents.filter(a => a.agentPostCredits === 0).length}</p><p className="text-[11px] text-muted-foreground">No Credits</p></CardContent></Card>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, email, or agency..." value={agentSearch} onChange={(e) => setAgentSearch(e.target.value)} className="pl-9" data-testid="input-search-agents" />
          </div>

          {agentsLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
          ) : filteredAgents.length === 0 ? (
            <Card><CardContent className="p-8 text-center"><Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><p className="text-muted-foreground">No agents found.</p></CardContent></Card>
          ) : (
            <div className="space-y-2">
              {paginatedAgents.map((agent) => (
                <motion.div key={agent.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="hover-elevate" data-testid={`card-agent-${agent.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarFallback><Briefcase className="w-5 h-5" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm truncate">{agent.firstName} {agent.lastName}</h3>
                            <SubscriptionBadge status={agent.subscriptionStatus} />
                            <Badge variant="outline" className="text-xs gap-1"><Coins className="w-3 h-3" />{agent.agentPostCredits} credits</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{agent.email}</p>
                          {agent.agencyName && (
                            <p className="text-xs text-muted-foreground/70 truncate flex items-center gap-1 mt-0.5"><Building2 className="w-3 h-3" />{agent.agencyName}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="outline" size="sm" className="gap-1" onClick={() => openEditAgentSub(agent)} data-testid={`button-sub-agent-${agent.id}`}>
                            <Crown className="w-3.5 h-3.5" />Sub
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1" onClick={() => { setManagingAgent(agent); setCreditAction("add"); setCreditAmount(1); setCreditReason(""); }} data-testid={`button-credits-agent-${agent.id}`}>
                            <Coins className="w-3.5 h-3.5" />Credits
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              <AdminPagination totalItems={filteredAgents.length} currentPage={agentPage} pageSize={agentPageSize} onPageChange={setAgentPage} onPageSizeChange={setAgentPageSize} />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ========== VERIFY APPLICANT DIALOG ========== */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" />Manage Verification</DialogTitle>
            <DialogDescription>{selectedApplicant ? `${selectedApplicant.firstName} ${selectedApplicant.lastName} — ${selectedApplicant.email}` : ""}</DialogDescription>
          </DialogHeader>
          {selectedApplicant && (
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    {selectedApplicant.profileImageUrl && <AvatarImage src={selectedApplicant.profileImageUrl} />}
                    <AvatarFallback><User className="w-6 h-6" /></AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedApplicant.firstName} {selectedApplicant.lastName}</p>
                    <p className="text-xs text-muted-foreground">{selectedApplicant.email}</p>
                  </div>
                  {selectedApplicant.isVerified ? (
                    <Badge className="ml-auto bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 gap-1"><ShieldCheck className="w-3 h-3" />Verified</Badge>
                  ) : selectedApplicant.isExpired ? (
                    <Badge className="ml-auto bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 gap-1"><AlertTriangle className="w-3 h-3" />Expired</Badge>
                  ) : (
                    <Badge variant="secondary" className="ml-auto gap-1"><ShieldX className="w-3 h-3" />Unverified</Badge>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry-date" className="text-sm font-medium">Verification Expiry Date</Label>
                <Input id="expiry-date" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} min={new Date().toISOString().split("T")[0]} data-testid="input-expiry-date" />
                <p className="text-xs text-muted-foreground">Set when the verification expires. After this date, the applicant will need to re-verify.</p>
              </div>
              <div className="flex flex-col gap-2">
                {!selectedApplicant.isVerified ? (
                  <Button className="w-full gap-2" onClick={() => verifyMutation.mutate({ userId: selectedApplicant.id, isVerified: true, verificationExpiry: expiryDate })} disabled={verifyMutation.isPending || !expiryDate} data-testid="button-verify-applicant">
                    {verifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}Verify Applicant
                  </Button>
                ) : (
                  <>
                    <Button className="w-full gap-2" onClick={() => verifyMutation.mutate({ userId: selectedApplicant.id, isVerified: true, verificationExpiry: expiryDate })} disabled={verifyMutation.isPending || !expiryDate} data-testid="button-update-expiry">
                      {verifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}Update Expiry Date
                    </Button>
                    <Button variant="destructive" className="w-full gap-2" onClick={() => verifyMutation.mutate({ userId: selectedApplicant.id, isVerified: false })} disabled={verifyMutation.isPending} data-testid="button-remove-verification">
                      {verifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}Remove Verification
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========== REVIEW VERIFICATION REQUEST DIALOG ========== */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" />Review Verification</DialogTitle>
            <DialogDescription>Review {selectedRequest?.userName}'s identity verification documents.</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-md bg-muted/50"><p className="text-xs text-muted-foreground mb-1">ID Type</p><p className="font-medium text-sm">{idTypeLabels[selectedRequest.idType] || selectedRequest.idType}</p></div>
                <div className="p-3 rounded-md bg-muted/50"><p className="text-xs text-muted-foreground mb-1">ID Number</p><p className="font-medium text-sm">{selectedRequest.idNumber}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {selectedRequest.idDocumentUrl && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="w-3 h-3" /> ID Document</p>
                    <a href={selectedRequest.idDocumentUrl} target="_blank" rel="noopener noreferrer">
                      <img src={selectedRequest.idDocumentUrl} alt="ID Document" className="w-full h-32 object-cover rounded-md border cursor-pointer hover:opacity-80 transition" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </a>
                  </div>
                )}
                {selectedRequest.selfieUrl && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Camera className="w-3 h-3" /> Selfie</p>
                    <a href={selectedRequest.selfieUrl} target="_blank" rel="noopener noreferrer">
                      <img src={selectedRequest.selfieUrl} alt="Selfie" className="w-full h-32 object-cover rounded-md border cursor-pointer hover:opacity-80 transition" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </a>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Admin Notes</p>
                <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Add notes about this verification (optional)" rows={3} data-testid="textarea-admin-notes" />
              </div>
              {(selectedRequest.status === "pending" || selectedRequest.status === "under_review") && (
                <div className="flex items-center gap-2">
                  <Button className="flex-1 gap-2" onClick={() => reviewMutation.mutate({ id: selectedRequest.id, status: "approved", notes: adminNotes })} disabled={reviewMutation.isPending} data-testid="button-approve-verification">
                    {reviewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}Approve
                  </Button>
                  <Button variant="destructive" className="flex-1 gap-2" onClick={() => reviewMutation.mutate({ id: selectedRequest.id, status: "rejected", notes: adminNotes })} disabled={reviewMutation.isPending} data-testid="button-reject-verification">
                    {reviewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}Reject
                  </Button>
                </div>
              )}
              {selectedRequest.status === "approved" && <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>}
              {selectedRequest.status === "rejected" && <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========== EDIT EMPLOYER SUBSCRIPTION DIALOG ========== */}
      <Dialog open={!!editingEmployer} onOpenChange={() => setEditingEmployer(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Crown className="w-5 h-5 text-primary" />Edit Subscription</DialogTitle>
            <DialogDescription>{editingEmployer ? `${editingEmployer.companyName || `${editingEmployer.firstName || ""} ${editingEmployer.lastName || ""}`.trim()} — ${editingEmployer.email}` : ""}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Subscription Plan</Label>
              <Select value={editSubForm.subscriptionStatus} onValueChange={(v) => setEditSubForm({ ...editSubForm, subscriptionStatus: v })}>
                <SelectTrigger data-testid="select-edit-subscription"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editSubForm.subscriptionStatus !== "free" && (
              <div className="space-y-2">
                <Label>Subscription End Date</Label>
                <Input type="date" value={editSubForm.subscriptionEndDate} onChange={(e) => setEditSubForm({ ...editSubForm, subscriptionEndDate: e.target.value })} min={new Date().toISOString().split("T")[0]} data-testid="input-subscription-end-date" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEmployer(null)}>Cancel</Button>
            <Button onClick={() => { if (editingEmployer) updateSubscriptionMutation.mutate({ userId: editingEmployer.id, updates: { subscriptionStatus: editSubForm.subscriptionStatus, subscriptionEndDate: editSubForm.subscriptionEndDate || undefined } }); }} disabled={updateSubscriptionMutation.isPending} data-testid="button-save-subscription">
              {updateSubscriptionMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== EDIT AGENT SUBSCRIPTION DIALOG ========== */}
      <Dialog open={!!editingAgentSub} onOpenChange={() => setEditingAgentSub(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Crown className="w-5 h-5 text-primary" />Agent Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Subscription Plan</Label>
              <Select value={editAgentSubForm.subscriptionStatus} onValueChange={(v) => setEditAgentSubForm({ ...editAgentSubForm, subscriptionStatus: v })}>
                <SelectTrigger data-testid="select-edit-agent-subscription"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editAgentSubForm.subscriptionStatus !== "free" && (
              <div className="space-y-2">
                <Label>Subscription End Date</Label>
                <Input type="date" value={editAgentSubForm.subscriptionEndDate} onChange={(e) => setEditAgentSubForm({ ...editAgentSubForm, subscriptionEndDate: e.target.value })} min={new Date().toISOString().split("T")[0]} data-testid="input-agent-sub-end-date" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAgentSub(null)}>Cancel</Button>
            <Button onClick={() => { if (editingAgentSub) updateSubscriptionMutation.mutate({ userId: editingAgentSub.id, updates: { subscriptionStatus: editAgentSubForm.subscriptionStatus, subscriptionEndDate: editAgentSubForm.subscriptionEndDate || undefined } }); }} disabled={updateSubscriptionMutation.isPending} data-testid="button-save-agent-sub">
              {updateSubscriptionMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== MANAGE AGENT CREDITS DIALOG ========== */}
      <Dialog open={!!managingAgent} onOpenChange={(open) => { if (!open) setManagingAgent(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Coins className="w-5 h-5 text-primary" />Manage Credits</DialogTitle>
            <DialogDescription>Adjust job post credits for this agent</DialogDescription>
          </DialogHeader>
          {managingAgent && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 border p-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Agent</span><span className="font-medium">{managingAgent.firstName} {managingAgent.lastName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="text-xs font-mono">{managingAgent.email}</span></div>
                {managingAgent.agencyName && <div className="flex justify-between"><span className="text-muted-foreground">Agency</span><span>{managingAgent.agencyName}</span></div>}
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Current Credits</span><span className="font-bold text-lg text-primary" data-testid="text-current-credits">{managingAgent.agentPostCredits}</span></div>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Action</Label>
                  <Select value={creditAction} onValueChange={(v) => setCreditAction(v as any)}>
                    <SelectTrigger data-testid="select-credit-action"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">Add Credits</SelectItem>
                      <SelectItem value="deduct">Deduct Credits</SelectItem>
                      <SelectItem value="set">Set Credits To</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Amount</Label>
                  <Input type="number" min={1} value={creditAmount} onChange={(e) => setCreditAmount(Math.max(1, parseInt(e.target.value) || 1))} data-testid="input-credit-amount" />
                </div>
                <div className="space-y-1.5">
                  <Label>Reason (optional)</Label>
                  <Textarea placeholder="e.g. Promotional bonus, payment confirmed manually..." value={creditReason} onChange={(e) => setCreditReason(e.target.value)} rows={2} data-testid="input-credit-reason" />
                </div>
              </div>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 p-3 text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">Preview:</p>
                <p className="text-blue-700 dark:text-blue-400 text-xs">
                  {creditAction === "add" && `Credits will change from ${managingAgent.agentPostCredits} → ${managingAgent.agentPostCredits + creditAmount}`}
                  {creditAction === "deduct" && `Credits will change from ${managingAgent.agentPostCredits} → ${Math.max(0, managingAgent.agentPostCredits - creditAmount)}`}
                  {creditAction === "set" && `Credits will be set to ${Math.max(0, creditAmount)}`}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setManagingAgent(null)} data-testid="button-cancel-credits">Cancel</Button>
            <Button onClick={() => { if (managingAgent) updateCreditsMutation.mutate({ userId: managingAgent.id, action: creditAction, amount: creditAmount, reason: creditReason }); }} disabled={updateCreditsMutation.isPending} data-testid="button-confirm-credits">
              {updateCreditsMutation.isPending ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
