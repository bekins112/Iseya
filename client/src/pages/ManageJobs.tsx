import { useState, useRef } from "react";
import { useEmployerJobs, useUpdateJob, useDeleteJob, useJobApplications } from "@/hooks/use-casual";

function formatDateDisplay(isoDate: string): string {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00");
  if (isNaN(d.getTime())) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${String(d.getDate()).padStart(2, "0")}, ${months[d.getMonth()]}, ${d.getFullYear()}`;
}
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/ui-extension";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { 
  PlusCircle, 
  Briefcase, 
  MapPin, 
  Users, 
  Trash2, 
  Eye, 
  EyeOff,
  MoreVertical,
  Clock,
  CreditCard,
  CalendarClock,
  Edit2,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow, isPast } from "date-fns";
import type { Job } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

function getJobStatusInfo(job: Job) {
  const status = job.status || "active";
  if (status === "filled") {
    return { label: "Filled", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: CheckCircle };
  }
  if (status === "expired") {
    return { label: "Expired", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: AlertTriangle };
  }
  if (!job.isActive) {
    return { label: "Inactive", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200", icon: EyeOff };
  }
  if (job.deadline && isPast(new Date(job.deadline))) {
    return { label: "Expired", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: AlertTriangle };
  }
  return { label: "Active", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: Eye };
}

function JobRow({ job, onToggleActive, onDelete, onEdit, onExtendDeadline, onReactivate, isFreeUser }: { 
  job: Job; 
  onToggleActive: (job: Job) => void;
  onDelete: (job: Job) => void;
  onEdit: (job: Job) => void;
  onExtendDeadline: (job: Job) => void;
  onReactivate: (job: Job) => void;
  isFreeUser: boolean;
}) {
  const { data: applications } = useJobApplications(job.id);
  const applicantCount = applications?.length || 0;
  const pendingCount = applications?.filter(a => a.status === 'pending').length || 0;
  const statusInfo = getJobStatusInfo(job);
  const StatusIcon = statusInfo.icon;
  const isFilled = job.status === "filled";
  const isExpired = job.status === "expired" || (job.deadline && isPast(new Date(job.deadline)));
  const isInactive = !job.isActive && !isFilled && !isExpired;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className={`hover:shadow-lg transition-all ${(isFilled || isExpired || isInactive) ? 'opacity-70' : ''}`}>
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="text-lg font-bold truncate">{job.title}</h3>
                <Badge className={`${statusInfo.color} text-xs gap-1`} data-testid={`badge-status-${job.id}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusInfo.label}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  {job.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {job.createdAt ? format(new Date(job.createdAt), 'MMM d, yyyy') : 'N/A'}
                </span>
                {job.deadline && (
                  <span className={`flex items-center gap-1 ${isPast(new Date(job.deadline)) ? 'text-red-500 font-medium' : 'text-amber-600'}`}>
                    <CalendarClock className="w-3.5 h-3.5" />
                    {isPast(new Date(job.deadline)) 
                      ? `Expired ${formatDistanceToNow(new Date(job.deadline), { addSuffix: true })}`
                      : `Closes ${format(new Date(job.deadline), 'dd, MMM, yyyy')}`
                    }
                  </span>
                )}
              </div>
              <p className="text-primary font-bold mt-1.5 text-sm">
                ₦{job.salaryMin?.toLocaleString()} - ₦{job.salaryMax?.toLocaleString()} {job.wage}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link href={`/jobs/${job.id}/applications`}>
                <div className="text-center cursor-pointer hover:text-primary transition-colors" data-testid={`applicant-count-${job.id}`}>
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
                {!isFreeUser && !isFilled && (
                  <Link href={`/jobs/${job.id}/applications`}>
                    <Button variant="outline" size="sm" className="gap-1" data-testid={`button-view-applicants-${job.id}`}>
                      <Users className="w-4 h-4" />
                      View
                    </Button>
                  </Link>
                )}

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
                    {!isFreeUser && !isFilled && (
                      <>
                        <DropdownMenuItem onClick={() => onEdit(job)} className="cursor-pointer" data-testid={`button-edit-job-${job.id}`}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Job
                        </DropdownMenuItem>
                        {(isExpired || isInactive) && (
                          <>
                            <DropdownMenuItem onClick={() => onExtendDeadline(job)} className="cursor-pointer" data-testid={`button-extend-deadline-${job.id}`}>
                              <CalendarClock className="w-4 h-4 mr-2" />
                              Extend Deadline
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onReactivate(job)} className="cursor-pointer" data-testid={`button-reactivate-${job.id}`}>
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Reactivate
                            </DropdownMenuItem>
                          </>
                        )}
                        {!isExpired && job.isActive && (
                          <DropdownMenuItem onClick={() => onToggleActive(job)} className="cursor-pointer">
                            <EyeOff className="w-4 h-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDelete(job)} 
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
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
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: jobs, isLoading } = useEmployerJobs();
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [extendingJob, setExtendingJob] = useState<Job | null>(null);
  const [newDeadline, setNewDeadline] = useState("");
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    jobType: "",
    salaryMin: 0,
    salaryMax: 0,
    wage: "",
    gender: "Any",
    deadline: "",
  });
  const isFreeUser = user?.subscriptionStatus === "free";

  const handleToggleActive = (job: Job) => {
    updateJob.mutate({ id: job.id, isActive: !job.isActive });
  };

  const handleReactivate = (job: Job) => {
    const hasExpiredDeadline = job.deadline && isPast(new Date(job.deadline));
    if (hasExpiredDeadline) {
      setExtendingJob(job);
      setNewDeadline("");
    } else {
      updateJob.mutate({ id: job.id, isActive: true, status: "active" } as any, {
        onSuccess: () => toast({ title: "Job reactivated successfully" }),
      });
    }
  };

  const handleExtendDeadline = () => {
    if (!extendingJob || !newDeadline) return;
    updateJob.mutate({ id: extendingJob.id, deadline: newDeadline, isActive: true, status: "active" } as any, {
      onSuccess: () => {
        toast({ title: "Deadline extended and job reactivated" });
        setExtendingJob(null);
        setNewDeadline("");
      },
    });
  };

  const openEditDialog = (job: Job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title,
      description: job.description,
      location: job.location,
      category: job.category,
      jobType: job.jobType,
      salaryMin: job.salaryMin || 0,
      salaryMax: job.salaryMax || 0,
      wage: job.wage,
      gender: job.gender || "Any",
      deadline: job.deadline ? new Date(job.deadline).toISOString().split("T")[0] : "",
    });
  };

  const handleSaveEdit = () => {
    if (!editingJob) return;
    const updates: any = {
      id: editingJob.id,
      title: editForm.title,
      description: editForm.description,
      location: editForm.location,
      category: editForm.category,
      jobType: editForm.jobType,
      salaryMin: editForm.salaryMin,
      salaryMax: editForm.salaryMax,
      wage: editForm.wage,
      gender: editForm.gender,
    };
    if (editForm.deadline) {
      updates.deadline = editForm.deadline;
    }
    updateJob.mutate(updates, {
      onSuccess: () => {
        toast({ title: "Job updated successfully" });
        setEditingJob(null);
      },
    });
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteJob.mutate(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const activeJobs = jobs?.filter(j => j.isActive && (j.status === "active" || !j.status)) || [];
  const filledJobs = jobs?.filter(j => j.status === "filled") || [];
  const expiredJobs = jobs?.filter(j => j.status === "expired" || (!j.isActive && j.status !== "filled")) || [];

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

      {isFreeUser && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700" data-testid="banner-subscription-required">
          <CardContent className="p-4 flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm text-amber-800 dark:text-amber-300">Subscription Required</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Upgrade your subscription to manage your jobs and view applicants.
              </p>
              <Link href="/subscription">
                <Button size="sm" className="mt-2 gap-1" data-testid="button-upgrade-subscription">
                  <CreditCard className="w-3.5 h-3.5" />
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Total</p>
            <p className="text-2xl font-bold">{jobs?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Active</p>
            <p className="text-2xl font-bold text-green-600">{activeJobs.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Filled</p>
            <p className="text-2xl font-bold text-blue-600">{filledJobs.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Expired</p>
            <p className="text-2xl font-bold text-red-600">{expiredJobs.length}</p>
          </CardContent>
        </Card>
      </div>

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
          <div className="space-y-3">
            {jobs?.map((job) => (
              <JobRow 
                key={job.id} 
                job={job} 
                onToggleActive={handleToggleActive}
                onDelete={setDeleteTarget}
                onEdit={openEditDialog}
                onExtendDeadline={(j) => { setExtendingJob(j); setNewDeadline(""); }}
                onReactivate={handleReactivate}
                isFreeUser={isFreeUser}
              />
            ))}
          </div>
        )}
      </div>

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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="button-confirm-delete">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!extendingJob} onOpenChange={() => setExtendingJob(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Extend Deadline</DialogTitle>
            <DialogDescription>
              Set a new deadline for "{extendingJob?.title}". The job will be reactivated.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>New Deadline</Label>
            <Input
              type="date"
              min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              data-testid="input-new-deadline"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendingJob(null)}>Cancel</Button>
            <Button onClick={handleExtendDeadline} disabled={!newDeadline || updateJob.isPending} data-testid="button-confirm-extend">
              {updateJob.isPending ? "Extending..." : "Extend & Reactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingJob} onOpenChange={() => setEditingJob(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>Update your job posting details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto flex-1">
            <div>
              <Label>Job Title</Label>
              <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} data-testid="input-edit-title" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v })}>
                  <SelectTrigger data-testid="select-edit-category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Waiter / Waitress","Barman / Bartender","Housekeeper / Room Attendant","Kitchen Assistant / Steward","Cook","Cleaner / Janitor","Driver (Casual)","Nanny / Caregiver","Security Guard","Factory Worker / Casual Labourer","Receptionist","Sales Assistant / Attendant","Cashier","Office Assistant","Other"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Job Type</Label>
                <Select value={editForm.jobType} onValueChange={(v) => setEditForm({ ...editForm, jobType: v })}>
                  <SelectTrigger data-testid="select-edit-jobtype"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} data-testid="input-edit-location" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Min Salary (₦)</Label>
                <Input type="number" value={editForm.salaryMin} onChange={(e) => setEditForm({ ...editForm, salaryMin: Number(e.target.value) })} data-testid="input-edit-salary-min" />
              </div>
              <div>
                <Label>Max Salary (₦)</Label>
                <Input type="number" value={editForm.salaryMax} onChange={(e) => setEditForm({ ...editForm, salaryMax: Number(e.target.value) })} data-testid="input-edit-salary-max" />
              </div>
              <div>
                <Label>Wage Type</Label>
                <Select value={editForm.wage} onValueChange={(v) => setEditForm({ ...editForm, wage: v })}>
                  <SelectTrigger data-testid="select-edit-wage"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="/hr">Per Hour</SelectItem>
                    <SelectItem value="/day">Per Day</SelectItem>
                    <SelectItem value="/wk">Per Week</SelectItem>
                    <SelectItem value="/mo">Per Month</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Gender Preference</Label>
                <Select value={editForm.gender} onValueChange={(v) => setEditForm({ ...editForm, gender: v })}>
                  <SelectTrigger data-testid="select-edit-gender"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any">Any</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5" /> Deadline</Label>
                <div className="relative">
                  <Input
                    readOnly
                    value={editForm.deadline ? formatDateDisplay(editForm.deadline) : ""}
                    placeholder="Select deadline date"
                    className="cursor-pointer"
                    onClick={() => {
                      const el = document.getElementById("edit-deadline-picker") as HTMLInputElement;
                      el?.showPicker?.();
                    }}
                    data-testid="input-edit-deadline"
                  />
                  <input
                    id="edit-deadline-picker"
                    type="date"
                    min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                    value={editForm.deadline || ""}
                    onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    tabIndex={-1}
                  />
                </div>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                className="min-h-[100px]"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                data-testid="input-edit-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingJob(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={updateJob.isPending} data-testid="button-save-edit">
              {updateJob.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
