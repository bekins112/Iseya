import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Briefcase, ArrowRight, CheckCircle2, Star, Zap, Globe, Search, Building2, ChevronLeft, ChevronRight, Quote, UserPlus, FileSearch, Send, Handshake, ClipboardList, Users, BadgeCheck, MapPin, Clock, Calendar, ChevronDown, UserCheck, Menu, X, CreditCard } from "lucide-react";
import { SiInstagram, SiLinkedin, SiX, SiFacebook, SiTiktok } from "react-icons/si";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@shared/routes";
import type { Job } from "@shared/schema";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";
import workersImage from "@assets/file_0000000006b4722f93fd48732a248e00_1770125859585.png";
import bannerImg1 from "@assets/file_00000000290071f4a0ad1bcee632895e_(1)_1770976988086.png";
import bannerImg2 from "@assets/file_00000000290071f4a0ad1bcee632895e_1770976988300.png";
import bannerImg3 from "@assets/file_00000000290071f4a0ad1bcee632895e_(2)_1770976988376.png";
import NewsletterBar from "@/components/NewsletterBar";
import PageAds from "@/components/PageAds";

const bannerSlides = [
  {
    id: 1,
    title: "Find Your Perfect Job",
    subtitle: "Thousands of opportunities waiting for you",
    image: bannerImg1,
  },
  {
    id: 2,
    title: "Hire Reliable Workers",
    subtitle: "Connect with skilled candidates instantly",
    image: bannerImg2,
  },
  {
    id: 3,
    title: "Flexible Work, Your Schedule",
    subtitle: "Part-time, full-time, or temporary - you choose",
    image: bannerImg3,
  },
];

const testimonials = [
  {
    name: "Adewale Ogundimu",
    role: "Delivery Rider, Lagos",
    quote: "I found three delivery gigs within my first week on Iseya. The platform is so easy to use, and I love that I can pick jobs that fit my schedule.",
    rating: 5,
  },
  {
    name: "Chidinma Eze",
    role: "Restaurant Owner, Abuja",
    quote: "As a business owner, finding reliable part-time staff used to be a headache. With Iseya, I post a job and get qualified applicants within hours. It has saved me so much time.",
    rating: 5,
  },
  {
    name: "Tunde Bakare",
    role: "Event Staff, Port Harcourt",
    quote: "Iseya connected me with event companies I never knew existed in my area. I now work weekends at events and earn extra income to support my family.",
    rating: 4,
  },
  {
    name: "Funke Adeyemi",
    role: "Hotel Manager, Lagos",
    quote: "We hire temporary housekeeping staff through Iseya regularly. The workers are vetted and reliable. Our go-to platform for casual hires.",
    rating: 5,
  },
  {
    name: "Ibrahim Musa",
    role: "Cleaner, Kano",
    quote: "No CV needed, just my skills. I registered, applied, and got my first cleaning job the same day. Iseya is a game changer for people like me.",
    rating: 5,
  },
  {
    name: "Blessing Okafor",
    role: "Catering Business, Enugu",
    quote: "I use Iseya to find waiters and kitchen assistants whenever I have a big catering order. The subscription plan is affordable and worth every naira.",
    rating: 4,
  },
];

const landingCategories = [
  "Waiter / Waitress",
  "Cleaner / Janitor",
  "Cook",
  "Driver (Casual)",
  "Security Guard",
  "Sales Assistant / Attendant",
  "Nanny / Caregiver",
  "Factory Worker / Casual Labourer",
  "Receptionist",
  "Other",
];

const landingLocations = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
  "Kano",
  "Kaduna",
  "Benin City",
  "Enugu",
  "Other",
];

const landingJobTypes = ["full-time", "part-time", "contract", "temporary"];

function formatTimeAgo(date: Date | string | null | undefined): string {
  if (!date) return "Recently";
  const now = new Date();
  const posted = new Date(date);
  const diffMs = now.getTime() - posted.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}

