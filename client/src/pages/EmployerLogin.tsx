import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Building2, Users, TrendingUp, ArrowRight, CheckCircle2, Briefcase, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import iseyaLogo from "@assets/Iseya_(2)_1770119862471.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, StatusBadge } from "@/components/ui-extension";

export default function EmployerLogin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const handleEmployerLogin = () => {
    localStorage.setItem("intended_role", "employer");
    if (isAuthenticated) {
      if (user && user.role !== "employer") {
        // Log out and redirect back to employer login
        window.location.href = "/api/logout?redirect=/employer";
        return;
      }
      setLocation("/dashboard");
      return;
    }
    window.location.href = "/api/login?redirect=/employer";
  };

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
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src={iseyaLogo} alt="Iṣéyá" className="h-8 w-auto" />
          </a>
          <a href="/">
            <Button variant="ghost" className="font-medium">
              Back to Home
            </Button>
          </a>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <PageHeader 
            title="Employer Portal" 
            description="Sign in or create your employer account to start hiring talent."
          />
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          <motion.div variants={item}>
            <Card className="bg-primary text-primary-foreground overflow-hidden relative group border-none shadow-xl shadow-primary/10">
              <TrendingUp className="absolute right-[-10px] top-[-10px] w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-wider opacity-80">
                  Active Employers
                </CardTitle>
                <Briefcase className="w-4 h-4 opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">500+</div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={item}>
            <Card className="bg-accent text-accent-foreground overflow-hidden relative group border-none shadow-xl shadow-accent/10">
              <CheckCircle2 className="absolute right-[-10px] top-[-10px] w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-wider opacity-80">
                  Available Workers
                </CardTitle>
                <Users className="w-4 h-4 opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">10k+</div>
                <p className="text-xs opacity-70">Ready to work for you</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="bg-card overflow-hidden relative group border-border/40 shadow-xl shadow-black/5">
              <Calendar className="absolute right-[-10px] top-[-10px] w-24 h-24 opacity-5 group-hover:scale-110 transition-transform text-green-500" />
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Success Rate</CardTitle>
                <Users className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">95%</span>
                  <StatusBadge status="premium" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid lg:grid-cols-2 gap-10 mt-10"
        >
          <Card className="border-2 border-primary/20 shadow-2xl shadow-primary/10 rounded-3xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary to-accent" />
            <CardHeader className="text-center pt-10 pb-6">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Building2 className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-display font-bold">Get Started</CardTitle>
              <p className="text-muted-foreground mt-2">
                Sign in with your account or create a new employer profile
              </p>
            </CardHeader>
            <CardContent className="px-10 pb-10 space-y-6">
              <Button 
                onClick={handleEmployerLogin}
                className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 group"
                data-testid="button-employer-login"
              >
                Continue as Employer
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-2xl font-display font-bold flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                Why Choose Iṣéyá?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { icon: <Briefcase className="w-5 h-5" />, title: "Post Unlimited Jobs", desc: "Create as many job listings as you need" },
                { icon: <Users className="w-5 h-5" />, title: "Verified Workers", desc: "Access pre-screened, reliable talent" },
                { icon: <TrendingUp className="w-5 h-5" />, title: "Quick Turnaround", desc: "Get quality applications within 24 hours" },
                { icon: <CheckCircle2 className="w-5 h-5" />, title: "Direct Messaging", desc: "Chat directly with potential hires" },
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-bold">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
