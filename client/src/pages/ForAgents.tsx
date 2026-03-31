import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import {
  Briefcase, Users, Shield, ArrowRight, CheckCircle2,
  CreditCard, Crown, Building2, Handshake, FileText,
  Zap, Star, BarChart3, Clock, Play,
} from "lucide-react";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";

const features = [
  {
    icon: Handshake,
    title: "Post on Behalf of Clients",
    description: "Post jobs for your employer clients. Add their business name and manage listings from your agent dashboard.",
  },
  {
    icon: CreditCard,
    title: "Flexible Payment Options",
    description: "Pay per post with credits or subscribe for unlimited posting. Choose what works for your agency.",
  },
  {
    icon: Users,
    title: "Access Verified Talent",
    description: "Browse our pool of identity-verified workers. Help your clients find the right candidates faster.",
  },
  {
    icon: BarChart3,
    title: "Track Your Postings",
    description: "Monitor all jobs you've posted, view applicant counts, and manage listings from a single dashboard.",
  },
  {
    icon: Crown,
    title: "Subscription Tiers",
    description: "Upgrade to Standard, Premium, or Enterprise for higher posting limits, priority support, and advanced features.",
  },
  {
    icon: Shield,
    title: "Trusted Platform",
    description: "All applicants are verified. Your clients get access to background-checked, rated candidates.",
  },
];

const howItWorks = [
  { step: "1", title: "Register as Agent", description: "Sign up and select the Agent role. Add your agency name, state, and contact details." },
  { step: "2", title: "Set Up Your Account", description: "Choose a subscription plan or buy pay-per-post credits. Free agents get limited credits to start." },
  { step: "3", title: "Post Jobs for Clients", description: "Create job listings on behalf of your employer clients. Specify company name, role, and location." },
  { step: "4", title: "Manage & Deliver", description: "Track applications, share candidate profiles with clients, and help close placements." },
];

const benefits = [
  "Post jobs on behalf of multiple employers",
  "Pay-per-post or subscribe for bulk posting",
  "Dashboard to manage all your job listings",
  "Access to verified worker profiles",
  "Subscription tiers with increasing limits",
  "Dedicated support for agencies",
  "Track credits and posting history",
  "Grow your recruitment business",
];

export default function ForAgents() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <img src={iseyaLogo} alt="Iseya" className="h-8 w-auto cursor-pointer" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" data-testid="button-agent-login">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" data-testid="button-agent-signup">Become an Agent</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-28 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-primary/5" />
        <div className="max-w-5xl mx-auto px-4 text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-6 px-4 py-1.5 text-sm bg-teal-500/10 text-teal-700 border-teal-500/20 dark:text-teal-400" data-testid="badge-agent-hero">
              <Briefcase className="w-3.5 h-3.5 mr-1.5" /> For Recruitment Agents
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
              Grow Your Recruitment <br className="hidden md:block" />
              <span className="text-primary">Business with Iṣéyá</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Post jobs on behalf of your employer clients, access verified talent, and scale your agency — all on one platform.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="font-bold px-8 gap-2 group" data-testid="button-agent-start">
                  Register as Agent
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/browse-jobs">
                <Button size="lg" variant="outline" className="font-medium gap-2" data-testid="button-agent-browse">
                  See Current Jobs
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <Badge className="mb-4 px-3 py-1 text-xs bg-teal-500/10 text-teal-700 border-teal-500/20 dark:text-teal-400">
              <Play className="w-3 h-3 mr-1" /> Watch Video
            </Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">See How Iṣéyá Works for Agents</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Watch this short video to learn how you can earn money as a recruitment agent.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative rounded-2xl overflow-hidden shadow-2xl border bg-black aspect-video" data-testid="video-agent">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/VIDEO_ID_HERE"
              title="How Iṣéyá works for agents"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Built for Recruitment Agencies</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Tools designed to help you manage job postings across multiple clients.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Card className="h-full hover:shadow-md transition-shadow" data-testid={`card-agent-feature-${i}`}>
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4">
                      <f.icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
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
            <p className="text-muted-foreground">Get started in 4 steps</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6">
            {howItWorks.map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center" data-testid={`step-agent-${s.step}`}>
                <div className="w-14 h-14 rounded-full bg-teal-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">{s.step}</div>
                <h3 className="font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Agent Benefits</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <motion.div key={b} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 p-4 rounded-xl border bg-card" data-testid={`benefit-agent-${i}`}>
                <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                <span className="text-sm font-medium">{b}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to Become an Agent?</h2>
            <p className="text-teal-100 mb-8 text-lg">Join Iṣéyá as a recruitment agent and start posting jobs for your clients today.</p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="font-bold px-10 gap-2 group text-teal-700" data-testid="button-agent-bottom-cta">
                Register Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
