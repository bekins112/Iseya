import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, StatusBadge } from "@/components/ui-extension";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Search, Briefcase, MapPin, MoreVertical, Trash2, Eye, EyeOff, Building2, Users, Clock, Send, CheckCircle, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Job } from "@shared/schema";

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

export default function AdminJobs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [deletingJob, setDeletingJob] = useState<Job | null>(null);

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

  const formatSalary = (min: number, max: number) => {
    if (min === max) return `₦${min.toLocaleString()}`;
    return `₦${min.toLocaleString()} - ₦${max.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Jobs"
        description="Oversee all job postings on the platform"
      />

      <Card>
        <CardHeader className="pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title, location, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-jobs"
            />
          </div>
        </CardHeader>
        <CardContent>
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
              {filteredJobs.map((job) => {
                const counts = job.applicationCounts || { total: 0, pending: 0, offered: 0, accepted: 0, rejected: 0 };
                return (
                <div
                  key={job.id}
                  className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  data-testid={`job-row-${job.id}`}
                >
                  <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{job.title}</h3>
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
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {[job.state, job.city].filter(Boolean).join(", ") || job.location}
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
                  <div className="flex items-center gap-2">
                    <Link href={`/jobs/${job.id}/applications`}>
                      <Button variant="outline" size="sm" className="gap-1" data-testid={`button-manage-applicants-${job.id}`}>
                        <Users className="w-3.5 h-3.5" />
                        {counts.total > 0 ? `${counts.total} Applicants` : "Applicants"}
                      </Button>
                    </Link>
                    <Link href={`/jobs/${job.id}`}>
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
            </div>
          )}
        </CardContent>
      </Card>

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
