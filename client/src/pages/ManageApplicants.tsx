import { useState } from "react";
import { useParams, Link } from "wouter";
import { useJob, useJobApplications, useUpdateApplicationStatus, useApplicantProfile, useSendOffer, useScheduleInterview, useJobInterviews, useUpdateInterview } from "@/hooks/use-casual";
import { PageHeader } from "@/components/ui-extension";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  CalendarClock,
  MapPin,
  Video,
  Phone,
  Link2,
  X,
  ShieldCheck,
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
  applicantPhone?: string | null;
  applicantProfileImageUrl?: string | null;
  applicantCvUrl?: string | null;
  applicantGender?: string | null;
  applicantAge?: number | null;
  applicantIsVerified?: boolean;
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
                {profile.email ? (
                  <p className="text-sm text-muted-foreground flex items-center gap-1" data-testid="text-profile-email">
                    <Mail className="w-3 h-3" />
                    {profile.email}
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5" data-testid="text-contact-hidden">
                    <ShieldCheck className="w-3 h-3" />
                    Contact info hidden — applicant not verified
                  </p>
                )}
                {profile.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5" data-testid="text-profile-phone">
                    <Phone className="w-3 h-3" />
                    {profile.phone}
                  </p>
                )}
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
                <a href={`/api/download/cv/${profile.cvUrl.split('/').pop()}`} data-testid="button-download-cv">
                  <Button variant="outline" className="w-full gap-2">
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

