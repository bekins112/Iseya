import { useAuth } from "@/hooks/use-auth";
import { useJobs, useMyApplications } from "@/hooks/use-casual";
import { PageHeader, StatusBadge } from "@/components/ui-extension";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlusCircle, Search, Calendar, Briefcase } from "lucide-react";
import { JobCard } from "@/components/JobCard";

export default function Dashboard() {
  const { user } = useAuth();
  const isEmployer = user?.role === "employer";

  // Applicants see recent jobs
  const { data: jobs, isLoading: jobsLoading } = useJobs();
  // Applicants see their applications
  const { data: myApplications, isLoading: appsLoading } = useMyApplications();

  // Employer specific data would be fetched here if API supported filtering by employerId
  // For MVP, employers see all jobs (or filter in frontend if needed)

  return (
    <div className="space-y-8">
      <PageHeader 
        title={`Welcome back, ${user?.firstName || "User"}!`} 
        description={isEmployer ? "Manage your job listings and applicants." : "Find your next casual opportunity today."}
        actions={
          isEmployer && (
            <Link href="/post-job">
              <Button className="gap-2">
                <PlusCircle className="w-4 h-4" /> Post a Job
              </Button>
            </Link>
          )
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-enter delay-100">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isEmployer ? "Active Jobs" : "Applications Sent"}
            </CardTitle>
            <Briefcase className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isEmployer ? (jobs?.filter(j => j.employerId === user?.id).length || 0) : (myApplications?.length || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isEmployer ? "Total Applicants" : "Pending Reviews"}
            </CardTitle>
            <Search className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Analytics coming soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Subscription</CardTitle>
            <Calendar className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold capitalize">{user?.subscriptionStatus}</span>
              <StatusBadge status={user?.subscriptionStatus || "free"} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6 animate-enter delay-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold">
            {isEmployer ? "Your Recent Postings" : "Recent Opportunities"}
          </h2>
          <Link href={isEmployer ? "/my-jobs" : "/jobs"}>
            <Button variant="ghost" className="text-primary hover:text-primary/80">View All</Button>
          </Link>
        </div>

        {jobsLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {jobs?.slice(0, 3).map(job => (
              <JobCard key={job.id} job={job} isEmployer={isEmployer} />
            ))}
            {jobs?.length === 0 && (
              <div className="col-span-3 text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                <p className="text-muted-foreground">No jobs found.</p>
                {isEmployer && (
                  <Link href="/post-job">
                    <Button variant="link" className="mt-2">Create your first job post</Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
