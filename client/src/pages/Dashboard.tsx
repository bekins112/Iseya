import { useAuth } from "@/hooks/use-auth";
import { useJobs, useMyApplications } from "@/hooks/use-casual";
import { PageHeader, StatusBadge } from "@/components/ui-extension";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { PlusCircle, Briefcase, TrendingUp, CheckCircle2, X, AlertCircle, Home, Receipt, CreditCard, ArrowUpRight, Calendar, Users, ShieldAlert, Coins } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@shared/schema";
import { JobCard } from "@/components/JobCard";
import { motion } from "framer-motion";
import { checkApplicantProfile, checkEmployerProfile } from "@/lib/profile-utils";


export default function Dashboard() {
  const { user } = useAuth();
  const isAgent = user?.role === "agent";
  const isEmployer = user?.role === "employer" || isAgent;
  const isApplicant = user?.role === "applicant";

  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const { data: myApplications } = useMyApplications();
  const { data: myTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/my-transactions"],
    enabled: !!user,
  });

  const filteredTransactions = (myTransactions || []).filter(t => {
    if (isAgent) return t.type === "subscription" || t.type === "agent_post_credit";
    if (isEmployer) return t.type === "subscription";
    if (isApplicant) return t.type === "verification";
    return true;
  });

  const myJobs = jobs?.filter(j => isAgent ? (j as any).agentId === user?.id : j.employerId === user?.id) || [];
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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
          description={
            <span className="flex items-center gap-2 flex-wrap">
              {isAgent && <Badge variant="outline" className="bg-teal-500/10 text-teal-700 border-teal-500/30 dark:text-teal-400" data-testid="badge-agent-role">Agent</Badge>}
              {isAgent ? "Manage job postings for your clients." : isEmployer ? "Manage your job listings and applicants." : "Find your next casual opportunity today."}
            </span>
          }
          actions={
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="outline" className="gap-2 rounded-xl" data-testid="button-home">
                  <Home className="w-4 h-4" /> Home
                </Button>
              </Link>
              {isEmployer && (
                <Link href="/post-job">
                  <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20" data-testid="button-post-job">
                    <PlusCircle className="w-4 h-4" /> Post a Job
                  </Button>
                </Link>
              )}
            </div>
          }
        />
      </motion.div>

      {(() => {
        if (!user) return null;
        const profileCheck = isApplicant
          ? checkApplicantProfile(user as any)
          : isEmployer
          ? checkEmployerProfile(user as any)
          : { isComplete: true, missingFields: [] };

        if (profileCheck.isComplete) return null;

        const action = isApplicant ? "apply for jobs" : "post jobs";
        return (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-destructive/40 bg-destructive/5 shadow-md" data-testid="card-profile-prompt">
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="rounded-full bg-destructive/10 p-2 flex-shrink-0">
                    <ShieldAlert className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-destructive" data-testid="text-profile-prompt-title">
                      Profile incomplete — you cannot {action} yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5" data-testid="text-profile-prompt-missing">
                      Required: {profileCheck.missingFields.join(", ")}
                    </p>
                  </div>
                </div>
                <Link href="/profile">
                  <Button size="sm" className="flex-shrink-0 bg-destructive hover:bg-destructive/90 text-white" data-testid="button-complete-profile">
                    Complete Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        );
      })()}

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={item}>
          <Card className="bg-primary text-primary-foreground overflow-hidden relative group border-none shadow-xl shadow-primary/10">
            <TrendingUp className="absolute right-[-10px] top-[-10px] w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider opacity-80">
                {isAgent ? "Jobs Posted" : isEmployer ? "Active Jobs" : "Applications Sent"}
              </CardTitle>
              <Briefcase className="w-4 h-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold" data-testid="text-stat-primary">
                {isAgent ? myJobs.length : isEmployer ? (jobs?.filter(j => j.employerId === user?.id).length || 0) : (myApplications?.length || 0)}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card className="bg-accent text-accent-foreground overflow-hidden relative group border-none shadow-xl shadow-accent/10">
            <CheckCircle2 className="absolute right-[-10px] top-[-10px] w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider opacity-80">
                {isAgent ? "Post Credits" : isEmployer ? "Total Applicants" : "Pending Reviews"}
              </CardTitle>
              {isAgent ? <Coins className="w-4 h-4 opacity-80" /> : <Users className="w-4 h-4 opacity-80" />}
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold" data-testid="text-stat-secondary">
                {isAgent ? ((user as any)?.agentPostCredits || 0) : isEmployer ? (jobs?.filter(j => j.employerId === user?.id).reduce((acc) => acc + 1, 0) || 0) : 0}
              </div>
              <p className="text-xs opacity-70">
                {isAgent ? "Available job post credits" : isEmployer ? "Across all your job postings" : "Analytics coming soon"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-card overflow-hidden relative group border-border/40 shadow-xl shadow-black/5">
            <Calendar className="absolute right-[-10px] top-[-10px] w-24 h-24 opacity-5 group-hover:scale-110 transition-transform text-green-500" />
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Subscription</CardTitle>
              <Users className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold capitalize" data-testid="text-subscription-status">{user?.subscriptionStatus}</span>
                <StatusBadge status={user?.subscriptionStatus || "free"} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {(isEmployer || isAgent) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <Card className="border-border/40 shadow-md" data-testid="card-transaction-history">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-display font-bold flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  {isAgent ? "Transaction History" : "Subscription Transaction History"}
                </CardTitle>
                <Badge variant="outline" className="text-xs" data-testid="badge-transaction-count">
                  {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-6" data-testid="empty-transactions">
                  <Receipt className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No subscription transactions yet. Subscribe to a plan to see your payment history here.
                  </p>
                </div>
              ) : (
                <>
                  {filteredTransactions.slice(0, 5).map((txn) => (
                    <div
                      key={txn.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border/30"
                      data-testid={`row-transaction-${txn.id}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          txn.status === "success" ? "bg-green-100 dark:bg-green-900/30" :
                          txn.status === "failed" ? "bg-red-100 dark:bg-red-900/30" :
                          "bg-yellow-100 dark:bg-yellow-900/30"
                        }`}>
                          {txn.status === "success" ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : txn.status === "failed" ? (
                            <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                          ) : (
                            <CreditCard className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" data-testid={`text-txn-desc-${txn.id}`}>
                            {`${(txn.plan || "").charAt(0).toUpperCase() + (txn.plan || "").slice(1)} Plan`}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="capitalize">{txn.gateway}</span>
                            <span>•</span>
                            <span>{txn.createdAt ? new Date(txn.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-bold" data-testid={`text-txn-amount-${txn.id}`}>
                          ₦{(txn.amount / 100).toLocaleString()}
                        </span>
                        <Badge
                          variant={txn.status === "success" ? "default" : txn.status === "failed" ? "destructive" : "secondary"}
                          className="text-[10px] px-1.5 py-0"
                          data-testid={`badge-txn-status-${txn.id}`}
                        >
                          {txn.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {filteredTransactions.length > 5 && (
                    <p className="text-xs text-center text-muted-foreground pt-1">
                      Showing 5 of {filteredTransactions.length} transactions
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            {isAgent ? "Your Client Postings" : isEmployer ? "Your Recent Postings" : "Recent Opportunities"}
          </h2>
          <Link href={(isEmployer || isAgent) ? "/my-jobs" : "/jobs"}>
            <Button variant="ghost" className="text-primary font-bold group" data-testid="button-view-all-jobs">
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
            {((isEmployer || isAgent) ? myJobs : jobs)?.slice(0, 3).map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
              >
                <JobCard job={job} isEmployer={isEmployer} />
              </motion.div>
            ))}
            {((isEmployer ? myJobs : jobs)?.length === 0) && (
              <div className="col-span-3 text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-border/40">
                <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-xl font-bold text-muted-foreground">No jobs found.</p>
                {isEmployer && (
                  <Link href="/post-job">
                    <Button variant="ghost" className="mt-2 text-primary font-bold" data-testid="button-create-first-job">Create your first job post</Button>
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
