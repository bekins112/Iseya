import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Building2, ChevronDown, UserCheck, Menu, X } from "lucide-react";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src={iseyaLogo} alt="Iseya" className="h-8 w-auto" data-testid="img-logo" />
        </Link>
        <div className="flex items-center gap-4">
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
                    <Link href="/for-applicants" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors" data-testid="link-for-applicants">
                      <UserCheck className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-medium">For Job Seekers</div>
                        <div className="text-xs text-muted-foreground">Find jobs near you</div>
                      </div>
                    </Link>
                    <Link href="/for-employers" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors" data-testid="link-for-employers">
                      <Building2 className="w-4 h-4 text-primary" />
                      <div>
                        <div className="font-medium">For Employers</div>
                        <div className="text-xs text-muted-foreground">Hire workers fast</div>
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
            <div className="relative" onMouseEnter={() => setCompanyOpen(true)} onMouseLeave={() => setCompanyOpen(false)}>
              <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="button-company-dropdown">
                Company <ChevronDown className={`w-3.5 h-3.5 transition-transform ${companyOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {companyOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-card border rounded-xl shadow-lg overflow-hidden z-50"
                  >
                    <Link href="/about" className="block px-4 py-3 text-sm font-medium hover:bg-muted transition-colors" data-testid="link-about">
                      About Us
                    </Link>
                    <Link href="/faqs" className="block px-4 py-3 text-sm font-medium hover:bg-muted transition-colors" data-testid="link-faqs">
                      FAQs
                    </Link>
                    <Link href="/contact" className="block px-4 py-3 text-sm font-medium hover:bg-muted transition-colors" data-testid="link-contact">
                      Contact
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
        </div>
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
              <p className="px-3 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Discover</p>
              <Link href="/for-applicants" className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-for-applicants">For Job Seekers</Link>
              <Link href="/for-employers" className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-for-employers">For Employers</Link>
              <Link href="/for-agents" className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-for-agents">For Agents</Link>
              <p className="px-3 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Company</p>
              <Link href="/about" className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-about">About Us</Link>
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
  );
}
