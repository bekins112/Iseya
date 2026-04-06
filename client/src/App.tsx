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
import Login from "@/pages/Login";
import Register from "@/pages/Register";
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
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";
import AdminJobs from "@/pages/AdminJobs";
import AdminSubAdmins from "@/pages/AdminSubAdmins";
import AdminSubscriptions from "@/pages/AdminSubscriptions";
import AdminStatistics from "@/pages/AdminStatistics";
import AdminTickets from "@/pages/AdminTickets";
import AdminReports from "@/pages/AdminReports";
import AdminVerifications from "@/pages/AdminVerifications";
import AdminNotifications from "@/pages/AdminNotifications";
import AdminSettings from "@/pages/AdminSettings";
import AdminTransactions from "@/pages/AdminTransactions";
import AdminAds from "@/pages/AdminAds";
import AdminGoogleAds from "@/pages/AdminGoogleAds";
import GoogleAdCodes from "@/components/GoogleAdCodes";
import AdminAgentCredits from "@/pages/AdminAgentCredits";
import AdminAutomatedEmails from "@/pages/AdminAutomatedEmails";
import Verification from "@/pages/Verification";
import About from "@/pages/About";
import FAQs from "@/pages/FAQs";
import Contact from "@/pages/Contact";
import BrowseJobs from "@/pages/BrowseJobs";
import Disclaimer from "@/pages/Disclaimer";
import TermsOfUse from "@/pages/TermsOfUse";
import CopyrightPage from "@/pages/Copyright";
import CookiePolicy from "@/pages/CookiePolicy";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import VerifyEmail from "@/pages/VerifyEmail";
import Support from "@/pages/Support";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import ForEmployers from "@/pages/ForEmployers";
import ForApplicants from "@/pages/ForApplicants";
import ForAgents from "@/pages/ForAgents";
import CookieConsent from "@/components/CookieConsent";
import InstallPrompt from "@/components/InstallPrompt";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  if (!user) return <Redirect to="/login" />;

  const isAdmin = user.role === "admin" || (user as any).isAdmin;

  if (!isAdmin && !(user as any).emailVerified) {
    return <Redirect to="/verify-email" />;
  }

  if ((!user.role || !user.age) && window.location.pathname !== "/onboarding") {
    return <Redirect to="/onboarding" />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Sidebar />
      <main className="md:pl-64 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto p-4 md:p-8 pt-16 md:pt-8">
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
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/register" component={Register} />
      <Route path="/employer">
        <Redirect to="/register" />
      </Route>
      <Route path="/employer/signup">
        <Redirect to="/register" />
      </Route>
      <Route path="/for-employers" component={ForEmployers} />
      <Route path="/for-applicants" component={ForApplicants} />
      <Route path="/for-agents" component={ForAgents} />
      <Route path="/about" component={About} />
      <Route path="/faqs" component={FAQs} />
      <Route path="/contact" component={Contact} />
      <Route path="/disclaimer" component={Disclaimer} />
      <Route path="/terms" component={TermsOfUse} />
      <Route path="/copyright" component={CopyrightPage} />
      <Route path="/cookies" component={CookiePolicy} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/browse-jobs" component={BrowseJobs} />
      
      <Route path="/verify-email" component={VerifyEmail} />
      
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

      {/* Employer applicant management - must come before /jobs/:id/:slug? */}
      <Route path="/jobs/:id/applications">
        <AuthenticatedLayout>
          <ManageApplicants />
        </AuthenticatedLayout>
      </Route>

      {/* Public job details page - slug-based URLs like /jobs/female-childcare-worker-needed-11 */}
      <Route path="/jobs/:slug">
        <JobDetails />
      </Route>

      <Route path="/my-applications">
        <AuthenticatedLayout>
          <Applications />
        </AuthenticatedLayout>
      </Route>

      <Route path="/verification/verify">
        <AuthenticatedLayout>
          <Verification />
        </AuthenticatedLayout>
      </Route>

      <Route path="/verification">
        <AuthenticatedLayout>
          <Verification />
        </AuthenticatedLayout>
      </Route>

      <Route path="/subscription/verify">
        <AuthenticatedLayout>
          <Subscription />
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

      <Route path="/support">
        <AuthenticatedLayout>
          <Support />
        </AuthenticatedLayout>
      </Route>

      {/* Admin routes */}
      <Route path="/admin/login">
        <AdminLogin />
      </Route>

      <Route path="/admin/dashboard">
        <AuthenticatedLayout>
          <AdminDashboard />
        </AuthenticatedLayout>
      </Route>

      <Route path="/admin/users">
        <AuthenticatedLayout>
          <AdminUsers />
        </AuthenticatedLayout>
      </Route>

      <Route path="/admin/jobs">
        <AuthenticatedLayout>
          <AdminJobs />
        </AuthenticatedLayout>
      </Route>

      <Route path="/admin/sub-admins">
        <AuthenticatedLayout>
          <AdminSubAdmins />
        </AuthenticatedLayout>
      </Route>

      <Route path="/admin/subscriptions">
        <AuthenticatedLayout>
          <AdminSubscriptions />
        </AuthenticatedLayout>
      </Route>

      <Route path="/admin/statistics">
        <AuthenticatedLayout>
          <AdminStatistics />
        </AuthenticatedLayout>
      </Route>

      <Route path="/admin/tickets">
        <AuthenticatedLayout>
          <AdminTickets />
        </AuthenticatedLayout>
      </Route>

      <Route path="/admin/reports">
        <AuthenticatedLayout>
          <AdminReports />
        </AuthenticatedLayout>
      </Route>

      <Route path="/admin/verifications">
        <AuthenticatedLayout>
          <AdminVerifications />
        </AuthenticatedLayout>
      </Route>

      <Route path="/admin/notifications">
        <AuthenticatedLayout>
          <AdminNotifications />
        </AuthenticatedLayout>
      </Route>

      <Route path="/admin/settings">
        <AuthenticatedLayout>
          <AdminSettings />
        </AuthenticatedLayout>
      </Route>

      <Route path="/admin/transactions">
        <AuthenticatedLayout>
          <AdminTransactions />
        </AuthenticatedLayout>
      </Route>

      <Route path="/admin/ads">
        <AuthenticatedLayout>
          <AdminAds />
        </AuthenticatedLayout>
      </Route>

      <Route path="/admin/google-ads">
        <AuthenticatedLayout>
          <AdminGoogleAds />
        </AuthenticatedLayout>
      </Route>

      <Route path="/admin/agent-credits">
        <AuthenticatedLayout>
          <AdminAgentCredits />
        </AuthenticatedLayout>
      </Route>

      <Route path="/admin/automated-emails">
        <AuthenticatedLayout>
          <AdminAutomatedEmails />
        </AuthenticatedLayout>
      </Route>

      <Route path="/admin">
        <AdminLogin />
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
        <GoogleAdCodes />
        <Router />
        <CookieConsent />
        <InstallPrompt />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