function TestimonialsCarousel({ testimonialIndex, setTestimonialIndex }: { testimonialIndex: number; setTestimonialIndex: (v: number | ((p: number) => number)) => void }) {
  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((prev: number) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [setTestimonialIndex]);

  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">What Our Members Say</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Real stories from workers and employers who found success on Iseya.</p>
        </motion.div>

        <div className="relative">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="grid md:grid-cols-2 gap-8"
              >
                {[0, 1].map((offset) => {
                  const idx = (testimonialIndex + offset) % testimonials.length;
                  const testimonial = testimonials[idx];
                  return (
                    <div
                      key={idx}
                      className="bg-card p-8 rounded-md border shadow-sm relative"
                      data-testid={`card-testimonial-${idx}`}
                    >
                      <Quote className="w-8 h-8 text-primary/20 absolute top-6 right-6" />
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${s < testimonial.rating ? "text-primary fill-primary" : "text-muted-foreground/30"}`}
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground leading-relaxed mb-6">"{testimonial.quote}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {testimonial.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <div className="font-semibold text-sm" data-testid={`text-testimonial-name-${idx}`}>{testimonial.name}</div>
                          <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={() => setTestimonialIndex((prev: number) => (prev - 1 + testimonials.length) % testimonials.length)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 p-2 rounded-full bg-card border shadow-sm text-foreground transition-colors"
            aria-label="Previous testimonial"
            data-testid="button-testimonial-prev"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTestimonialIndex((prev: number) => (prev + 1) % testimonials.length)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 p-2 rounded-full bg-card border shadow-sm text-foreground transition-colors"
            aria-label="Next testimonial"
            data-testid="button-testimonial-next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setTestimonialIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                testimonialIndex === i ? "bg-primary w-6" : "bg-muted-foreground/30"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
              data-testid={`button-testimonial-dot-${i}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [howItWorksTab, setHowItWorksTab] = useState<"seeker" | "employer">("seeker");
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterJobType, setFilterJobType] = useState("");
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: appSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings/public"],
  });

  const activeFilters = Object.fromEntries(
    Object.entries({ category: filterCategory, location: filterLocation, jobType: filterJobType })
      .filter(([_, v]) => v !== "" && v !== "all")
  );

  const { data: recentJobs, isLoading: isJobsLoading } = useQuery<(Job & { employerName?: string; employerLogo?: string | null })[]>({
    queryKey: [api.jobs.list.path, activeFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeFilters.category) params.append("category", activeFilters.category);
      if (activeFilters.location) params.append("location", activeFilters.location);
      if (activeFilters.jobType) params.append("jobType", activeFilters.jobType);
      const url = params.toString() ? `${api.jobs.list.path}?${params}` : api.jobs.list.path;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    },
  });

  const displayedJobs = (recentJobs || [])
    .filter((job) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        job.title?.toLowerCase().includes(q) ||
        job.category?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q) ||
        (job as any).employerName?.toLowerCase().includes(q)
      );
    })
    .slice(0, 6);

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
              <div className="relative" onMouseEnter={() => setDiscoverOpen(true)} onMouseLeave={() => setDiscoverOpen(false)}>
                <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="button-discover-dropdown">
                  Discover <ChevronDown className={`w-3.5 h-3.5 transition-transform ${discoverOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {discoverOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-card border rounded-xl shadow-lg overflow-hidden z-50"
                    >
                      <Link href="/for-employers" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors" data-testid="link-for-employers">
                        <Building2 className="w-4 h-4 text-primary" />
                        <div>
                          <div className="font-medium">For Employers</div>
                          <div className="text-xs text-muted-foreground">Hire workers fast</div>
                        </div>
                      </Link>
                      <Link href="/for-applicants" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors" data-testid="link-for-applicants">
                        <UserCheck className="w-4 h-4 text-green-600" />
                        <div>
                          <div className="font-medium">For Job Seekers</div>
                          <div className="text-xs text-muted-foreground">Find jobs near you</div>
                        </div>
                      </Link>
                      <Link href="/for-agents" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors" data-testid="link-for-agents">
                        <Briefcase className="w-4 h-4 text-teal-600" />
                        <div>
                          <div className="font-medium">For Agents</div>
                          <div className="text-xs text-muted-foreground">Recruit for clients</div>
                        </div>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
              <button className="md:hidden p-2 text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="button-mobile-menu">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" className="font-medium" data-testid="button-nav-dashboard">
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" className="font-medium hidden sm:inline-flex" onClick={() => logout()} data-testid="button-nav-logout">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="font-medium hidden sm:inline-flex" data-testid="button-nav-login">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="font-medium" data-testid="button-nav-register">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t bg-background overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                <Link href="/browse-jobs" className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-browse-jobs">Browse Jobs</Link>
                <Link href="/for-employers" className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-for-employers">For Employers</Link>
                <Link href="/for-applicants" className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-for-applicants">For Job Seekers</Link>
                <Link href="/for-agents" className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-for-agents">For Agents</Link>
                <Link href="/about" className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-about">About</Link>
                <Link href="/faqs" className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-faqs">FAQs</Link>
                <Link href="/contact" className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-contact">Contact</Link>
                {!isAuthenticated && (
                  <Link href="/login" className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-login">Login</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
              className="absolute inset-0"
            >
              <img
                src={bannerSlides[currentSlide].image}
                alt={bannerSlides[currentSlide].title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <PageAds page="landing" />
      </div>

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
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="text-lg font-bold px-8 shadow-lg shadow-primary/20 group" data-testid="button-hero-dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button size="lg" className="text-lg font-bold px-8 shadow-lg shadow-primary/20 group" data-testid="button-hero-register">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            )}
            <Link href="/browse-jobs">
              <Button size="lg" variant="outline" className="text-lg font-bold px-8" data-testid="button-hero-browse">
                <Search className="mr-2 w-5 h-5" />
                Browse Jobs
              </Button>
            </Link>
          </motion.div>

          {!isAuthenticated && (
            <motion.p
              variants={itemVariants}
              className="mt-4 text-sm text-muted-foreground"
            >
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline" data-testid="link-hero-login">
                Sign in here
              </Link>
            </motion.p>
          )}
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

      <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3" data-testid="text-search-heading">Find Jobs That Match You</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Search and filter through available opportunities near you.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border rounded-2xl p-4 md:p-6 shadow-sm mb-10"
            data-testid="container-job-filters"
          >
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs, categories, companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-landing-search"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-landing-category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {landingCategories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="w-full md:w-40" data-testid="select-landing-location">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {landingLocations.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterJobType} onValueChange={setFilterJobType}>
                <SelectTrigger className="w-full md:w-40" data-testid="select-landing-jobtype">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {landingJobTypes.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(filterCategory || filterLocation || filterJobType || searchQuery) && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-xs text-muted-foreground">Filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => setSearchQuery("")} data-testid="badge-filter-search">
                    "{searchQuery}" &times;
                  </Badge>
                )}
                {filterCategory && filterCategory !== "all" && (
                  <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => setFilterCategory("")} data-testid="badge-filter-category">
                    {filterCategory} &times;
                  </Badge>
                )}
                {filterLocation && filterLocation !== "all" && (
                  <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => setFilterLocation("")} data-testid="badge-filter-location">
                    {filterLocation} &times;
                  </Badge>
                )}
                {filterJobType && filterJobType !== "all" && (
                  <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => setFilterJobType("")} data-testid="badge-filter-jobtype">
                    {filterJobType} &times;
                  </Badge>
                )}
                <button
                  onClick={() => { setSearchQuery(""); setFilterCategory(""); setFilterLocation(""); setFilterJobType(""); }}
                  className="text-xs text-primary font-medium hover:underline ml-1"
                  data-testid="button-clear-filters"
                >
                  Clear all
                </button>
              </div>
            )}
          </motion.div>

          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl md:text-2xl font-bold" data-testid="text-recent-jobs-heading">
              {searchQuery || filterCategory || filterLocation || filterJobType ? "Matching Jobs" : "Recently Posted Jobs"}
            </h3>
            <Link href="/browse-jobs">
              <Button variant="ghost" size="sm" className="text-primary font-semibold gap-1" data-testid="link-view-all-jobs">
                View All Jobs <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isJobsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card border rounded-xl p-5 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                  <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/3 mb-4" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-muted rounded-full w-16" />
                    <div className="h-5 bg-muted rounded-full w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedJobs.length === 0 ? (
            <div className="text-center py-12 bg-card border rounded-xl" data-testid="text-no-jobs">
              <Briefcase className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No jobs found matching your filters.</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedJobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/jobs/${job.id}`}>
                    <div
                      className="bg-card border rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group h-full"
                      data-testid={`card-recent-job-${job.id}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors" data-testid={`text-job-title-${job.id}`}>
                            {job.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate flex items-center gap-1">
                            <Building2 className="w-3 h-3 flex-shrink-0" />
                            {(job as any).employerName || "Employer"}
                          </p>
                        </div>
                        {(job as any).employerLogo && (
                          <img src={(job as any).employerLogo} alt="" className="w-8 h-8 rounded-md object-cover border ml-2 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{[job.state, job.city].filter(Boolean).join(", ") || job.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.jobType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs mb-3">
                        <span className="font-semibold text-primary">
                          ₦{(job.salaryMin || 0).toLocaleString()}{job.salaryMax ? ` - ₦${job.salaryMax.toLocaleString()}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-[10px] px-2 py-0.5">{job.category}</Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatTimeAgo(job.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/browse-jobs">
              <Button size="lg" variant="outline" className="font-semibold" data-testid="button-browse-all-jobs">
                <Search className="mr-2 w-4 h-4" />
                Browse All Jobs
              </Button>
            </Link>
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

      <section className="py-24 border-y bg-gradient-to-b from-background via-primary/[0.03] to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">Simple & Fast</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Get started in just a few simple steps — whether you're looking for work or hiring.</p>
          </motion.div>

          <div className="flex items-center justify-center mb-14">
            <div className="inline-flex rounded-full bg-muted p-1">
              <button
                onClick={() => setHowItWorksTab("seeker")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${howItWorksTab === "seeker" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                data-testid="button-how-seeker"
              >
                <Search className="w-4 h-4" />
                I'm Looking for Work
              </button>
              <button
                onClick={() => setHowItWorksTab("employer")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${howItWorksTab === "employer" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                data-testid="button-how-employer"
              >
                <Building2 className="w-4 h-4" />
                I'm Hiring
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={howItWorksTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
                {(howItWorksTab === "seeker" ? [
                  {
                    step: 1,
                    icon: <UserPlus className="w-6 h-6" />,
                    title: "Create Your Account",
                    desc: "Sign up for free in under a minute. Set your role as a job seeker, add your age, skills, and location.",
                    color: "from-blue-500/20 to-blue-600/5",
                    iconBg: "bg-blue-500/10 text-blue-600",
                  },
                  {
                    step: 2,
                    icon: <FileSearch className="w-6 h-6" />,
                    title: "Browse Jobs Near You",
                    desc: "Search by category, location, and type. Filter for part-time, full-time, or temporary work that fits your schedule.",
                    color: "from-amber-500/20 to-amber-600/5",
                    iconBg: "bg-amber-500/10 text-amber-600",
                  },
                  {
                    step: 3,
                    icon: <Send className="w-6 h-6" />,
                    title: "Apply Instantly",
                    desc: "Found a job you like? Apply with one tap. No CV needed — just your skills and a short message to the employer.",
                    color: "from-green-500/20 to-green-600/5",
                    iconBg: "bg-green-500/10 text-green-600",
                  },
                  {
                    step: 4,
                    icon: <Handshake className="w-6 h-6" />,
                    title: "Get Hired & Earn",
                    desc: "Employers review your profile and accept your application. Agree on terms, start working, and get paid.",
                    color: "from-purple-500/20 to-purple-600/5",
                    iconBg: "bg-purple-500/10 text-purple-600",
                  },
                ] : [
                  {
                    step: 1,
                    icon: <UserPlus className="w-6 h-6" />,
                    title: "Register Your Business",
                    desc: "Create an employer account with your company name, business category, and location. It only takes a minute.",
                    color: "from-blue-500/20 to-blue-600/5",
                    iconBg: "bg-blue-500/10 text-blue-600",
                  },
                  {
                    step: 2,
                    icon: <ClipboardList className="w-6 h-6" />,
                    title: "Post a Job",
                    desc: "Describe the role, set salary range, location, and requirements. Your listing goes live instantly for job seekers to find.",
                    color: "from-amber-500/20 to-amber-600/5",
                    iconBg: "bg-amber-500/10 text-amber-600",
                  },
                  {
                    step: 3,
                    icon: <Users className="w-6 h-6" />,
                    title: "Review Applicants",
                    desc: "Browse applications as they arrive. View candidate profiles, experience, and verification status to find the right fit.",
                    color: "from-green-500/20 to-green-600/5",
                    iconBg: "bg-green-500/10 text-green-600",
                  },
                  {
                    step: 4,
                    icon: <BadgeCheck className="w-6 h-6" />,
                    title: "Hire & Get Started",
                    desc: "Accept the best candidate, send them an offer, and fill your position quickly and reliably. It's that simple.",
                    color: "from-purple-500/20 to-purple-600/5",
                    iconBg: "bg-purple-500/10 text-purple-600",
                  },
                ]).map((item) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: item.step * 0.1 }}
                    className="relative group"
                    data-testid={`step-${howItWorksTab}-${item.step}`}
                  >
                    <div className={`rounded-2xl border bg-gradient-to-b ${item.color} p-6 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-sm">
                          {item.step}
                        </div>
                        <div className="h-px flex-1 bg-border/60" />
                      </div>
                      <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center mb-4`}>
                        {item.icon}
                      </div>
                      <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-14"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-1">
                    {howItWorksTab === "seeker" ? "Watch: How to Find Jobs on Iṣéyá" : "Watch: How to Hire on Iṣéyá"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {howItWorksTab === "seeker" ? "See how easy it is to find and apply for casual jobs near you." : "See how quickly you can post a job and start receiving applicants."}
                  </p>
                </div>
                <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-xl shadow-black/10 border border-border/40 bg-black aspect-video">
                  <iframe
                    className="w-full h-full"
                    src={howItWorksTab === "seeker"
                      ? "https://www.youtube.com/embed/y_1k2lhK76Q"
                      : "https://www.youtube.com/embed/y_1k2lhK76Q"
                    }
                    title={howItWorksTab === "seeker" ? "Iṣéyá Job Seeker Demo" : "Iṣéyá Employer Demo"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    data-testid={`video-demo-${howItWorksTab}`}
                  />
                </div>
              </motion.div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={howItWorksTab === "seeker" ? "/register" : "/register"}>
                  <Button size="lg" className="gap-2 px-8 shadow-md" data-testid="button-how-get-started">
                    {howItWorksTab === "seeker" ? "Start Finding Jobs" : "Start Hiring Today"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/browse-jobs">
                  <Button size="lg" variant="ghost" className="gap-2 text-muted-foreground" data-testid="button-how-browse">
                    <Search className="w-4 h-4" />
                    Browse Jobs First
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <TestimonialsCarousel testimonialIndex={testimonialIndex} setTestimonialIndex={setTestimonialIndex} />

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
            <Link href={isAuthenticated ? "/dashboard" : "/register"}>
              <Button size="lg" className="font-bold px-8 group" data-testid="button-employer-cta">
                {isAuthenticated ? "Go to Dashboard" : "Create Employer Account"}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-950/30 dark:to-teal-900/20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 px-3 py-1 text-sm bg-teal-500/10 text-teal-700 border-teal-500/20 dark:text-teal-400" data-testid="badge-become-agent">
                <Briefcase className="w-3 h-3 mr-1.5" /> Earn Money on Iṣéyá
              </Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Earn Money as a Recruitment Agent</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Turn your network into income. Join Iṣéyá as an agent, connect employers with verified workers, and earn commission on every successful placement. No office needed — work from anywhere in Nigeria.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Earn commission on every job placement you make",
                  "Build a steady income stream with multiple clients",
                  "No startup capital needed — start earning immediately",
                  "Grow your recruitment business on your own terms",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link href="/for-agents">
                  <Button size="lg" className="font-bold gap-2 group bg-teal-600 hover:bg-teal-700 text-white" data-testid="button-become-agent">
                    Start Earning Today <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="font-medium gap-2" data-testid="button-register-agent">
                    Register as Agent
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: CreditCard, label: "Earn Per Placement", value: "Commission-based" },
                { icon: Handshake, label: "Multiple Clients", value: "Unlimited earning" },
                { icon: Users, label: "Verified Workers", value: "Ready to hire" },
                { icon: Star, label: "Work Anywhere", value: "No office needed" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card p-5 rounded-xl border text-center" data-testid={`stat-agent-${stat.label.toLowerCase().replace(/\s/g, "-")}`}>
                  <stat.icon className="w-8 h-8 text-teal-600 dark:text-teal-400 mx-auto mb-2" />
                  <div className="font-bold text-sm">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
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
                  "Interview Assistant",
                  "24/7 Support",
                  "100% Job Guarantee",
                  "18+ Age protected community"
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
                <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                  <Button size="lg" className="font-bold group" data-testid="button-bottom-register">
                    {isAuthenticated ? "Go to Dashboard" : "Create Free Account"}
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2">
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
              <h4 className="font-bold mb-4">Discover</h4>
              <ul className="space-y-2">
                <li><Link href="/for-employers" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-for-employers">For Employers</Link></li>
                <li><Link href="/for-applicants" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-for-applicants">For Job Seekers</Link></li>
                <li><Link href="/for-agents" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-for-agents">For Agents</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Get Started</h4>
              <ul className="space-y-2">
                {isAuthenticated ? (
                  <>
                    <li><Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link></li>
                    <li><Link href="/browse-jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Find Work</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Create Account</Link></li>
                    <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link></li>
                    <li><Link href="/browse-jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Find Work</Link></li>
                  </>
                )}
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-sm text-muted-foreground">© 2026 Iṣéyá by RenownedTech. All rights reserved.</p>
              <div className="flex items-center gap-3" data-testid="social-links-footer">
                {(appSettings?.app_instagram || "https://instagram.com/iseyaofficial") && (
                  <a href={appSettings?.app_instagram || "https://instagram.com/iseyaofficial"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors" data-testid="link-instagram" aria-label="Instagram">
                    <SiInstagram className="w-4 h-4" />
                  </a>
                )}
                {(appSettings?.app_linkedin || "https://linkedin.com/company/iseyaofficial") && (
                  <a href={appSettings?.app_linkedin || "https://linkedin.com/company/iseyaofficial"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors" data-testid="link-linkedin" aria-label="LinkedIn">
                    <SiLinkedin className="w-4 h-4" />
                  </a>
                )}
                {(appSettings?.app_twitter || "https://x.com/iseyaofficial") && (
                  <a href={appSettings?.app_twitter || "https://x.com/iseyaofficial"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors" data-testid="link-twitter" aria-label="X (Twitter)">
                    <SiX className="w-4 h-4" />
                  </a>
                )}
                {(appSettings?.app_facebook || "https://facebook.com/iseyaofficial") && (
                  <a href={appSettings?.app_facebook || "https://facebook.com/iseyaofficial"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors" data-testid="link-facebook" aria-label="Facebook">
                    <SiFacebook className="w-4 h-4" />
                  </a>
                )}
                {appSettings?.app_tiktok && (
                  <a href={appSettings.app_tiktok} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors" data-testid="link-tiktok" aria-label="TikTok">
                    <SiTiktok className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6 flex-wrap justify-center">
              <Link href="/disclaimer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Disclaimer</Link>
              <Link href="/copyright" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Copyright</Link>
              <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>

      <NewsletterBar />
    </div>
  );
}
