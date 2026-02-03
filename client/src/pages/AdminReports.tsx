import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-extension";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Flag, AlertTriangle, CheckCircle2, XCircle, MoreVertical, User, Briefcase } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Report } from "@shared/schema";
import { format } from "date-fns";

export default function AdminReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [editForm, setEditForm] = useState({ 
    status: "pending" as string, 
    adminNotes: "" 
  });

  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ["/api/admin/reports", { 
      status: statusFilter !== "all" ? statusFilter : undefined,
      type: typeFilter !== "all" ? typeFilter : undefined 
    }],
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Report> }) => {
      return apiRequest("PATCH", `/api/admin/reports/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
      toast({ title: "Report updated successfully" });
      setSelectedReport(null);
    },
    onError: () => {
      toast({ title: "Failed to update report", variant: "destructive" });
    },
  });

  if (user?.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  const filteredReports = reports.filter((r) => {
    const matchesSearch = !search || 
      r.reason?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const pendingCount = reports.filter(r => r.status === "pending").length;
  const reviewedCount = reports.filter(r => r.status === "reviewed").length;
  const actionTakenCount = reports.filter(r => r.status === "action_taken").length;
  const userReportsCount = reports.filter(r => r.reportedType === "user").length;
  const jobReportsCount = reports.filter(r => r.reportedType === "job").length;

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "pending": return <AlertTriangle className="w-4 h-4" />;
      case "reviewed": return <CheckCircle2 className="w-4 h-4" />;
      case "action_taken": return <CheckCircle2 className="w-4 h-4" />;
      case "dismissed": return <XCircle className="w-4 h-4" />;
      default: return <Flag className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "reviewed": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "action_taken": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "dismissed": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string | null) => {
    switch (type) {
      case "user": return <User className="w-4 h-4" />;
      case "job": return <Briefcase className="w-4 h-4" />;
      default: return <Flag className="w-4 h-4" />;
    }
  };

  const openReportDialog = (report: Report) => {
    setSelectedReport(report);
    setEditForm({ 
      status: report.status || "pending",
      adminNotes: report.adminNotes || ""
    });
  };

  const handleSaveReport = () => {
    if (!selectedReport) return;
    updateReportMutation.mutate({
      id: selectedReport.id,
      updates: editForm,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Review user and job reports"
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Reviewed</span>
            </div>
            <p className="text-2xl font-bold">{reviewedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Action Taken</span>
            </div>
            <p className="text-2xl font-bold">{actionTakenCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">User Reports</span>
            </div>
            <p className="text-2xl font-bold">{userReportsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-muted-foreground">Job Reports</span>
            </div>
            <p className="text-2xl font-bold">{jobReportsCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search-reports"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]" data-testid="select-report-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="action_taken">Action Taken</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]" data-testid="select-report-type">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user">User Reports</SelectItem>
                <SelectItem value="job">Job Reports</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Flag className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No reports found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => openReportDialog(report)}
                  data-testid={`report-row-${report.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getStatusColor(report.status)} variant="secondary">
                        {getStatusIcon(report.status)}
                        <span className="ml-1 capitalize">{report.status?.replace("_", " ")}</span>
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        {getTypeIcon(report.reportedType)}
                        <span className="capitalize">{report.reportedType}</span>
                      </Badge>
                    </div>
                    <p className="font-medium">{report.reason}</p>
                    {report.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{report.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>ID: {report.reportedUserId || report.reportedJobId}</span>
                      {report.createdAt && (
                        <span>Reported: {format(new Date(report.createdAt), "MMM d, yyyy")}</span>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" data-testid={`button-report-menu-${report.id}`}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openReportDialog(report); }}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          updateReportMutation.mutate({ id: report.id, updates: { status: "reviewed" } });
                        }}
                      >
                        Mark Reviewed
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          updateReportMutation.mutate({ id: report.id, updates: { status: "action_taken" } });
                        }}
                      >
                        Mark Action Taken
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          updateReportMutation.mutate({ id: report.id, updates: { status: "dismissed" } });
                        }}
                      >
                        Dismiss
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Badge className={getStatusColor(selectedReport.status)}>
                  {getStatusIcon(selectedReport.status)}
                  <span className="ml-1 capitalize">{selectedReport.status?.replace("_", " ")}</span>
                </Badge>
                <Badge variant="outline" className="gap-1">
                  {getTypeIcon(selectedReport.reportedType)}
                  <span className="capitalize">{selectedReport.reportedType} Report</span>
                </Badge>
              </div>
              <div>
                <Label className="text-muted-foreground">Reason</Label>
                <p className="font-medium">{selectedReport.reason}</p>
              </div>
              {selectedReport.description && (
                <div>
                  <Label className="text-muted-foreground">Details</Label>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-lg mt-1">
                    {selectedReport.description}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Reported {selectedReport.reportedType === "user" ? "User" : "Job"} ID</Label>
                  <p className="font-mono">{selectedReport.reportedUserId || selectedReport.reportedJobId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Reporter ID</Label>
                  <p className="font-mono">{selectedReport.reporterId}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                  <SelectTrigger data-testid="select-edit-report-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="action_taken">Action Taken</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  value={editForm.adminNotes}
                  onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                  placeholder="Add internal notes about this report..."
                  rows={3}
                  data-testid="textarea-report-admin-notes"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveReport} 
              disabled={updateReportMutation.isPending}
              data-testid="button-save-report"
            >
              {updateReportMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
