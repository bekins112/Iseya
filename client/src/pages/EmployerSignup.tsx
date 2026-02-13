import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ArrowRight, ArrowLeft, CheckCircle2, Users, Briefcase, Mail, Phone, MapPin } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function EmployerSignup() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users appropriately
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "employer" && user.age) {
        setLocation("/dashboard");
      } else {
        // User doesn't have employer role yet (new user OR role switch)
        localStorage.setItem("intended_role", "employer");
        setLocation("/onboarding");
      }
    }
  }, [isAuthenticated, user, setLocation]);

  // Show loading while checking auth
  if (isLoading || (isAuthenticated && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSignup = () => {
    localStorage.setItem("intended_role", "employer");
    window.location.href = "/api/login";
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
          <Link href="/">
            <Button variant="ghost" className="font-medium gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid lg:grid-cols-2 gap-12 items-start"
          >
            {/* Left Column - Form */}
            <motion.div variants={item}>
              <Card className="border-2 border-primary/20 shadow-2xl rounded-3xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                <CardHeader className="text-center pt-8 pb-4">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-display font-bold">Create Employer Account</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Start hiring talented workers today
                  </p>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          placeholder="John"
                          className="h-12 rounded-xl"
                          data-testid="input-first-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          placeholder="Doe"
                          className="h-12 rounded-xl"
                          data-testid="input-last-name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company / Business Name</Label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input 
                          id="companyName" 
                          placeholder="Your Business Name"
                          className="h-12 rounded-xl pl-12"
                          data-testid="input-company-name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input 
                          id="email" 
                          type="email"
                          placeholder="you@company.com"
                          className="h-12 rounded-xl pl-12"
                          data-testid="input-email"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input 
                          id="phone" 
                          type="tel"
                          placeholder="+234 XXX XXX XXXX"
                          className="h-12 rounded-xl pl-12"
                          data-testid="input-phone"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Business Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input 
                          id="location" 
                          placeholder="Lagos, Nigeria"
                          className="h-12 rounded-xl pl-12"
                          data-testid="input-location"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSignup}
                    className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 group"
                    data-testid="button-create-employer-account"
                  >
                    Create Employer Account
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Link href="/">
                        <span className="text-primary font-semibold hover:underline cursor-pointer">
                          Login here
                        </span>
                      </Link>
                    </p>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    By creating an account, you agree to our Terms of Service and Privacy Policy
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Benefits */}
            <motion.div variants={item} className="space-y-8">
              <div>
                <h2 className="text-3xl font-display font-bold mb-4">
                  Why hire on Iṣéyá?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Join thousands of employers finding reliable workers every day
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { 
                    icon: <Users className="w-6 h-6" />, 
                    title: "Access to 10,000+ Workers", 
                    desc: "Browse verified profiles of job seekers ready to work" 
                  },
                  { 
                    icon: <Briefcase className="w-6 h-6" />, 
                    title: "Post Unlimited Jobs", 
                    desc: "Create as many job listings as you need, no restrictions" 
                  },
                  { 
                    icon: <CheckCircle2 className="w-6 h-6" />, 
                    title: "Quick Response Time", 
                    desc: "Get applications within hours, not days" 
                  },
                  { 
                    icon: <Building2 className="w-6 h-6" />, 
                    title: "Verified Business Profile", 
                    desc: "Build trust with a verified employer badge" 
                  },
                ].map((benefit, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-card border hover:border-primary/30 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                      {benefit.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{benefit.title}</h4>
                      <p className="text-muted-foreground">{benefit.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-display font-bold text-primary">₦0</div>
                    <div>
                      <p className="font-bold">Free to get started</p>
                      <p className="text-sm text-muted-foreground">No hidden fees, pay only for premium features</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
