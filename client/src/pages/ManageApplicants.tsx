import { useState } from "react";
import { useParams, Link } from "wouter";
import { useJob, useJobApplications, useUpdateApplicationStatus, useApplicantProfile } from "@/hooks/use-casual";
import { PageHeader } from "@/components/ui-extension";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Clock, 
  User,
  Mail,
  Calendar,
  MessageSquare,
  MoreVertical,
  FileText,
  Download,
  Briefcase,
  Building2,
  Banknote,
  UserCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import type { Application } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EnrichedApplication = Application & {
  applicantName?: string;
  applicantEmail?: string | null;
  applicantProfileImageUrl?: string | null;
  applicantCvUrl?: string | null;
  applicantGender?: string | null;
  applicantAge?: number | null;
};

type StatusFilter = 'all' | 'pending' | 'offered' | 'accepted' | 'rejected';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
  offered: { label: 'Offered', color: 'bg-blue-500', icon: Send },
  accepted: { label: 'Accepted', color: 'bg-green-500', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-500', icon: XCircle },
};

function ApplicantProfileDialog({ applicantId, open, onOpenChange }: { applicantId: string | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: profile, isLoading } = useApplicantProfile(open ? applicantId : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Applicant Profile</DialogTitle>
          <DialogDescription>Full profile overview</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-muted rounded w-1/2 animate-pulse" />
                <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
              </div>
            </div>
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
          </div>
        ) : profile ? (
          <div className="space-y-6 py-2">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profile.profileImageUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                  {(profile.firstName?.[0] || '')}{(profile.lastName?.[0] || '')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg" data-testid="text-profile-name">
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1" data-testid="text-profile-email">
                  <Mail className="w-3 h-3" />
                  {profile.email}
                </p>
                {profile.isVerified && (
                  <Badge variant="outline" className="mt-1 text-green-600 border-green-500">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {profile.gender && (
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Gender</p>
                  <p className="text-sm font-medium" data-testid="text-profile-gender">{profile.gender}</p>
                </div>
              )}
              {profile.age && (
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Age</p>
                  <p className="text-sm font-medium" data-testid="text-profile-age">{profile.age} years</p>
                </div>
              )}
              {profile.location && (
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Location</p>
                  <p className="text-sm font-medium">{profile.location}</p>
                </div>
              )}
              {(profile.expectedSalaryMin || profile.expectedSalaryMax) && (
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Expected Salary</p>
                  <p className="text-sm font-medium" data-testid="text-profile-salary">
                    {profile.expectedSalaryMin ? `₦${Number(profile.expectedSalaryMin).toLocaleString()}` : '—'} - {profile.expectedSalaryMax ? `₦${Number(profile.expectedSalaryMax).toLocaleString()}` : '—'}
                  </p>
                </div>
              )}
            </div>

            {profile.bio && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <UserCircle className="w-4 h-4" />
                  About
                </h4>
                <p className="text-sm bg-muted/40 p-3 rounded-lg" data-testid="text-profile-bio">{profile.bio}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-1">
                <FileText className="w-4 h-4" />
                CV / Resume
              </h4>
              {profile.cvUrl ? (
                <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" download>
                  <Button variant="outline" className="w-full gap-2" data-testid="button-download-cv">
                    <Download className="w-4 h-4" />
                    Download CV
                  </Button>
                </a>
              ) : (
                <p className="text-sm text-muted-foreground bg-muted/40 p-3 rounded-lg text-center" data-testid="text-no-cv">
                  No CV uploaded
                </p>
              )}
            </div>

            {profile.jobHistory && profile.jobHistory.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  Work Experience ({profile.jobHistory.length})
                </h4>
                <div className="space-y-2">
                  {profile.jobHistory.map((entry: any) => (
                    <div key={entry.id} className="bg-muted/40 p-3 rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm" data-testid={`text-history-title-${entry.id}`}>{entry.jobTitle}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {entry.company}
                            {entry.startDate && (
                              <span className="ml-1">
                                ({entry.startDate} - {entry.isCurrent ? "Present" : (entry.endDate || "N/A")})
                              </span>
                            )}
                          </p>
                          {entry.isCurrent && (
                            <span className="text-xs text-primary font-medium mt-0.5 inline-block">Currently working here</span>
                          )}
                        </div>
                      </div>
                      {entry.description && (
                        <p className="text-xs text-muted-foreground mt-1">{entry.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile.createdAt && (
              <p className="text-xs text-muted-foreground text-center pt-2 border-t">
                Member since {format(new Date(profile.createdAt), 'MMMM yyyy')}
              </p>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Could not load profile</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ApplicantCard({ 
  application, 
  onUpdateStatus,
  onViewProfile,
}: { 
  application: EnrichedApplication;
  onUpdateStatus: (id: number, status: 'pending' | 'accepted' | 'rejected' | 'offered') => void;
  onViewProfile: (applicantId: string) => void;
}) {
  const status = application.status || 'pending';
  const StatusIcon = statusConfig[status]?.icon || Clock;
  const name = application.applicantName || `Applicant #${application.id}`;
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
    >
      <Card className="hover:shadow-lg transition-all">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14">
                <AvatarImage src={application.applicantProfileImageUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold" data-testid={`text-applicant-name-${application.id}`}>{name}</h3>
                  <Badge 
                    variant="secondary" 
                    className={`${statusConfig[status]?.color} text-white`}
                  >
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig[status]?.label}
                  </Badge>
                  {application.applicantCvUrl && (
                    <Badge variant="outline" className="text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      CV
                    </Badge>
                  )}
                </div>
                {application.applicantEmail && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" />
                    {application.applicantEmail}
                  </p>
                )}
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="w-4 h-4" />
                  Applied {application.createdAt ? format(new Date(application.createdAt), 'MMM d, yyyy') : 'N/A'}
                </p>
                {application.message && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-start gap-1">
                    <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{application.message}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => onViewProfile(application.applicantId)}
                data-testid={`button-view-profile-${application.id}`}
              >
                <User className="w-4 h-4" />
                View Profile
              </Button>

              {application.applicantCvUrl && (
                <a href={application.applicantCvUrl} target="_blank" rel="noopener noreferrer" download>
                  <Button variant="outline" size="sm" className="gap-1" data-testid={`button-download-cv-${application.id}`}>
                    <Download className="w-4 h-4" />
                    CV
                  </Button>
                </a>
              )}

              {status === 'pending' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => onUpdateStatus(application.id, 'offered')}
                    data-testid={`button-offer-${application.id}`}
                  >
                    <Send className="w-4 h-4" />
                    Send Offer
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => onUpdateStatus(application.id, 'rejected')}
                    data-testid={`button-reject-${application.id}`}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                </>
              )}
              
              {status === 'offered' && (
                <Badge variant="outline" className="text-blue-600 border-blue-500">
                  Waiting for response
                </Badge>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid={`button-applicant-menu-${application.id}`}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewProfile(application.applicantId)}>
                    <User className="w-4 h-4 mr-2" />
                    View Full Profile
                  </DropdownMenuItem>
                  {application.applicantCvUrl && (
                    <DropdownMenuItem asChild>
                      <a href={application.applicantCvUrl} target="_blank" rel="noopener noreferrer" download>
                        <Download className="w-4 h-4 mr-2" />
                        Download CV
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {status !== 'offered' && (
                    <DropdownMenuItem onClick={() => onUpdateStatus(application.id, 'offered')}>
                      <Send className="w-4 h-4 mr-2" />
                      Send Offer
                    </DropdownMenuItem>
                  )}
                  {status !== 'accepted' && (
                    <DropdownMenuItem onClick={() => onUpdateStatus(application.id, 'accepted')}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark Accepted
                    </DropdownMenuItem>
                  )}
                  {status !== 'rejected' && (
                    <DropdownMenuItem 
                      onClick={() => onUpdateStatus(application.id, 'rejected')}
                      className="text-destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </DropdownMenuItem>
                  )}
                  {status !== 'pending' && (
                    <DropdownMenuItem onClick={() => onUpdateStatus(application.id, 'pending')}>
                      <Clock className="w-4 h-4 mr-2" />
                      Reset to Pending
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ManageApplicants() {
  const params = useParams();
  const jobId = Number(params.id);
  const { data: job, isLoading: jobLoading } = useJob(jobId);
  const { data: applications, isLoading: appsLoading } = useJobApplications(jobId);
  const updateStatus = useUpdateApplicationStatus();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [profileApplicantId, setProfileApplicantId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleUpdateStatus = (id: number, status: 'pending' | 'accepted' | 'rejected' | 'offered') => {
    updateStatus.mutate({ id, status });
  };

  const handleViewProfile = (applicantId: string) => {
    setProfileApplicantId(applicantId);
    setProfileOpen(true);
  };

  const filteredApps = (applications as EnrichedApplication[] | undefined)?.filter(app => 
    filter === 'all' || app.status === filter
  ) || [];

  const counts = {
    all: applications?.length || 0,
    pending: applications?.filter(a => a.status === 'pending').length || 0,
    offered: applications?.filter(a => a.status === 'offered').length || 0,
    accepted: applications?.filter(a => a.status === 'accepted').length || 0,
    rejected: applications?.filter(a => a.status === 'rejected').length || 0,
  };

  if (jobLoading || appsLoading) {
    return (
      <div className="space-y-8">
        <div className="h-20 bg-muted/40 rounded-xl animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted/40 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Job not found</h2>
        <Link href="/manage-jobs">
          <Button variant="outline" data-testid="button-back-to-jobs-notfound">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/manage-jobs">
          <Button variant="ghost" size="icon" data-testid="button-back-to-jobs">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <PageHeader 
          title={`Applicants for "${job.title}"`}
          description={`${counts.all} total applications`}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'offered', 'accepted', 'rejected'] as StatusFilter[]).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
            className="gap-1"
            data-testid={`filter-${status}`}
          >
            {status === 'all' ? 'All' : statusConfig[status]?.label}
            <Badge variant="secondary" className="ml-1 text-xs">
              {counts[status]}
            </Badge>
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredApps.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="py-16 text-center">
                <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-bold mb-2">
                  {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
                </h3>
                <p className="text-muted-foreground">
                  {filter === 'all' 
                    ? 'Applications will appear here when candidates apply' 
                    : 'Try changing the filter to see other applications'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredApps.map((app) => (
              <ApplicantCard 
                key={app.id} 
                application={app} 
                onUpdateStatus={handleUpdateStatus}
                onViewProfile={handleViewProfile}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      <ApplicantProfileDialog
        applicantId={profileApplicantId}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />
    </div>
  );
}
