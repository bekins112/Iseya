import { useState } from "react";
import { useMyApplications, useMyOffers, useRespondToOffer, useCancelApplication, useMyInterviews } from "@/hooks/use-casual";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader, StatusBadge } from "@/components/ui-extension";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { 
  MapPin, 
  Briefcase, 
  Building2, 
  Banknote, 
  Gift, 
  MessageSquare, 
  CheckCircle2, 
  XCircle,
  Clock,
  Send,
  FileText,
  Trash2,
  AlertTriangle,
  CalendarClock,
  Calendar,
  Video,
  Phone,
  Link2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EnrichedApp = {
  id: number;
  jobId: number;
  applicantId: string;
  message: string | null;
  status: string | null;
  createdAt: string | null;
  jobTitle: string;
  jobLocation: string;
  jobType: string;
  jobCategory: string;
  employerName: string;
  employerLogo: string | null;
  offer: {
    id: number;
    salary: number;
    compensation: string | null;
    note: string | null;
    status: string;
    createdAt: string;
  } | null;
};

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
}

function OfferDetailsDialog({
  app,
  open,
  onOpenChange,
}: {
  app: EnrichedApp | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const respond = useRespondToOffer();
  if (!app?.offer) return null;

  const offer = app.offer;
  const isPending = offer.status === "pending";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Job Offer Details
          </DialogTitle>
          <DialogDescription>
            Offer from {app.employerName} for {app.jobTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
            <Banknote className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Monthly Salary</p>
              <p className="font-bold text-lg" data-testid="text-offer-salary">{formatNaira(offer.salary)}</p>
            </div>
          </div>

          {offer.compensation && (
            <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
              <Gift className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Compensation / Benefits</p>
                <p className="text-sm" data-testid="text-offer-compensation">{offer.compensation}</p>
              </div>
            </div>
          )}

          {offer.note && (
            <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
              <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Note from Employer</p>
                <p className="text-sm" data-testid="text-offer-note">{offer.note}</p>
              </div>
            </div>
          )}

          {!isPending && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50">
              {offer.status === "accepted" ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium capitalize">{offer.status}</span>
            </div>
          )}

          {isPending && (
            <div className="flex items-center gap-2 pt-2">
              <Button
                className="flex-1 gap-2"
                onClick={() => {
                  respond.mutate({ offerId: offer.id, status: "accepted" }, {
                    onSuccess: () => onOpenChange(false),
                  });
                }}
                disabled={respond.isPending}
                data-testid="button-accept-offer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Accept Offer
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => {
                  respond.mutate({ offerId: offer.id, status: "declined" }, {
                    onSuccess: () => onOpenChange(false),
                  });
                }}
                disabled={respond.isPending}
                data-testid="button-decline-offer"
              >
                <XCircle className="w-4 h-4" />
                Decline
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CancelApplicationDialog({
  app,
  open,
  onOpenChange,
}: {
  app: EnrichedApp | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const cancelApp = useCancelApplication();
  if (!app) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Cancel Application
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to withdraw your application for <strong>{app.jobTitle}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="destructive"
            className="flex-1 gap-2"
            onClick={() => {
              cancelApp.mutate(app.id, {
                onSuccess: () => onOpenChange(false),
              });
            }}
            disabled={cancelApp.isPending}
            data-testid="button-confirm-cancel-application"
          >
            <Trash2 className="w-4 h-4" />
            {cancelApp.isPending ? "Cancelling..." : "Yes, Cancel"}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            data-testid="button-keep-application"
          >
            Keep Application
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Applications() {
  const { user } = useAuth();
  const { data: applications, isLoading } = useMyApplications();
  const { data: interviewsData } = useMyInterviews();
  const [selectedApp, setSelectedApp] = useState<EnrichedApp | null>(null);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [cancelApp, setCancelApp] = useState<EnrichedApp | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const apps = (applications as EnrichedApp[] | undefined) || [];
  const myInterviews = (interviewsData || []) as any[];
  const isVerified = user?.isVerified || false;

  const statusIcon = (status: string) => {
    switch (status) {
      case "offered": return <Send className="w-4 h-4 text-blue-500" />;
      case "accepted": return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "rejected": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Applications" description="Track the status of your job applications." />

      {!isVerified && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700" data-testid="banner-verification-required">
          <CardContent className="p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm text-amber-800 dark:text-amber-300">Verification Required</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                You need to get verified to manage your applications (cancel, respond to offers). You can still view your applications and apply for jobs.
              </p>
              <Link href="/verification">
                <Button size="sm" className="mt-2 gap-1" data-testid="button-get-verified">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Get Verified
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : apps.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">You haven't applied to any jobs yet.</p>
          <Link href="/jobs">
            <Button variant="ghost" className="mt-2" data-testid="link-browse-jobs">Browse Jobs</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {apps.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                layout
              >
                <Card className="hover-elevate" data-testid={`card-application-${app.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10 shrink-0 mt-0.5">
                        {app.employerLogo && <AvatarImage src={app.employerLogo} alt={app.employerName} />}
                        <AvatarFallback>
                          <Building2 className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="min-w-0">
                            <h3 className="font-bold text-base truncate" data-testid={`text-job-title-${app.id}`}>
                              {app.jobTitle}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate" data-testid={`text-employer-${app.id}`}>
                              {app.employerName}
                            </p>
                          </div>
                          <StatusBadge status={app.status || "pending"} />
                        </div>

                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                          {app.jobLocation && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {app.jobLocation}
                            </span>
                          )}
                          {app.jobType && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {app.jobType}
                            </span>
                          )}
                          {app.createdAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {app.offer && (
                          <div className="mt-3 p-2.5 rounded-md bg-muted/50 border border-border/50">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <Banknote className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-sm" data-testid={`text-offer-amount-${app.id}`}>
                                  {formatNaira(app.offer.salary)}
                                </span>
                                <Badge variant={
                                  app.offer.status === "accepted" ? "default" :
                                  app.offer.status === "declined" ? "destructive" : "secondary"
                                } className="text-xs">
                                  {app.offer.status === "pending" ? "Offer Received" : app.offer.status}
                                </Badge>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => {
                                  setSelectedApp(app);
                                  setOfferDialogOpen(true);
                                }}
                                disabled={app.offer.status === "pending" && !isVerified}
                                data-testid={`button-view-offer-${app.id}`}
                              >
                                {app.offer.status === "pending" ? (isVerified ? "Respond" : "Verify to Respond") : "View Details"}
                              </Button>
                            </div>
                          </div>
                        )}

                        {(() => {
                          const interview = myInterviews.find((i: any) => i.applicationId === app.id && i.status === "scheduled");
                          if (!interview) return null;
                          return (
                            <div className="mt-3 p-2.5 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50" data-testid={`interview-info-${app.id}`}>
                              <div className="flex items-center gap-2 mb-1.5">
                                <CalendarClock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="font-semibold text-sm text-blue-800 dark:text-blue-300">Interview Scheduled</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {interview.interviewDate ? new Date(interview.interviewDate).toLocaleDateString("en-NG", { weekday: "short", month: "short", day: "numeric" }) : "TBD"}
                                </div>
                                {interview.interviewTime && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {interview.interviewTime}
                                  </div>
                                )}
                                {interview.interviewType === "video" && interview.meetingLink && (
                                  <div className="col-span-2">
                                    <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline">
                                      <Video className="w-3 h-3" />
                                      Join Video Call
                                    </a>
                                  </div>
                                )}
                                {interview.interviewType === "phone" && (
                                  <div className="flex items-center gap-1 col-span-2">
                                    <Phone className="w-3 h-3" />
                                    Phone Interview
                                  </div>
                                )}
                                {interview.interviewType === "in-person" && interview.location && (
                                  <div className="flex items-center gap-1 col-span-2">
                                    <MapPin className="w-3 h-3" />
                                    {interview.location}
                                  </div>
                                )}
                              </div>
                              {interview.notes && (
                                <p className="text-xs text-muted-foreground mt-1.5 italic">
                                  {interview.notes}
                                </p>
                              )}
                            </div>
                          );
                        })()}

                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <Link href={`/jobs/${app.jobId}`}>
                            <Button variant="outline" size="sm" data-testid={`button-view-job-${app.id}`}>
                              View Job
                            </Button>
                          </Link>
                          {app.status !== "accepted" && isVerified && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-destructive"
                              onClick={() => {
                                setCancelApp(app);
                                setCancelDialogOpen(true);
                              }}
                              data-testid={`button-cancel-application-${app.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <OfferDetailsDialog
        app={selectedApp}
        open={offerDialogOpen}
        onOpenChange={setOfferDialogOpen}
      />

      <CancelApplicationDialog
        app={cancelApp}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
      />
    </div>
  );
}
