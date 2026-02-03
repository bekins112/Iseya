import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/Sidebar";
import NotFound from "@/pages/not-found";

// Pages
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Onboarding from "@/pages/Onboarding";
import PostJob from "@/pages/PostJob";
import JobListing from "@/pages/JobListing";
import JobDetails from "@/pages/JobDetails";
import Applications from "@/pages/Applications";
import Profile from "@/pages/Profile";
import EmployerLogin from "@/pages/EmployerLogin";
import EmployerSignup from "@/pages/EmployerSignup";
import ManageJobs from "@/pages/ManageJobs";
import ManageApplicants from "@/pages/ManageApplicants";
import Subscription from "@/pages/Subscription";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  if (!user) return <Redirect to="/" />;

  // Redirect to onboarding if role or age is missing
  if ((!user.role || !user.age) && window.location.pathname !== "/onboarding") {
    return <Redirect to="/onboarding" />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Sidebar />
      <main className="md:pl-64 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto p-4 md:p-8 pt-4 md:pt-8">
           {children}
        </div>
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/employer" component={EmployerLogin} />
      <Route path="/employer/signup" component={EmployerSignup} />
      
      <Route path="/onboarding">
        <AuthenticatedLayout>
          <Onboarding />
        </AuthenticatedLayout>
      </Route>

      <Route path="/dashboard">
        <AuthenticatedLayout>
          <Dashboard />
        </AuthenticatedLayout>
      </Route>

      <Route path="/post-job">
        <AuthenticatedLayout>
          <PostJob />
        </AuthenticatedLayout>
      </Route>

      <Route path="/jobs">
        <AuthenticatedLayout>
          <JobListing />
        </AuthenticatedLayout>
      </Route>

      {/* Employer job management */}
      <Route path="/manage-jobs">
        <AuthenticatedLayout>
          <ManageJobs />
        </AuthenticatedLayout>
      </Route>

      <Route path="/jobs/:id">
        <AuthenticatedLayout>
          <JobDetails />
        </AuthenticatedLayout>
      </Route>

      <Route path="/my-applications">
        <AuthenticatedLayout>
          <Applications />
        </AuthenticatedLayout>
      </Route>

      {/* Employer applicant management */}
      <Route path="/jobs/:id/applications">
        <AuthenticatedLayout>
          <ManageApplicants />
        </AuthenticatedLayout>
      </Route>

      <Route path="/subscription">
        <AuthenticatedLayout>
          <Subscription />
        </AuthenticatedLayout>
      </Route>

      <Route path="/profile">
        <AuthenticatedLayout>
          <Profile />
        </AuthenticatedLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
