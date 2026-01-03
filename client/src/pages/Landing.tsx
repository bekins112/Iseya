import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Briefcase, UserCheck, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (!isLoading && isAuthenticated) {
    setLocation("/dashboard");
    return null;
  }

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">CasualWorker</span>
          </div>
          <Button onClick={handleLogin} variant="default" className="font-semibold">
            Login with Replit
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium mb-8 animate-enter">
            <ShieldCheck className="w-4 h-4" />
            <span>Safe, Verified, & Secure Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-extrabold text-foreground tracking-tight mb-6 animate-enter delay-100 text-balance">
            Find Work. <span className="text-primary">Hire Talent.</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Simply Casual.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-enter delay-200 text-balance">
            Connect directly with employers for waitress, cleaning, assistant, and store-keeping jobs. No complex qualifications needed. 
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-enter delay-300">
            <Button onClick={handleLogin} size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1">
              Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-2">
              Learn How It Works
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Why Choose CasualWorker?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We make finding casual work safe and simple for everyone involved.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <UserCheck className="w-6 h-6 text-primary" />,
                title: "Verified Profiles",
                desc: "Every applicant and employer is verified to ensure safety and trust."
              },
              {
                icon: <Briefcase className="w-6 h-6 text-accent" />,
                title: "Instant Connections",
                desc: "Apply directly and chat with employers. No middlemen, no delays."
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-green-600" />,
                title: "Age Protected",
                desc: "Strict 16+ age requirement. We are committed to ethical employment practices."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-background p-8 rounded-2xl border shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Categories */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Popular Job Categories</h2>
              <div className="space-y-4">
                {["Waitress / Waiter", "House Keeper / Cleaner", "Sales Assistant", "Store Keeper", "Office Assistant"].map((job, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="text-lg font-medium">{job}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              {/* Unsplash image: Busy restaurant waiter */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl transform rotate-3" />
              <img 
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1000" 
                alt="Casual workers in action" 
                className="rounded-2xl shadow-2xl relative z-10 transform -rotate-3 hover:rotate-0 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
