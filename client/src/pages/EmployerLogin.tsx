import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Briefcase, Building2, Users, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import iseyaLogo from "@assets/Iseya_1770116961793.png";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function EmployerLogin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const handleEmployerLogin = () => {
    localStorage.setItem("intended_role", "employer");
    if (isAuthenticated) {
      if (user && user.role !== "employer") {
        window.location.href = "/api/logout";
        return;
      }
      setLocation("/dashboard");
      return;
    }
    window.location.href = "/api/login";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 font-sans">
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

      <div className="pt-24 pb-16 px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm">
                <Building2 className="w-4 h-4" />
                <span>For Employers</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-display font-extrabold text-foreground tracking-tight leading-tight">
                Hire Reliable <span className="text-primary">Talent</span> Fast
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Post jobs, review applicants, and find the perfect match for your business. No lengthy processes, just quick and efficient hiring.
              </p>

              <div className="space-y-4">
                {[
                  "Post unlimited job listings",
                  "Access verified worker profiles",
                  "Direct messaging with applicants",
                  "Track applications in real-time",
                  "Pay only when you hire"
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-2 border-primary/20 shadow-2xl shadow-primary/10 rounded-3xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                <CardHeader className="text-center pt-10 pb-6">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                    <Building2 className="w-10 h-10 text-primary" />
                  </div>
                  <CardTitle className="text-3xl font-display font-bold">Employer Portal</CardTitle>
                  <CardDescription className="text-lg">
                    Sign in or create your employer account
                  </CardDescription>
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

                  <div className="pt-6 border-t">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">500+</div>
                        <div className="text-xs text-muted-foreground font-medium uppercase">Employers</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">10k+</div>
                        <div className="text-xs text-muted-foreground font-medium uppercase">Workers</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">95%</div>
                        <div className="text-xs text-muted-foreground font-medium uppercase">Success</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div 
            variants={itemVariants}
            className="mt-20 grid md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: <Users className="w-8 h-8" />,
                title: "Large Talent Pool",
                desc: "Access thousands of verified workers ready to start"
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Quick Turnaround",
                desc: "Most jobs get quality applications within 24 hours"
              },
              {
                icon: <Briefcase className="w-8 h-8" />,
                title: "Flexible Hiring",
                desc: "Hire for a day, a week, or ongoing positions"
              }
            ].map((feature, i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
