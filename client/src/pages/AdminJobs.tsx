import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, StatusBadge } from "@/components/ui-extension";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Briefcase, MapPin, MoreVertical, Trash2, Eye, EyeOff, Building2, Users, Clock, Send, CheckCircle, XCircle, Pencil } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Job } from "@shared/schema";
import { jobUrl } from "@/lib/slug-utils";
import { jobSectors } from "@/lib/job-categories";
import { nigerianStates } from "@/lib/nigerian-locations";
import { AdminPagination, usePagination } from "@/components/AdminPagination";

type AdminJob = Job & {
  applicationCounts?: {
    total: number;
    pending: number;
    offered: number;
    accepted: number;
    rejected: number;
  };
};
import { format } from "date-fns";
import { usePageTitle } from "@/hooks/use-page-title";

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Remote", "Freelance"];
const GENDER_OPTIONS = ["Any", "Male", "Female"];
const WAGE_OPTIONS = ["Hourly", "Daily", "Weekly", "Monthly", "Yearly", "Fixed", "Negotiable"];

const allCategories = jobSectors.flatMap(s => s.subcategories).sort();

function EditJobDialog({ job, open, onOpenChange }: { job: AdminJob | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, any>>({});

  const resetForm = (j: AdminJob) => {
    setForm({
      title: j.title || "",
      description: j.description || "",
      category: j.category || "",
      jobType: j.jobType || "Full-time",
      location: j.location || "",
      state: j.state || "",
      city: j.city || "",
      wage: j.wage || "Monthly",
      salaryMin: j.salaryMin ?? 0,
      salaryMax: j.salaryMax ?? 0,
      gender: j.gender || "Any",
      ageMin: j.ageMin ?? "",
      ageMax: j.ageMax ?? "",
      status: j.status || "active",
      isActive: j.isActive ?? true,
      deadline: j.deadline ? format(new Date(j.deadline), "yyyy-MM-dd") : "",
    });
  };

  const updateJobMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      return apiRequest("PATCH", `/api/admin/jobs/${job!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      toast({ title: "Job updated successfully" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Failed to update job", variant: "destructive" });
    },
  });

  const handleSave = () => {
    const payload: Record<string, any> = {
      title: form.title,
      description: form.description,
      category: form.category,
      jobType: form.jobType,
      location: form.location,
      state: form.state || null,
      city: form.city || null,
      wage: form.wage,
      salaryMin: Number(form.salaryMin) || 0,
      salaryMax: Number(form.salaryMax) || 0,
      gender: form.gender || null,
      ageMin: form.ageMin ? Number(form.ageMin) : null,
      ageMax: form.ageMax ? Number(form.ageMax) : null,
      status: form.status,
      isActive: form.isActive,
      deadline: form.deadline || null,
    };
    updateJobMutation.mutate(payload);
  };

  if (!job) return null;

  if (open && Object.keys(form).length === 0) {
    resetForm(job);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setForm({}); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
          <DialogDescription>Update the details of this job posting.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={form.title || ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              data-testid="input-edit-job-title"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={5}
              data-testid="input-edit-job-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={form.category || ""} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger data-testid="select-edit-job-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {allCategories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Job Type</Label>
              <Select value={form.jobType || "Full-time"} onValueChange={(v) => setForm({ ...form, jobType: v })}>
                <SelectTrigger data-testid="select-edit-job-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>State</Label>
              <Select value={form.state || ""} onValueChange={(v) => setForm({ ...form, state: v })}>
                <SelectTrigger data-testid="select-edit-job-state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {nigerianStates.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>City / Town</Label>
              <Input
                value={form.city || ""}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Ikeja"
                data-testid="input-edit-job-city"
              />
            </div>
          </div>

          <div>
            <Label>Address / Area</Label>
            <Input
              value={form.location || ""}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. 15 Admiralty Way, Lekki"
              data-testid="input-edit-job-location"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Wage Type</Label>
              <Select value={form.wage || "Monthly"} onValueChange={(v) => setForm({ ...form, wage: v })}>
                <SelectTrigger data-testid="select-edit-job-wage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WAGE_OPTIONS.map(w => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Min Salary (₦)</Label>
              <Input
                type="number"
                value={form.salaryMin ?? 0}
                onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
                data-testid="input-edit-job-salary-min"
              />
            </div>
            <div>
              <Label>Max Salary (₦)</Label>
              <Input
                type="number"
                value={form.salaryMax ?? 0}
                onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
                data-testid="input-edit-job-salary-max"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Gender Preference</Label>
              <Select value={form.gender || "Any"} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger data-testid="select-edit-job-gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Min Age</Label>
              <Input
                type="number"
                value={form.ageMin ?? ""}
                onChange={(e) => setForm({ ...form, ageMin: e.target.value })}
                placeholder="e.g. 18"
                data-testid="input-edit-job-age-min"
              />
            </div>
            <div>
              <Label>Max Age</Label>
              <Input
                type="number"
                value={form.ageMax ?? ""}
                onChange={(e) => setForm({ ...form, ageMax: e.target.value })}
                placeholder="e.g. 45"
                data-testid="input-edit-job-age-max"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={form.status || "active"} onValueChange={(v) => setForm({ ...form, status: v, isActive: v === "active" })}>
                <SelectTrigger data-testid="select-edit-job-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="filled">Filled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Deadline</Label>
              <Input
                type="date"
                value={form.deadline || ""}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                data-testid="input-edit-job-deadline"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => { setForm({}); onOpenChange(false); }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateJobMutation.isPending || !form.title?.trim()}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
            data-testid="button-save-edit-job"
          >
            {updateJobMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminJobs() {
  usePageTitle("Admin Jobs");
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [deletingJob, setDeletingJob] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<AdminJob | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const { data: jobs = [], isLoading } = useQuery<AdminJob[]>({
    queryKey: ["/api/admin/jobs"],
  });

  const toggleJobMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/admin/jobs/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      toast({ title: "Job status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update job", variant: "destructive" });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/jobs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      toast({ title: "Job deleted successfully" });
      setDeletingJob(null);
    },
    onError: () => {
      toast({ title: "Failed to delete job", variant: "destructive" });
    },
  });

  if (user?.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = !search || 
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase()) ||
      job.category.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const paginatedJobs = usePagination(filteredJobs, pageSize, page);

  const formatSalary = (min: number, max: number) => {
    if (min === max) return `₦${min.toLocaleString()}`;
    return `₦${min.toLocaleString()} - ₦${max.toLocaleString()}`;
  };

  return (
    <div className="space-y-6 min-w-0">
      <PageHeader
        title="Manage Jobs"
        description="Oversee all job postings on the platform"
      />

      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title, location, or category..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-9"
              data-testid="input-search-jobs"
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No jobs found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedJobs.map((job) => {
                const counts = job.applicationCounts || { total: 0, pending: 0, offered: 0, accepted: 0, rejected: 0 };
                return (
                <div
                  key={job.id}
                  className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  data-testid={`job-row-${job.id}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-medium truncate">{job.title}</h3>
                      <Badge variant={job.isActive ? "default" : "secondary"}>
                        {job.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {job.agentId && (
                        <Badge variant="outline" className="text-teal-700 border-teal-300 bg-teal-50 text-xs" data-testid={`badge-agent-job-${job.id}`}>
                          Via Agent
                        </Badge>
                      )}
                    </div>
                    {job.onBehalfOf && (
                      <p className="text-xs text-muted-foreground mb-1">On behalf of: {job.onBehalfOf}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{[job.state, job.city].filter(Boolean).join(", ") || job.location}</span>
                      </span>
                      <span>{job.category}</span>
                      <span>{job.jobType}</span>
                      <span className="text-primary font-medium">
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Posted: {job.createdAt ? format(new Date(job.createdAt), "MMM d, yyyy") : "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <Link href={`/jobs/${job.id}/applications`}>
                      <Button variant="outline" size="sm" className="gap-1" data-testid={`button-manage-applicants-${job.id}`}>
                        <Users className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">{counts.total > 0 ? `${counts.total} ` : ""}Applicants</span>
                        <span className="xs:hidden">{counts.total || 0}</span>
                      </Button>
                    </Link>
                    <Link href={jobUrl(job)}>
                      <Button variant="outline" size="sm" data-testid={`button-view-job-${job.id}`}>
                        View
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-job-menu-${job.id}`}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingJob(job)}
                          data-testid={`button-edit-job-${job.id}`}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit Job
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleJobMutation.mutate({ id: job.id, isActive: !job.isActive })}
                        >
                          {job.isActive ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeletingJob(job)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  </div>

                  {counts.total > 0 && (
                    <div className="mt-3 pt-3 border-t" data-testid={`pipeline-${job.id}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Application Pipeline</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/jobs/${job.id}/applications`}>
                          <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950/20 border-orange-300 text-orange-700 dark:text-orange-400" data-testid={`badge-pending-${job.id}`}>
                            <Clock className="w-3 h-3" />
                            {counts.pending} Pending
                          </Badge>
                        </Link>
                        <Link href={`/jobs/${job.id}/applications`}>
                          <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20 border-blue-300 text-blue-700 dark:text-blue-400" data-testid={`badge-offered-${job.id}`}>
                            <Send className="w-3 h-3" />
                            {counts.offered} Offered
                          </Badge>
                        </Link>
                        <Link href={`/jobs/${job.id}/applications`}>
                          <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-green-50 dark:hover:bg-green-950/20 border-green-300 text-green-700 dark:text-green-400" data-testid={`badge-accepted-${job.id}`}>
                            <CheckCircle className="w-3 h-3" />
                            {counts.accepted} Accepted
                          </Badge>
                        </Link>
                        <Link href={`/jobs/${job.id}/applications`}>
                          <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20 border-red-300 text-red-700 dark:text-red-400" data-testid={`badge-rejected-${job.id}`}>
                            <XCircle className="w-3 h-3" />
                            {counts.rejected} Rejected
                          </Badge>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
              <AdminPagination
                totalItems={filteredJobs.length}
                currentPage={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <EditJobDialog
        job={editingJob}
        open={!!editingJob}
        onOpenChange={(v) => { if (!v) setEditingJob(null); }}
      />

      <Dialog open={!!deletingJob} onOpenChange={() => setDeletingJob(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingJob?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingJob(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => deletingJob && deleteJobMutation.mutate(deletingJob.id)}
              disabled={deleteJobMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteJobMutation.isPending ? "Deleting..." : "Delete Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
