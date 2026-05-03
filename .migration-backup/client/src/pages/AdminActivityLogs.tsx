import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-extension";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Search, Activity, User, Clock, Filter, Trash2, ChevronLeft, ChevronRight, LogIn, UserPlus, Briefcase, FileText, Settings, Shield, CreditCard, Bell, Ticket, Flag, Megaphone, Eye } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { usePageTitle } from "@/hooks/use-page-title";
import type { ActivityLog } from "@shared/schema";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "auth", label: "Authentication" },
  { value: "jobs", label: "Jobs" },
  { value: "applications", label: "Applications" },
  { value: "users", label: "Users" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "admin", label: "Admin" },
  { value: "settings", label: "Settings" },
  { value: "tickets", label: "Tickets" },
  { value: "verifications", label: "Verifications" },
  { value: "notifications", label: "Notifications" },
  { value: "ads", label: "Ads" },
  { value: "payments", label: "Payments" },
];

const CATEGORY_ICONS: Record<string, any> = {
  auth: LogIn,
  jobs: Briefcase,
  applications: FileText,
  users: User,
  subscriptions: CreditCard,
  admin: Shield,
  settings: Settings,
  tickets: Ticket,
  verifications: Shield,
  notifications: Bell,
  ads: Megaphone,
  payments: CreditCard,
};

const CATEGORY_COLORS: Record<string, string> = {
  auth: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  jobs: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  applications: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  users: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  subscriptions: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  settings: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  tickets: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  verifications: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  notifications: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
  ads: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  payments: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const ACTION_LABELS: Record<string, string> = {
  login: "Login",
  register: "Registration",
  create_job: "Job Created",
  update_job: "Job Updated",
  delete_job: "Job Deleted",
  apply_job: "Applied",
  application_offered: "Offer Sent",
  application_accepted: "Accepted",
  application_rejected: "Rejected",
  application_pending: "Set Pending",
  update_user: "User Updated",
  delete_user: "User Deleted",
  update_settings: "Settings Updated",
  verification_approved: "Verified",
  verification_rejected: "Verification Rejected",
  clear_logs: "Logs Cleared",
};

const PAGE_SIZE = 30;

export default function AdminActivityLogs() {
  usePageTitle("Activity Logs");
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(0);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [detailLog, setDetailLog] = useState<ActivityLog | null>(null);

  const queryParams = new URLSearchParams();
  if (category !== "all") queryParams.set("category", category);
  queryParams.set("limit", String(PAGE_SIZE));
  queryParams.set("offset", String(page * PAGE_SIZE));

  const { data, isLoading } = useQuery<{ logs: ActivityLog[]; total: number }>({
    queryKey: ["/api/admin/activity-logs", category, page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/activity-logs?${queryParams.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/admin/activity-logs");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/activity-logs"] });
      toast({ title: "Activity logs cleared" });
      setShowClearDialog(false);
      setPage(0);
    },
    onError: () => {
      toast({ title: "Failed to clear logs", variant: "destructive" });
    },
  });

  if (user?.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const filteredLogs = search
    ? logs.filter(
        (l) =>
          l.description.toLowerCase().includes(search.toLowerCase()) ||
          (l.userEmail || "").toLowerCase().includes(search.toLowerCase()) ||
          l.action.toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  const getRoleBadge = (role: string | null) => {
    if (!role) return null;
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      employer: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      applicant: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      agent: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    };
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${colors[role] || "bg-gray-100 text-gray-700"}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="space-y-6 min-w-0">
      <PageHeader
        title="Activity Logs"
        description="Track all actions performed by users and administrators"
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by description, email, or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-logs"
          />
        </div>
        <div className="flex gap-2">
          <Select value={category} onValueChange={(v) => { setCategory(v); setPage(0); }}>
            <SelectTrigger className="w-[180px]" data-testid="select-log-category">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setShowClearDialog(true)}
            disabled={total === 0}
            data-testid="button-clear-logs"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Total Logs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {logs.filter((l) => l.category === "auth").length}
            </p>
            <p className="text-xs text-muted-foreground">Auth Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {logs.filter((l) => l.category === "jobs").length}
            </p>
            <p className="text-xs text-muted-foreground">Job Actions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {logs.filter((l) => l.userRole === "admin").length}
            </p>
            <p className="text-xs text-muted-foreground">Admin Actions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Recent Activity
            {total > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {total} total
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">No activity logs yet</p>
              <p className="text-sm">Actions will appear here as users interact with the platform</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => {
                const CategoryIcon = CATEGORY_ICONS[log.category] || Activity;
                const categoryColor = CATEGORY_COLORS[log.category] || "bg-gray-100 text-gray-800";
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setDetailLog(log)}
                    data-testid={`log-row-${log.id}`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${categoryColor}`}>
                      <CategoryIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate">{log.description}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {log.userEmail && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.userEmail}
                          </span>
                        )}
                        {getRoleBadge(log.userRole)}
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {ACTION_LABELS[log.action] || log.action}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0 text-right">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.createdAt ? format(new Date(log.createdAt), "MMM d, HH:mm") : "N/A"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  data-testid="button-next-page"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!detailLog} onOpenChange={() => setDetailLog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Log Details
            </DialogTitle>
            <DialogDescription>Details about this activity log entry</DialogDescription>
          </DialogHeader>
          {detailLog && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-muted-foreground">Action:</span>
                <span>{ACTION_LABELS[detailLog.action] || detailLog.action}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-muted-foreground">Category:</span>
                <Badge className={`w-fit ${CATEGORY_COLORS[detailLog.category] || ""}`}>
                  {detailLog.category}
                </Badge>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-muted-foreground">Description:</span>
                <span>{detailLog.description}</span>
              </div>
              {detailLog.userEmail && (
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <span className="font-medium text-muted-foreground">User:</span>
                  <span>{detailLog.userEmail} {detailLog.userRole && `(${detailLog.userRole})`}</span>
                </div>
              )}
              {detailLog.targetType && (
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <span className="font-medium text-muted-foreground">Target:</span>
                  <span>{detailLog.targetType} #{detailLog.targetId}</span>
                </div>
              )}
              {detailLog.ipAddress && (
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <span className="font-medium text-muted-foreground">IP Address:</span>
                  <span className="font-mono text-xs">{detailLog.ipAddress}</span>
                </div>
              )}
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-muted-foreground">Timestamp:</span>
                <span>{detailLog.createdAt ? format(new Date(detailLog.createdAt), "PPpp") : "N/A"}</span>
              </div>
              {detailLog.metadata && (
                <div>
                  <span className="font-medium text-muted-foreground block mb-1">Metadata:</span>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-48">
                    {JSON.stringify(JSON.parse(detailLog.metadata), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Activity Logs</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all activity logs? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => clearLogsMutation.mutate()}
              disabled={clearLogsMutation.isPending}
              data-testid="button-confirm-clear"
            >
              {clearLogsMutation.isPending ? "Clearing..." : "Clear All Logs"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
