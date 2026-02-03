import { useState } from "react";
import { useParams, Link } from "wouter";
import { useJob, useJobApplications, useUpdateApplicationStatus } from "@/hooks/use-casual";
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
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  MoreVertical
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

type StatusFilter = 'all' | 'pending' | 'offered' | 'accepted' | 'rejected';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
  offered: { label: 'Offered', color: 'bg-blue-500', icon: Send },
  accepted: { label: 'Accepted', color: 'bg-green-500', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-500', icon: XCircle },
};

function ApplicantCard({ 
  application, 
  onUpdateStatus 
}: { 
  application: Application;
  onUpdateStatus: (id: number, status: 'pending' | 'accepted' | 'rejected' | 'offered') => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const status = application.status || 'pending';
  const StatusIcon = statusConfig[status]?.icon || Clock;

  return (
    <>
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
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {application.applicantId.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">Applicant #{application.id}</h3>
                    <Badge 
                      variant="secondary" 
                      className={`${statusConfig[status]?.color} text-white`}
                    >
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig[status]?.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
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

              <div className="flex items-center gap-2">
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
                    <DropdownMenuItem onClick={() => setShowDetails(true)}>
                      <User className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
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

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Applicant Details</DialogTitle>
            <DialogDescription>
              Application #{application.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                  {application.applicantId.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg">Applicant #{application.id}</h3>
                <Badge className={`${statusConfig[status]?.color} text-white mt-1`}>
                  {statusConfig[status]?.label}
                </Badge>
              </div>
            </div>
            
            {application.message && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Message</h4>
                <p className="text-sm bg-muted p-3 rounded-lg">{application.message}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Applied</h4>
              <p className="text-sm">
                {application.createdAt ? format(new Date(application.createdAt), 'MMMM d, yyyy \'at\' h:mm a') : 'N/A'}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ManageApplicants() {
  const params = useParams();
  const jobId = Number(params.id);
  const { data: job, isLoading: jobLoading } = useJob(jobId);
  const { data: applications, isLoading: appsLoading } = useJobApplications(jobId);
  const updateStatus = useUpdateApplicationStatus();
  const [filter, setFilter] = useState<StatusFilter>('all');

  const handleUpdateStatus = (id: number, status: 'pending' | 'accepted' | 'rejected' | 'offered') => {
    updateStatus.mutate({ id, status });
  };

  const filteredApps = applications?.filter(app => 
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
          description={`${counts.all} total applications • ${job.location}`}
        />
      </div>

      {/* Filter Tabs */}
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

      {/* Applicants List */}
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
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