function SendOfferDialog({ 
  application, 
  open, 
  onOpenChange 
}: { 
  application: EnrichedApplication | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const sendOffer = useSendOffer();
  const [salary, setSalary] = useState("");
  const [compensation, setCompensation] = useState("");
  const [note, setNote] = useState("");

  const handleSend = () => {
    if (!application || !salary) return;
    sendOffer.mutate({
      applicationId: application.id,
      salary: Number(salary),
      compensation: compensation || undefined,
      note: note || undefined,
    }, {
      onSuccess: () => {
        setSalary("");
        setCompensation("");
        setNote("");
        onOpenChange(false);
      },
    });
  };

  const applicantName = application?.applicantName || "Applicant";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Send Offer
          </DialogTitle>
          <DialogDescription>
            Send a job offer to {applicantName} with salary and compensation details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="offer-salary">Monthly Salary (NGN) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">&#8358;</span>
              <Input
                id="offer-salary"
                type="number"
                placeholder="e.g. 50000"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="pl-8"
                data-testid="input-offer-salary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="offer-compensation">Compensation / Benefits</Label>
            <Input
              id="offer-compensation"
              placeholder="e.g. Transport allowance, lunch provided"
              value={compensation}
              onChange={(e) => setCompensation(e.target.value)}
              data-testid="input-offer-compensation"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="offer-note">Note to Applicant</Label>
            <Textarea
              id="offer-note"
              placeholder="Any additional message for the applicant..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none"
              rows={3}
              data-testid="input-offer-note"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={handleSend}
              disabled={!salary || Number(salary) <= 0 || sendOffer.isPending}
              className="flex-1 gap-2"
              data-testid="button-confirm-send-offer"
            >
              <Send className="w-4 h-4" />
              {sendOffer.isPending ? "Sending..." : "Send Offer"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-offer"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ScheduleInterviewDialog({ 
  application, 
  open, 
  onOpenChange 
}: { 
  application: EnrichedApplication | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const scheduleInterview = useScheduleInterview();
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewType, setInterviewType] = useState("in-person");
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");

  const handleSchedule = () => {
    if (!application || !interviewDate || !interviewTime) return;
    scheduleInterview.mutate({
      applicationId: application.id,
      interviewDate,
      interviewTime,
      interviewType,
      location: location || undefined,
      meetingLink: meetingLink || undefined,
      notes: notes || undefined,
    }, {
      onSuccess: () => {
        setInterviewDate("");
        setInterviewTime("");
        setInterviewType("in-person");
        setLocation("");
        setMeetingLink("");
        setNotes("");
        onOpenChange(false);
      },
    });
  };

  const applicantName = application?.applicantName || "Applicant";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-primary" />
            Schedule Interview
          </DialogTitle>
          <DialogDescription>
            Arrange an interview with {applicantName} before making your final decision.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="interview-date">Date *</Label>
              <Input
                id="interview-date"
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                data-testid="input-interview-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interview-time">Time *</Label>
              <Input
                id="interview-time"
                type="time"
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                data-testid="input-interview-time"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interview-type">Interview Type *</Label>
            <Select value={interviewType} onValueChange={setInterviewType}>
              <SelectTrigger data-testid="select-interview-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-person">In-Person</SelectItem>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="video">Video Call</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {interviewType === "in-person" && (
            <div className="space-y-2">
              <Label htmlFor="interview-location">Location</Label>
              <Input
                id="interview-location"
                placeholder="e.g. 15 Marina Road, Lagos"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                data-testid="input-interview-location"
              />
            </div>
          )}

          {(interviewType === "video" || interviewType === "phone") && (
            <div className="space-y-2">
              <Label htmlFor="interview-link">{interviewType === "video" ? "Meeting Link" : "Phone Number"}</Label>
              <Input
                id="interview-link"
                placeholder={interviewType === "video" ? "e.g. https://meet.google.com/..." : "e.g. +234 801 234 5678"}
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                data-testid="input-interview-link"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="interview-notes">Notes for Applicant</Label>
            <Textarea
              id="interview-notes"
              placeholder="e.g. Please bring your ID card and dress formally..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
              data-testid="input-interview-notes"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={handleSchedule}
              disabled={!interviewDate || !interviewTime || scheduleInterview.isPending}
              className="flex-1 gap-2"
              data-testid="button-confirm-schedule-interview"
            >
              <CalendarClock className="w-4 h-4" />
              {scheduleInterview.isPending ? "Scheduling..." : "Schedule Interview"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-interview"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InterviewBadge({ applicationId, interviews }: { applicationId: number; interviews: any[] }) {
  const interview = interviews?.find((i: any) => i.applicationId === applicationId && i.status === "scheduled");
  if (!interview) return null;

  const typeIcon = interview.interviewType === "video" ? Video : 
                   interview.interviewType === "phone" ? Phone : MapPin;
  const TypeIcon = typeIcon;

  return (
    <div className="mt-2 bg-primary/5 border border-primary/20 rounded-md p-3">
      <div className="flex items-center gap-2 mb-1">
        <CalendarClock className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-primary">Interview Scheduled</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {interview.interviewDate}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {interview.interviewTime}
        </div>
        <div className="flex items-center gap-1 col-span-2">
          <TypeIcon className="w-3 h-3" />
          {interview.interviewType === "in-person" ? "In-Person" : interview.interviewType === "phone" ? "Phone" : "Video"}
          {interview.location && ` - ${interview.location}`}
          {interview.meetingLink && ` - ${interview.meetingLink}`}
        </div>
        {interview.notes && (
          <div className="col-span-2 flex items-start gap-1">
            <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{interview.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicantCard({ 
  application, 
  onUpdateStatus,
  onViewProfile,
  onSendOffer,
  onScheduleInterview,
  onCancelInterview,
  interviews,
}: { 
  application: EnrichedApplication;
  onUpdateStatus: (id: number, status: 'pending' | 'accepted' | 'rejected' | 'offered') => void;
  onViewProfile: (applicantId: string) => void;
  onSendOffer: (application: EnrichedApplication) => void;
  onScheduleInterview: (application: EnrichedApplication) => void;
  onCancelInterview: (interviewId: number) => void;
  interviews: any[];
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
                  {application.applicantIsVerified && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-500 bg-green-50 dark:bg-green-950/30">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
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
                <InterviewBadge applicationId={application.id} interviews={interviews} />
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
                <a href={`/api/download/cv/${application.applicantCvUrl.split('/').pop()}`} data-testid={`button-download-cv-${application.id}`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="w-4 h-4" />
                    CV
                  </Button>
                </a>
              )}

              {(status === 'pending' || status === 'offered') && !interviews?.find((i: any) => i.applicationId === application.id && i.status === "scheduled") && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={() => onScheduleInterview(application)}
                  data-testid={`button-schedule-interview-${application.id}`}
                >
                  <CalendarClock className="w-4 h-4" />
                  Schedule Interview
                </Button>
              )}

              {(status === 'pending' || status === 'offered') && interviews?.find((i: any) => i.applicationId === application.id && i.status === "scheduled") && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1 text-destructive"
                  onClick={() => {
                    const interview = interviews.find((i: any) => i.applicationId === application.id && i.status === "scheduled");
                    if (interview) onCancelInterview(interview.id);
                  }}
                  data-testid={`button-cancel-interview-${application.id}`}
                >
                  <X className="w-4 h-4" />
                  Cancel Interview
                </Button>
              )}

              {status === 'pending' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => onSendOffer(application)}
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
                      <a href={`/api/download/cv/${application.applicantCvUrl.split('/').pop()}`}>
                        <Download className="w-4 h-4 mr-2" />
                        Download CV
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {(status === 'pending' || status === 'offered') && !interviews?.find((i: any) => i.applicationId === application.id && i.status === "scheduled") && (
                    <DropdownMenuItem onClick={() => onScheduleInterview(application)}>
                      <CalendarClock className="w-4 h-4 mr-2" />
                      Schedule Interview
                    </DropdownMenuItem>
                  )}
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
  const { data: applications, isLoading: appsLoading, error: appsError } = useJobApplications(jobId);
  const { data: interviewsData } = useJobInterviews(jobId);
  const updateStatus = useUpdateApplicationStatus();
  const updateInterview = useUpdateInterview();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [profileApplicantId, setProfileApplicantId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [offerApp, setOfferApp] = useState<EnrichedApplication | null>(null);
  const [offerOpen, setOfferOpen] = useState(false);
  const [interviewApp, setInterviewApp] = useState<EnrichedApplication | null>(null);
  const [interviewOpen, setInterviewOpen] = useState(false);

  const interviews = interviewsData || [];

  const handleUpdateStatus = (id: number, status: 'pending' | 'accepted' | 'rejected' | 'offered') => {
    updateStatus.mutate({ id, status });
  };

  const handleViewProfile = (applicantId: string) => {
    setProfileApplicantId(applicantId);
    setProfileOpen(true);
  };

  const handleSendOffer = (application: EnrichedApplication) => {
    setOfferApp(application);
    setOfferOpen(true);
  };

  const handleScheduleInterview = (application: EnrichedApplication) => {
    setInterviewApp(application);
    setInterviewOpen(true);
  };

  const handleCancelInterview = (interviewId: number) => {
    updateInterview.mutate({ id: interviewId, status: "cancelled" });
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

  if ((appsError as any)?.code === "SUBSCRIPTION_REQUIRED") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/manage-jobs">
            <Button variant="ghost" size="icon" data-testid="button-back-to-jobs-sub">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <PageHeader title="Subscription Required" description="Upgrade to manage applicants" />
        </div>
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700" data-testid="banner-subscription-required">
          <CardContent className="p-6 text-center">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-amber-600 dark:text-amber-400" />
            <h3 className="font-bold text-lg mb-2">Upgrade Your Plan</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You need an active subscription to view and manage job applicants. Upgrade now to access all applicant profiles, send offers, and schedule interviews.
            </p>
            <Link href="/subscription">
              <Button className="gap-2" data-testid="button-upgrade-subscription">
                Upgrade Plan
              </Button>
            </Link>
          </CardContent>
        </Card>
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
                onSendOffer={handleSendOffer}
                onScheduleInterview={handleScheduleInterview}
                onCancelInterview={handleCancelInterview}
                interviews={interviews}
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

      <SendOfferDialog
        application={offerApp}
        open={offerOpen}
        onOpenChange={setOfferOpen}
      />

      <ScheduleInterviewDialog
        application={interviewApp}
        open={interviewOpen}
        onOpenChange={setInterviewOpen}
      />
    </div>
  );
}
