import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import NewsletterBar from "@/components/NewsletterBar";
import PageAds from "@/components/PageAds";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  SlidersHorizontal, 
  Briefcase, 
  MapPin, 
  Clock, 
  Building2, 
  ChevronRight,
  ChevronLeft,
  Calendar,
  ChevronsLeft,
  ChevronsRight,
  Banknote,
  Send,
  Filter,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@shared/routes";
import type { Job } from "@shared/schema";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { nigerianStates } from "@/lib/nigerian-locations";
import { jobSectors } from "@/lib/job-categories";
import { usePageTitle } from "@/hooks/use-page-title";

const JOBS_PER_PAGE = 12;
const SEGMENT_SIZE = 6;

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
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

const jobTypes = ["Full-time", "Part-time", "Contract", "Remote", "Freelance"];

const jobTypeBadgeColor: Record<string, string> = {
  "Full-time": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "Part-time": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "Contract": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "Remote": "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "Freelance": "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
};

function JobCard({ job, index, formatSalary }: { job: Job; index: number; formatSalary: (min: number, max: number) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <div className="group border rounded-lg bg-card hover:border-primary/40 hover:shadow-md transition-all" data-testid={`card-job-${job.id}`}>
        <Link href={`/jobs/${job.id}`} className="block p-4 sm:p-5">
          <div className="flex gap-4">
            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-base group-hover:text-primary transition-colors truncate" data-testid={`text-job-title-${job.id}`}>
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1 truncate">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      {(job as any).employerName || "Employer"}
                    </span>
                    <span className="text-border hidden sm:inline">|</span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {job.state ? `${job.city ? job.city + ", " : ""}${job.state}` : job.location}
                    </span>
                  </div>
                </div>
                <span className="hidden sm:block font-bold text-primary text-sm shrink-0" data-testid={`text-job-salary-${job.id}`}>
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                {job.description}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${jobTypeBadgeColor[job.jobType] || "bg-muted text-muted-foreground"}`} data-testid={`badge-job-type-${job.id}`}>
                  {job.jobType}
                </span>
                <Badge variant="outline" className="text-[11px] h-5 px-1.5 gap-1 font-normal">
                  {job.category}
                </Badge>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatTimeAgo(job.createdAt)}
                </span>
                <span className="sm:hidden font-bold text-primary text-xs ml-auto" data-testid={`text-job-salary-mobile-${job.id}`}>
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </span>
              </div>
            </div>
          </div>
        </Link>

        <div className="flex items-center justify-between px-4 sm:px-5 pb-3 pt-0">
          <div className="flex items-center gap-2">
            <Banknote className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {job.jobType === "Remote" ? "Remote" : job.state || job.location}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/jobs/${job.id}`}>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" data-testid={`button-view-job-${job.id}`}>
                View Details
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
            <Link href={`/jobs/${job.id}`}>
              <Button size="sm" className="h-8 text-xs gap-1.5" data-testid={`button-apply-job-${job.id}`}>
                <Send className="w-3.5 h-3.5" />
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function BrowseJobs() {
  usePageTitle("Browse Jobs");
  const urlParams = new URLSearchParams(window.location.search);
  const [searchQuery, setSearchQuery] = useState(urlParams.get("q") || "");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    category: "",
    state: "",
    jobType: "",
    salaryRange: "",
  });

  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== "" && v !== "all")
  );

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: [api.jobs.list.path, activeFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeFilters.category) params.append("category", activeFilters.category);
      if (activeFilters.state) params.append("state", activeFilters.state);
      if (activeFilters.jobType) params.append("jobType", activeFilters.jobType);
      const url = params.toString() ? `${api.jobs.list.path}?${params}` : api.jobs.list.path;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    }
  });

  const filteredJobs = useMemo(() => {
    let result = jobs?.filter(job => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        (job.state || "").toLowerCase().includes(query) ||
        (job.city || "").toLowerCase().includes(query) ||
        job.category.toLowerCase().includes(query)
      );
    }) || [];

    if (activeFilters.salaryRange) {
      const [minStr, maxStr] = activeFilters.salaryRange.split("-");
      const min = parseInt(minStr) || 0;
      const max = maxStr === "+" ? Infinity : parseInt(maxStr) || Infinity;
      result = result.filter(job => job.salaryMax >= min && job.salaryMin <= max);
    }

    return result;
  }, [jobs, searchQuery, activeFilters.salaryRange]);

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ category: "", state: "", jobType: "", salaryRange: "" });
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  const formatSalary = (min: number, max: number) => {
    const fmt = (n: number) => {
      if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
      if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}k`;
      return `₦${n}`;
    };
    return `${fmt(min)} – ${fmt(max)}`;
  };

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  const FilterSidebar = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Filter className="w-4 h-4" /> Advanced Filters
        </h3>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={clearFilters} data-testid="button-clear-filters">
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Category</label>
        <Select value={filters.category} onValueChange={(v) => handleFilterChange("category", v)}>
          <SelectTrigger className="h-9 text-sm" data-testid="select-category">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            <SelectItem value="all">All Categories</SelectItem>
            {jobSectors.map((sector) => (
              <SelectGroup key={sector.name}>
                <SelectLabel className="font-bold text-xs text-primary">{sector.name}</SelectLabel>
                {sector.subcategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">State / Location</label>
        <Select value={filters.state} onValueChange={(v) => handleFilterChange("state", v)}>
          <SelectTrigger className="h-9 text-sm" data-testid="select-location">
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {nigerianStates.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Job Type</label>
        <Select value={filters.jobType} onValueChange={(v) => handleFilterChange("jobType", v)}>
          <SelectTrigger className="h-9 text-sm" data-testid="select-job-type">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {jobTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Salary Range</label>
        <Select value={filters.salaryRange} onValueChange={(v) => handleFilterChange("salaryRange", v)}>
          <SelectTrigger className="h-9 text-sm" data-testid="select-salary">
            <SelectValue placeholder="Any Salary" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Salary</SelectItem>
            <SelectItem value="0-50000">Under ₦50k</SelectItem>
            <SelectItem value="50000-100000">₦50k – ₦100k</SelectItem>
            <SelectItem value="100000-200000">₦100k – ₦200k</SelectItem>
            <SelectItem value="200000-500000">₦200k – ₦500k</SelectItem>
            <SelectItem value="500000-1000000">₦500k – ₦1M</SelectItem>
            <SelectItem value="1000000-+">₦1M+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activeFilterCount > 0 && (
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-2">{activeFilterCount} filter(s) active</p>
          <div className="flex flex-wrap gap-1.5">
            {activeFilters.category && (
              <Badge variant="secondary" className="text-[10px] gap-1 pr-1">
                {activeFilters.category}
                <button onClick={() => handleFilterChange("category", "all")} className="ml-0.5 hover:text-destructive"><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {activeFilters.state && (
              <Badge variant="secondary" className="text-[10px] gap-1 pr-1">
                {activeFilters.state}
                <button onClick={() => handleFilterChange("state", "all")} className="ml-0.5 hover:text-destructive"><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {activeFilters.jobType && (
              <Badge variant="secondary" className="text-[10px] gap-1 pr-1">
                {activeFilters.jobType}
                <button onClick={() => handleFilterChange("jobType", "all")} className="ml-0.5 hover:text-destructive"><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {activeFilters.salaryRange && (
              <Badge variant="secondary" className="text-[10px] gap-1 pr-1">
                Salary filter
                <button onClick={() => handleFilterChange("salaryRange", "all")} className="ml-0.5 hover:text-destructive"><X className="w-3 h-3" /></button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-1" data-testid="text-browse-heading">Browse Jobs</h1>
          <p className="text-muted-foreground">
            {isLoading ? "Loading..." : `${filteredJobs.length} job${filteredJobs.length !== 1 ? "s" : ""} available`}
            {totalPages > 1 && !isLoading && ` · Page ${currentPage} of ${totalPages}`}
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by title, skill, or location..." 
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-11 rounded-lg"
              data-testid="input-job-search"
            />
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="h-11 rounded-lg gap-2 font-medium px-5 shrink-0 lg:hidden"
            data-testid="button-toggle-filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {showMobileFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden lg:hidden mb-6"
            >
              <Card className="rounded-lg">
                <CardContent className="p-4">
                  <FilterSidebar />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse border rounded-lg p-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-muted rounded w-2/5" />
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-3 bg-muted rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-6 text-sm">Try adjusting your search or filters</p>
                <Button onClick={clearFilters} variant="outline" size="sm" data-testid="button-reset-search">
                  Reset Search
                </Button>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * JOBS_PER_PAGE + 1}–{Math.min(currentPage * JOBS_PER_PAGE, filteredJobs.length)} of {filteredJobs.length}
                  </p>
                </div>

                {(() => {
                  const segment1 = paginatedJobs.slice(0, SEGMENT_SIZE);
                  const segment2 = paginatedJobs.slice(SEGMENT_SIZE);
                  return (
                    <>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                        {segment1.map((job, index) => (
                          <JobCard key={job.id} job={job} index={index} formatSalary={formatSalary} />
                        ))}
                      </motion.div>

                      {segment2.length > 0 && (
                        <>
                          <div className="my-5">
                            <PageAds page="browse-jobs" position="middle" />
                          </div>

                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                            {segment2.map((job, index) => (
                              <JobCard key={job.id} job={job} index={index + SEGMENT_SIZE} formatSalary={formatSalary} />
                            ))}
                          </motion.div>
                        </>
                      )}
                    </>
                  );
                })()}

                {totalPages > 1 && (
                  <nav className="flex items-center justify-center gap-1 mt-8 pt-6 border-t" aria-label="Pagination" data-testid="pagination">
                    <Button variant="ghost" size="icon" className="h-9 w-9" disabled={currentPage === 1} onClick={() => { setCurrentPage(1); window.scrollTo({ top: 0, behavior: "smooth" }); }} data-testid="button-page-first" aria-label="First page">
                      <ChevronsLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" disabled={currentPage === 1} onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }} data-testid="button-page-prev" aria-label="Previous page">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    {pageNumbers.map((p, i) =>
                      p === "..." ? (
                        <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-muted-foreground text-sm">...</span>
                      ) : (
                        <Button
                          key={p}
                          variant={currentPage === p ? "default" : "ghost"}
                          size="icon"
                          className="h-9 w-9 text-sm"
                          onClick={() => { setCurrentPage(p as number); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          data-testid={`button-page-${p}`}
                          aria-label={`Page ${p}`}
                          aria-current={currentPage === p ? "page" : undefined}
                        >
                          {p}
                        </Button>
                      )
                    )}

                    <Button variant="ghost" size="icon" className="h-9 w-9" disabled={currentPage === totalPages} onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }} data-testid="button-page-next" aria-label="Next page">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" disabled={currentPage === totalPages} onClick={() => { setCurrentPage(totalPages); window.scrollTo({ top: 0, behavior: "smooth" }); }} data-testid="button-page-last" aria-label="Last page">
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </nav>
                )}

                <p className="text-center text-xs text-muted-foreground mt-3">
                  Page {currentPage} of {totalPages}
                </p>
              </>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 text-center"
            >
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-2">Ready to apply?</h3>
                  <p className="text-muted-foreground mb-6">Sign up now to apply for jobs and connect with employers</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/register">
                      <Button size="lg" data-testid="button-signup-cta">
                        Get Started Free
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/for-employers">
                      <Button size="lg" variant="outline" data-testid="button-employer-cta">
                        Post a Job
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <aside className="hidden lg:block w-[280px] shrink-0">
            <div className="sticky top-24 space-y-5">
              <Card>
                <CardContent className="p-4">
                  <FilterSidebar />
                </CardContent>
              </Card>

              <PageAds page="browse-jobs" position="top" />
              <PageAds page="browse-jobs" position="bottom" />
            </div>
          </aside>
        </div>
      </main>

      <Footer />
      <NewsletterBar />
    </div>
  );
}
