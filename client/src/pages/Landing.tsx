import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Briefcase, ArrowRight, CheckCircle2, Star, Zap, Globe, Search, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";
import workersImage from "@assets/file_0000000006b4722f93fd48732a248e00_1770125859585.png";

const bannerSlides = [
  {
    id: 1,
    title: "Find Your Perfect Job",
    subtitle: "Thousands of opportunities waiting for you",
    gradient: "from-primary/90 to-amber-600/90",
  },
  {
    id: 2,
    title: "Hire Reliable Workers",
    subtitle: "Connect with skilled candidates instantly",
    gradient: "from-amber-600/90 to-yellow-500/90",
  },
  {
    id: 3,
    title: "Flexible Work, Your Schedule",
    subtitle: "Part-time, full-time, or temporary - you choose",
    gradient: "from-yellow-600/90 to-primary/90",
  },
];

export default function Landing() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (user.role && user.age) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, user, setLocation]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2"
          >
            <img src={iseyaLogo} alt="Iseya" className="h-8 w-auto" data-testid="img-logo" />
          </motion.div>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-4"
          >
            <div className="hidden md:flex items-center gap-4">
              <Link href="/browse-jobs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-browse-jobs">
                Browse Jobs
              </Link>
              <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-about">
                About
              </Link>
              <Link href="/faqs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-faqs">
                FAQs
              </Link>
              <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-contact">
                Contact
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="font-medium" data-testid="button-nav-login">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="font-medium" data-testid="button-nav-register">
                  Sign Up
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </nav>

      <section className="relative pt-16 overflow-hidden">
        <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className={`absolute inset-0 bg-gradient-to-r ${bannerSlides[currentSlide].gradient}`}
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAtMThjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
              <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4 drop-shadow-lg"
                >
                  {bannerSlides[currentSlide].title}
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl drop-shadow"
                >
                  {bannerSlides[currentSlide].subtitle}
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6"
                >
                  <Link href="/browse-jobs">
                    <Button size="lg" variant="secondary" className="font-semibold shadow-lg" data-testid="button-banner-browse">
                      Browse Jobs
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors backdrop-blur-sm"
            aria-label="Previous slide"
            data-testid="button-banner-prev"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors backdrop-blur-sm"
            aria-label="Next slide"
            data-testid="button-banner-next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {bannerSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentSlide === index
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
                data-testid={`button-banner-dot-${index}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="relative pt-16 pb-20 lg:pt-20 lg:pb-28 px-4 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50"
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto text-center relative z-10"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-display font-extrabold text-foreground tracking-tight mb-6 text-balance leading-[1.1]"
          >
            Start Finding <span className="text-primary italic">Jobs</span> Today
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 text-balance leading-relaxed"
          >
            Discover flexible work opportunities near you. No CV required, just your skills and availability.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
          >
            <Link href="/register">
              <Button size="lg" className="text-lg font-bold px-8 shadow-lg shadow-primary/20 group" data-testid="button-hero-register">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/browse-jobs">
              <Button size="lg" variant="outline" className="text-lg font-bold px-8" data-testid="button-hero-browse">
                <Search className="mr-2 w-5 h-5" />
                Browse Jobs
              </Button>
            </Link>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mt-4 text-sm text-muted-foreground"
          >
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline" data-testid="link-hero-login">
              Sign in here
            </Link>
          </motion.p>
        </motion.div>
      </section>

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
                className="bg-card p-10 rounded-3xl border shadow-sm group"
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

      <section className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 mx-auto bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
              <Building2 className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Looking to Hire?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Post jobs and find reliable workers fast. Create an employer account and start hiring within minutes.
            </p>
            <Link href="/register">
              <Button size="lg" className="font-bold px-8 group" data-testid="button-employer-cta">
                Create Employer Account
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-32 relative overflow-hidden">
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
              <div className="mt-10">
                <Link href="/register">
                  <Button size="lg" className="font-bold group" data-testid="button-bottom-register">
                    Create Free Account
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
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
                src={workersImage}
                alt="Nigerian casual workers - construction, hospitality, waitstaff, and cleaning professionals"
                className="rounded-3xl shadow-2xl border-4 border-white dark:border-gray-800"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src={iseyaLogo} alt="Iseya" className="h-8 w-auto" />
              </div>
              <p className="text-muted-foreground text-sm max-w-md">
                Connecting Nigerian workers with opportunities. Find casual jobs or hire reliable workers through our trusted platform.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/browse-jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Browse Jobs</Link></li>
                <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link href="/faqs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQs</Link></li>
                <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Get Started</h4>
              <ul className="space-y-2">
                <li><Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Create Account</Link></li>
                <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link></li>
                <li><Link href="/browse-jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Find Work</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">2026 Iseya. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link href="/faqs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQs</Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
