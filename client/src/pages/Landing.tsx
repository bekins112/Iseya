import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Briefcase, UserCheck, ShieldCheck, ArrowRight, CheckCircle2, Star, Zap, Globe, Search, Building2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";
import { Card, CardContent } from "@/components/ui/card";

type UserMode = "seeker" | "employer";

export default function Landing() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeMode, setActiveMode] = useState<UserMode>("seeker");

  const handleLogin = (role: "applicant" | "employer") => {
    localStorage.setItem("intended_role", role);
    if (isAuthenticated) {
      if (user && user.role !== role) {
        window.location.href = "/api/logout";
        return;
      }
      setLocation("/dashboard");
      return;
    }
    window.location.href = "/api/login";
  };

  const handleSignup = (role: "applicant" | "employer") => {
    if (role === "employer") {
      setLocation("/employer/signup");
    } else {
      localStorage.setItem("intended_role", role);
      window.location.href = "/api/login";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2"
          >
            <img src={iseyaLogo} alt="Iṣéyá" className="h-8 w-auto" />
          </motion.div>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="bg-muted rounded-full p-1 flex">
              <button
                onClick={() => setActiveMode("seeker")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeMode === "seeker" 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="nav-toggle-seeker"
              >
                Job Seeker
              </button>
              <button
                onClick={() => setActiveMode("employer")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeMode === "employer" 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="nav-toggle-employer"
              >
                Hire Talent
              </button>
            </div>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 px-4 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50" 
        />
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto text-center relative z-10"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-foreground font-bold text-sm mb-8"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Safe & Secure Job Marketplace</span>
          </motion.div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeMode === "seeker" ? (
                <>
                  <h1 className="text-5xl md:text-7xl font-display font-extrabold text-foreground tracking-tight mb-6 text-balance leading-[1.1]">
                    Find Your Next <span className="text-primary italic">Casual Job</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 text-balance leading-relaxed">
                    Discover flexible work opportunities near you. No CV required, just your skills and availability.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-5xl md:text-7xl font-display font-extrabold text-foreground tracking-tight mb-6 text-balance leading-[1.1]">
                    Hire <span className="text-primary italic">Reliable Talent</span> Fast
                  </h1>
                  <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 text-balance leading-relaxed">
                    Post jobs and get qualified applicants within hours. Build your workforce effortlessly.
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Role Selection Cards */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveMode("seeker")}
              className={`flex items-center gap-4 p-6 rounded-2xl min-w-[260px] transition-all ${
                activeMode === "seeker" 
                  ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/40 ring-4 ring-primary/20" 
                  : "bg-card border-2 border-border hover:border-primary/30"
              }`}
              data-testid="card-seeker"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                activeMode === "seeker" ? "bg-white/20" : "bg-primary/10"
              }`}>
                <Search className={`w-7 h-7 ${activeMode === "seeker" ? "" : "text-primary"}`} />
              </div>
              <div className="text-left">
                <span className="text-lg font-bold block">Seek for Job</span>
                <span className={`text-sm ${activeMode === "seeker" ? "opacity-80" : "text-muted-foreground"}`}>
                  Find work opportunities
                </span>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveMode("employer")}
              className={`flex items-center gap-4 p-6 rounded-2xl min-w-[260px] transition-all ${
                activeMode === "employer" 
                  ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/40 ring-4 ring-primary/20" 
                  : "bg-card border-2 border-border hover:border-primary/30"
              }`}
              data-testid="card-employer"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                activeMode === "employer" ? "bg-white/20" : "bg-primary/10"
              }`}>
                <Building2 className={`w-7 h-7 ${activeMode === "employer" ? "" : "text-primary"}`} />
              </div>
              <div className="text-left">
                <span className="text-lg font-bold block">Hire Talent</span>
                <span className={`text-sm ${activeMode === "employer" ? "opacity-80" : "text-muted-foreground"}`}>
                  Post jobs & hire workers
                </span>
              </div>
            </motion.button>
          </motion.div>

          {/* Login/Signup Section */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`auth-${activeMode}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mt-10"
            >
              <Card className="max-w-md mx-auto border-2 border-primary/20 shadow-xl rounded-3xl overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-primary to-accent" />
                <CardContent className="p-8 space-y-6">
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                      activeMode === "seeker" ? "bg-primary/10" : "bg-accent/10"
                    }`}>
                      {activeMode === "seeker" ? (
                        <Search className="w-8 h-8 text-primary" />
                      ) : (
                        <Building2 className="w-8 h-8 text-accent" />
                      )}
                    </div>
                    <h3 className="text-2xl font-display font-bold">
                      {activeMode === "seeker" ? "Start Finding Jobs" : "Start Hiring Today"}
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      {activeMode === "seeker" 
                        ? "Create your job seeker profile and apply to jobs" 
                        : "Create your employer account and post your first job"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={() => handleLogin(activeMode === "seeker" ? "applicant" : "employer")}
                      className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 group"
                      data-testid={`button-login-${activeMode}`}
                    >
                      Login
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    
                    <Button 
                      onClick={() => handleSignup(activeMode === "seeker" ? "applicant" : "employer")}
                      variant="outline"
                      className="w-full h-12 text-base font-bold rounded-xl"
                      data-testid={`button-signup-${activeMode}`}
                    >
                      Create Account
                    </Button>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y bg-muted/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Active Jobs", value: "2.5k+" },
              { label: "Workers", value: "10k+" },
              { label: "Cities", value: "50+" },
              { label: "Rating", value: "4.9/5" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Built for Modern Work</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Everything you need to find or list casual work in minutes.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8 text-primary" />,
                title: "Instant Matching",
                desc: "Our algorithm finds the best jobs near you instantly. No more endless searching."
              },
              {
                icon: <Globe className="w-8 h-8 text-accent" />,
                title: "Local Focus",
                desc: "Find work right in your neighborhood. Support local businesses and save on commute."
              },
              {
                icon: <Star className="w-8 h-8 text-yellow-500" />,
                title: "Verified Trust",
                desc: "Every user goes through a verification process to ensure a safe community for all."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -10 }}
                className="bg-card p-10 rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Section */}
      <section className="py-32 bg-primary/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">Ready to jump in?</h2>
              <div className="space-y-6">
                {[
                  "No resumes required",
                  "Chat directly with employers",
                  "Flexible working hours",
                  "Weekly payment guarantee",
                  "16+ Age protected community"
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-colors">
                      <CheckCircle2 className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-xl font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-accent/30 rounded-3xl blur-2xl -z-10 animate-pulse" />
              <img 
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1000" 
                alt="Diverse team collaborating" 
                className="rounded-3xl shadow-2xl border-4 border-white dark:border-gray-800"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={iseyaLogo} alt="Iṣéyá" className="h-6 w-auto" />
          </div>
          <p className="text-muted-foreground">© 2026 Iṣéyá. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
