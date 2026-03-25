import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Building2, Briefcase, Users, Search, Shield, Clock,
  Star, ArrowRight, CheckCircle2, Zap, Crown, CreditCard,
  FileText, BarChart3, Bell, MessageSquare,
} from "lucide-react";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";

const features = [
  {
    icon: Briefcase,
    title: "Post Jobs in Minutes",
    description: "Create detailed job listings with category, location, salary range, and requirements. Your posting goes live instantly.",
  },
  {
    icon: Users,
    title: "Access Verified Workers",
    description: "Browse a pool of identity-verified applicants with background checks, rated and recommended by our team.",
  },
  {
    icon: Search,
    title: "Smart Recommendations",
    description: "Premium employers get Iṣéyá Recommendations — AI-scored applicant matches based on skills, experience, and location.",
  },
  {
    icon: Shield,
    title: "Secure & Trusted",
    description: "Every applicant goes through identity verification. View government ID status, ratings, and work history before hiring.",
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    description: "Get instant notifications when candidates apply, and manage all your applicants from a single dashboard.",
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description: "Chat with applicants, schedule interviews, and manage the entire hiring process from your dashboard.",
  },
];

const plans = [
  {
    name: "Free",
    description: "Get started with basic hiring",
    features: ["Post up to 2 jobs", "View applicant profiles", "Basic support"],
    highlight: false,
  },
  {
    name: "Standard",
    description: "For growing businesses",
    features: ["More job postings", "Priority support", "Applicant management tools", "Interview scheduling"],
    highlight: false,
  },
  {
    name: "Premium",
    description: "Most popular for serious hiring",
    features: ["Increased job limits", "Iṣéyá Recommendations", "Interview credits", "Priority listing", "Facebook auto-post"],
    highlight: true,
  },
  {
    name: "Enterprise",
    description: "For large-scale recruitment",
    features: ["Unlimited job postings", "Dedicated support", "All Premium features", "Custom integrations", "Priority everything"],
    highlight: false,
  },
];

const steps = [
  { step: "1", title: "Create Account", description: "Sign up as an employer in under 2 minutes. Add your company details." },
  { step: "2", title: "Post a Job", description: "Describe the role, set salary, location, and requirements." },
  { step: "3", title: "Review Applicants", description: "Browse applications, view profiles, and shortlist candidates." },
  { step: "4", title: "Hire & Manage", description: "Schedule interviews, make offers, and manage your workforce." },
];

export default function ForEmployers() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <img src={iseyaLogo} alt="Iseya" className="h-8 w-auto cursor-pointer" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" data-testid="button-employer-login">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" data-testid="button-employer-signup">Start Hiring</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-28 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
        <div className="max-w-5xl mx-auto px-4 text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-6 px-4 py-1.5 text-sm bg-primary/10 text-primary border-primary/20" data-testid="badge-employer-hero">
              <Building2 className="w-3.5 h-3.5 mr-1.5" /> For Employers
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
              Hire Reliable Workers <br className="hidden md:block" />
              <span className="text-primary">Fast & Easy</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Post jobs, review verified applicants, and build your team in minutes. Iṣéyá connects you with Nigeria's largest pool of casual workers.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="font-bold px-8 gap-2 group" data-testid="button-employer-start">
                  Create Employer Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/browse-jobs">
                <Button size="lg" variant="outline" className="font-medium gap-2" data-testid="button-employer-browse">
                  <Search className="w-4 h-4" /> Browse Jobs
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Everything You Need to Hire</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Powerful tools to find, vet, and manage your casual workforce — all in one platform.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Card className="h-full hover:shadow-md transition-shadow" data-testid={`card-employer-feature-${i}`}>
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <f.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Start hiring in 4 simple steps</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center" data-testid={`step-employer-${s.step}`}>
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">{s.step}</div>
                <h3 className="font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Choose Your Plan</h2>
            <p className="text-muted-foreground">Flexible pricing to match your hiring needs</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p, i) => (
              <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Card className={`h-full relative ${p.highlight ? "border-primary shadow-lg ring-2 ring-primary/20" : ""}`} data-testid={`card-plan-${p.name.toLowerCase()}`}>
                  {p.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3"><Crown className="w-3 h-3 mr-1" /> Most Popular</Badge>
                    </div>
                  )}
                  <CardContent className="p-6 pt-8">
                    <h3 className="font-bold text-xl mb-1">{p.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{p.description}</p>
                    <ul className="space-y-2.5 mb-6">
                      {p.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <Link href="/register">
                      <Button className="w-full" variant={p.highlight ? "default" : "outline"}>Get Started</Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to Start Hiring?</h2>
            <p className="text-muted-foreground mb-8 text-lg">Join thousands of Nigerian businesses finding reliable workers on Iṣéyá.</p>
            <Link href="/register">
              <Button size="lg" className="font-bold px-10 gap-2 group" data-testid="button-employer-bottom-cta">
                Create Free Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2026 Iṣéyá by RenownedTech. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-home">Home</Link>
            <Link href="/for-applicants" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-for-applicants">For Applicants</Link>
            <Link href="/for-agents" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-for-agents">For Agents</Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-about">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
