import { useAuth } from "@/hooks/use-auth";
import { useJobs, useMyApplications } from "@/hooks/use-casual";
import { PageHeader, StatusBadge } from "@/components/ui-extension";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlusCircle, Search, Calendar, Briefcase, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { JobCard } from "@/components/JobCard";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const isEmployer = user?.role === "employer";

  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const { data: myApplications, isLoading: appsLoading } = useMyApplications();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8 pb-10">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <PageHeader 
          title={`Welcome back, ${user?.firstName || "User"}!`} 
          description={isEmployer ? "Manage your job listings and applicants." : "Find your next casual opportunity today."}
          actions={
            isEmployer && (
              <Link href="/post-job">
                <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                  <PlusCircle className="w-4 h-4" /> Post a Job
                </Button>
              </Link>
            )
          }
        />
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={item}>
          <Card className="bg-primary text-primary-foreground overflow-hidden relative group border-none shadow-xl shadow-primary/10">
            <TrendingUp className="absolute right-[-10px] top-[-10px] w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider opacity-80">
                {isEmployer ? "Active Jobs" : "Applications Sent"}
              </CardTitle>
              <Briefcase className="w-4 h-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                {isEmployer ? (jobs?.filter(j => j.employerId === user?.id).length || 0) : (myApplications?.length || 0)}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card className="bg-accent text-accent-foreground overflow-hidden relative group border-none shadow-xl shadow-accent/10">
            <CheckCircle2 className="absolute right-[-10px] top-[-10px] w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider opacity-80">
                {isEmployer ? "Total Applicants" : "Pending Reviews"}
              </CardTitle>
              <Search className="w-4 h-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">0</div>
              <p className="text-xs opacity-70">Analytics coming soon</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-card overflow-hidden relative group border-border/40 shadow-xl shadow-black/5">
            <Calendar className="absolute right-[-10px] top-[-10px] w-24 h-24 opacity-5 group-hover:scale-110 transition-transform text-green-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Subscription</CardTitle>
              <Users className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold capitalize">{user?.subscriptionStatus}</span>
                <StatusBadge status={user?.subscriptionStatus || "free"} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            {isEmployer ? "Your Recent Postings" : "Recent Opportunities"}
          </h2>
          <Link href={isEmployer ? "/my-jobs" : "/jobs"}>
            <Button variant="ghost" className="text-primary hover:text-primary/80 font-bold group">
              View All <TrendingUp className="ml-2 w-4 h-4 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {jobsLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-72 bg-muted/40 rounded-3xl animate-pulse border border-border/20" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {jobs?.slice(0, 3).map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
              >
                <JobCard job={job} isEmployer={isEmployer} />
              </motion.div>
            ))}
            {jobs?.length === 0 && (
              <div className="col-span-3 text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-border/40">
                <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-xl font-bold text-muted-foreground">No jobs found.</p>
                {isEmployer && (
                  <Link href="/post-job">
                    <Button variant="ghost" className="mt-2 text-primary font-bold">Create your first job post</Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
