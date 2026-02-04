import { useRoute, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useJob, useCreateApplication } from "@/hooks/use-casual";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  ArrowLeft, 
  Briefcase, 
  Clock, 
  Calendar,
  Building2,
  Banknote,
  CheckCircle2,
  LogIn,
  UserPlus,
  ChevronRight
} from "lucide-react";
import { api } from "@shared/routes";
import type { Job } from "@shared/schema";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";

function formatTimeAgo(date: Date | string | null | undefined): string {
  if (!date) return "Recently";
  
  const now = new Date();
  const posted = new Date(date);
  const diffMs = now.getTime() - posted.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? 's' : ''} ago`;
}

function formatSalary(min: number, max: number, wage: string) {
  const formatNum = (n: number) => n >= 1000 ? `₦${(n/1000).toFixed(0)}k` : `₦${n}`;
  const wageLabel = wage === 'monthly' ? '/month' : wage === 'daily' ? '/day' : wage === 'hourly' ? '/hour' : '';
  return `${formatNum(min)} - ${formatNum(max)}${wageLabel}`;
}

export default function JobDetails() {
  const [, params] = useRoute("/jobs/:id");
  const [, setLocation] = useLocation();
  const id = parseInt(params?.id || "0");
  const { data: job, isLoading } = useJob(id);
  const { user, isLoading: authLoading } = useAuth();
  const createApplication = useCreateApplication();
  const [message, setMessage] = useState("");
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  // Fetch similar jobs (same category, excluding current job)
  const { data: similarJobs } = useQuery<Job[]>({
    queryKey: [api.jobs.list.path, 'similar', job?.category],
    queryFn: async () => {
      if (!job?.category) return [];
      const params = new URLSearchParams({ category: job.category });
      const res = await fetch(`${api.jobs.list.path}?${params}`);
      if (!res.ok) return [];
      const jobs = await res.json();
      return jobs.filter((j: Job) => j.id !== id && j.isActive).slice(0, 3);
    },
    enabled: !!job?.category,
  });

  const handleApplyClick = () => {
    if (!user) {
      setLoginPromptOpen(true);
    } else {
      setApplyDialogOpen(true);
    }
  };

  const handleApply = () => {
    if (!user) return;
    createApplication.mutate({
      jobId: job!.id,
      applicantId: user.id,
      message: message,
      status: "pending"
    }, {
      onSuccess: () => {
        setApplyDialogOpen(false);
        setMessage("");
      }
    });
  };

  const handleLoginRedirect = () => {
    setLocation(`/?redirect=/jobs/${id}`);
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <img src={iseyaLogo} alt="Iṣéyá" className="h-8 w-auto" />
            </Link>
          </div>
        </nav>
        <main className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-12 bg-muted rounded w-3/4" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <img src={iseyaLogo} alt="Iṣéyá" className="h-8 w-auto" />
            </Link>
          </div>
        </nav>
        <main className="pt-24 pb-16 px-4 max-w-4xl mx-auto text-center">
          <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Job Not Found</h1>
          <p className="text-muted-foreground mb-6">This job may have been removed or doesn't exist.</p>
          <Link href="/browse-jobs">
            <Button>Browse Available Jobs</Button>
          </Link>
        </main>
      </div>
    );
  }

  const isEmployer = user?.role === "employer";
  const isMyJob = job.employerId === user?.id;
  const isApplicant = user?.role === "applicant";

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src={iseyaLogo} alt="Iṣéyá" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/browse-jobs">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="overflow-hidden">
            <div className="bg-primary/5 p-6 md:p-8 border-b">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">{job.category}</Badge>
                    <Badge variant={job.isActive ? "outline" : "secondary"}>
                      {job.isActive ? "Active" : "Closed"}
                    </Badge>
                  </div>
                  
                  <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-job-title">
                    {job.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Posted {formatTimeAgo(job.createdAt)}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-start md:items-end gap-3">
                  <div className="text-2xl font-bold text-primary" data-testid="text-job-salary">
                    {formatSalary(job.salaryMin, job.salaryMax, job.wage)}
                  </div>
                  
                  {!isEmployer && job.isActive && (
                    <Button 
                      size="lg" 
                      onClick={handleApplyClick}
                      className="w-full md:w-auto"
                      data-testid="button-apply"
                    >
                      Apply Now
                    </Button>
                  )}
                  
                  {isMyJob && (
                    <Link href={`/jobs/${job.id}/applications`}>
                      <Button variant="outline" data-testid="button-view-applications">
                        View Applications
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
            
            <CardContent className="p-6 md:p-8 space-y-8">
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Job Description
                </h2>
                <div className="prose max-w-none text-muted-foreground whitespace-pre-line" data-testid="text-job-description">
                  {job.description}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-muted/30">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Job Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category</span>
                        <span className="font-medium">{job.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Job Type</span>
                        <span className="font-medium">{job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-medium">{job.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/30">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Banknote className="w-4 h-4" />
                      Compensation
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Salary Range</span>
                        <span className="font-medium text-primary">
                          ₦{job.salaryMin.toLocaleString()} - ₦{job.salaryMax.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment</span>
                        <span className="font-medium">
                          {job.wage === 'monthly' ? 'Monthly' : job.wage === 'daily' ? 'Daily' : job.wage === 'hourly' ? 'Hourly' : job.wage}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {!user && job.isActive && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-2">Interested in this job?</h3>
                    <p className="text-muted-foreground mb-4">
                      Create a free account to apply and connect with employers
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={handleLoginRedirect} data-testid="button-login-to-apply">
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In to Apply
                      </Button>
                      <Link href="/">
                        <Button variant="outline" data-testid="button-signup-to-apply">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Create Account
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Similar Jobs Section */}
        {similarJobs && similarJobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h2 className="text-xl font-bold mb-4">Similar Jobs</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {similarJobs.map((similarJob) => (
                <Card key={similarJob.id} className="hover-elevate transition-all group" data-testid={`card-similar-job-${similarJob.id}`}>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <Badge variant="outline" className="mb-2">{similarJob.category}</Badge>
                      <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                        {similarJob.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {similarJob.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {similarJob.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {similarJob.jobType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="font-semibold text-primary text-sm">
                        {formatSalary(similarJob.salaryMin, similarJob.salaryMax, similarJob.wage)}
                      </span>
                      <Link 
                        href={`/jobs/${similarJob.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                        data-testid={`link-similar-job-${similarJob.id}`}
                      >
                        View
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
            <DialogDescription>
              Introduce yourself to the employer. Keep it professional and brief.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Your Message</Label>
              <Textarea 
                placeholder="Hi, I'm interested in this position because..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[150px]"
                data-testid="textarea-application-message"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApply} 
              disabled={createApplication.isPending}
              data-testid="button-send-application"
            >
              {createApplication.isPending ? "Sending..." : "Send Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={loginPromptOpen} onOpenChange={setLoginPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in to Apply</DialogTitle>
            <DialogDescription>
              You need to create an account or sign in to apply for this job.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              Join Iṣéyá to apply for jobs, track your applications, and connect with employers.
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setLoginPromptOpen(false)} className="sm:flex-1">
              Cancel
            </Button>
            <Button onClick={handleLoginRedirect} className="sm:flex-1" data-testid="button-dialog-login">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={iseyaLogo} alt="Iṣéyá" className="h-6 w-auto" />
            <span className="text-sm text-muted-foreground">© 2026 Iṣéyá. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/browse-jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Browse Jobs
            </Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/faqs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              FAQs
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
