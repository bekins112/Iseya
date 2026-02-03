import { useState } from "react";
import { useEmployerJobs, useUpdateJob, useDeleteJob, useJobApplications } from "@/hooks/use-casual";
import { PageHeader, StatusBadge } from "@/components/ui-extension";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  PlusCircle, 
  Briefcase, 
  MapPin, 
  Users, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  MoreVertical,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import type { Job } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function JobRow({ job, onToggleActive, onDelete }: { 
  job: Job; 
  onToggleActive: (job: Job) => void;
  onDelete: (job: Job) => void;
}) {
  const { data: applications } = useJobApplications(job.id);
  const applicantCount = applications?.length || 0;
  const pendingCount = applications?.filter(a => a.status === 'pending').length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className={`hover:shadow-lg transition-all ${!job.isActive ? 'opacity-60' : ''}`}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold truncate">{job.title}</h3>
                <Badge variant={job.isActive ? "default" : "secondary"}>
                  {job.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {job.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {job.createdAt ? format(new Date(job.createdAt), 'MMM d, yyyy') : 'N/A'}
                </span>
              </div>
              <p className="text-primary font-bold mt-2">{job.wage}</p>
            </div>

            <div className="flex items-center gap-6">
              <Link href={`/jobs/${job.id}/applications`}>
                <div className="text-center cursor-pointer hover:text-primary transition-colors">
                  <div className="flex items-center gap-1">
                    <Users className="w-5 h-5" />
                    <span className="text-2xl font-bold">{applicantCount}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {pendingCount > 0 && <span className="text-orange-500">{pendingCount} pending</span>}
                    {pendingCount === 0 && "Applicants"}
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <Link href={`/jobs/${job.id}/applications`}>
                  <Button variant="outline" size="sm" className="gap-1" data-testid={`button-view-applicants-${job.id}`}>
                    <Users className="w-4 h-4" />
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
                    <Link href={`/jobs/${job.id}`}>
                      <DropdownMenuItem className="cursor-pointer">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={() => onToggleActive(job)} className="cursor-pointer">
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
                      onClick={() => onDelete(job)} 
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ManageJobs() {
  const { data: jobs, isLoading } = useEmployerJobs();
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);

  const handleToggleActive = (job: Job) => {
    updateJob.mutate({ id: job.id, isActive: !job.isActive });
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteJob.mutate(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const activeJobs = jobs?.filter(j => j.isActive) || [];
  const inactiveJobs = jobs?.filter(j => !j.isActive) || [];

  return (
    <div className="space-y-8 pb-10">
      <PageHeader 
        title="Manage Jobs" 
        description="View and manage all your job postings"
        actions={
          <Link href="/post-job">
            <Button className="gap-2" data-testid="button-post-new-job">
              <PlusCircle className="w-4 h-4" /> Post New Job
            </Button>
          </Link>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Jobs</p>
                <p className="text-3xl font-bold">{jobs?.length || 0}</p>
              </div>
              <Briefcase className="w-10 h-10 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Active</p>
                <p className="text-3xl font-bold text-green-600">{activeJobs.length}</p>
              </div>
              <Eye className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/50 border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Inactive</p>
                <p className="text-3xl font-bold text-muted-foreground">{inactiveJobs.length}</p>
              </div>
              <EyeOff className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Your Job Postings</h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : jobs?.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-16 text-center">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-bold mb-2">No jobs yet</h3>
              <p className="text-muted-foreground mb-4">Create your first job posting to start receiving applications</p>
              <Link href="/post-job">
                <Button className="gap-2">
                  <PlusCircle className="w-4 h-4" /> Post Your First Job
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs?.map((job, idx) => (
              <JobRow 
                key={job.id} 
                job={job} 
                onToggleActive={handleToggleActive}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Posting?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This action cannot be undone and all applications for this job will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
