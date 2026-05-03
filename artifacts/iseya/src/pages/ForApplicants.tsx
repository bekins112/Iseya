import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import {
  UserCheck, Search, Shield, Clock, Star, ArrowRight,
  CheckCircle2, Zap, BadgeCheck, FileText, MapPin, Briefcase,
  Bell, CreditCard, Camera, Users, Play,
} from "lucide-react";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";
import { usePageTitle } from "@/hooks/use-page-title";

const features = [
  {
    icon: Search,
    title: "Browse Thousands of Jobs",
    description: "Search casual, part-time, and full-time jobs across all 36 states. Filter by category, location, and job type.",
  },
  {
    icon: Zap,
    title: "Apply Instantly",
    description: "One-click applications. No lengthy forms — just tap Apply and your profile does the talking.",
  },
  {
    icon: BadgeCheck,
    title: "Get Verified",
    description: "Submit your government ID for verification. Verified applicants get priority listing and a trusted badge visible to employers.",
  },
  {
    icon: MapPin,
    title: "Jobs Near You",
    description: "Find opportunities in your state and city. Location-based search puts the closest jobs first.",
  },
  {
    icon: Bell,
    title: "Job Alerts",
    description: "Set your preferred categories and job types. Get notified when matching jobs are posted.",
  },
  {
    icon: FileText,
    title: "Build Your Profile",
    description: "Upload your CV, add work history, and showcase your skills. Let employers find you.",
  },
];

const benefits = [
  "No resumes required — your profile is enough",
  "Chat directly with employers",
  "Flexible working hours — you choose",
  "Verified badge for priority applications",
  "Interview scheduling assistance",
  "24/7 support from the Iṣéyá team",
  "18+ age-protected community",
  "100% free to apply",
];

const steps = [
  { step: "1", title: "Sign Up", description: "Create your free account in under 2 minutes. You only need your email and basic info." },
  { step: "2", title: "Complete Profile", description: "Add your location, skills, work history, and upload a profile photo." },
  { step: "3", title: "Browse & Apply", description: "Search jobs by category, state, or city. Apply to as many as you want." },
  { step: "4", title: "Get Hired", description: "Employers review your profile and reach out. Start working on your terms." },
];

export default function ForApplicants() {
  usePageTitle("For Job Seekers");
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-28 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-primary/5" />
        <div className="max-w-5xl mx-auto px-4 text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-6 px-4 py-1.5 text-sm bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400" data-testid="badge-applicant-hero">
              <UserCheck className="w-3.5 h-3.5 mr-1.5" /> For Job Seekers
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
              Find Casual Jobs <br className="hidden md:block" />
              <span className="text-primary">Near You</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Browse thousands of part-time, full-time, and contract jobs across Nigeria. Apply instantly, get verified, and start earning.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="font-bold px-8 gap-2 group" data-testid="button-applicant-start">
                  Create Free Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/browse-jobs">
                <Button size="lg" variant="outline" className="font-medium gap-2" data-testid="button-applicant-browse">
                  <Search className="w-4 h-4" /> Browse Jobs
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <Badge className="mb-4 px-3 py-1 text-xs bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400">
              <Play className="w-3 h-3 mr-1" /> Watch Video
            </Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">See How Iṣéyá Works for Job Seekers</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Watch this short video to learn how to find jobs, apply, and start earning.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative rounded-2xl overflow-hidden shadow-2xl border bg-black aspect-video" data-testid="video-applicant">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/VIDEO_ID_HERE"
              title="How Iṣéyá works for job seekers"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Why Job Seekers Love Iṣéyá</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to find and land your next opportunity.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Card className="h-full hover:shadow-md transition-shadow" data-testid={`card-applicant-feature-${i}`}>
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                      <f.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
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
            <p className="text-muted-foreground">Get started in 4 easy steps</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center" data-testid={`step-applicant-${s.step}`}>
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">{s.step}</div>
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
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">What You Get</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <motion.div key={b} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 p-4 rounded-xl border bg-card" data-testid={`benefit-applicant-${i}`}>
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">{b}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to Find Your Next Job?</h2>
            <p className="text-muted-foreground mb-8 text-lg">Join thousands of Nigerians finding flexible work on Iṣéyá. It's free to sign up.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="font-bold px-10 gap-2 group" data-testid="button-applicant-bottom-cta">
                  Sign Up Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/browse-jobs">
                <Button size="lg" variant="outline" className="font-medium gap-2">
                  <Search className="w-4 h-4" /> Browse Jobs First
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
