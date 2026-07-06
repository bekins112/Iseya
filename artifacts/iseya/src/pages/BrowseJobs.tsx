import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
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
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api-routes";
import type { Job } from "@/lib/types";
import { jobUrl } from "@/lib/slug-utils";
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

function jobLocationText(job: Job): string {
  return job.state ? `${job.city ? job.city + ", " : ""}${job.state}` : job.location;
}

function JobCard({
  job,
  index,
  formatSalary,
  selected,
  onSelect,
}: {
  job: Job;
  index: number;
  formatSalary: (min: number, max: number) => string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        className={`group cursor-pointer border rounded-xl bg-card transition-all outline-none ${
          selected
            ? "border-primary ring-1 ring-primary shadow-sm lg:bg-primary/[0.03]"
            : "hover:border-primary/40 hover:shadow-md focus-visible:border-primary/60"
        }`}
        data-testid={`card-job-${job.id}`}
        aria-pressed={selected}
      >
        <div className="p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Briefcase className="w-4.5 h-4.5 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold text-[15px] leading-snug group-hover:text-primary transition-colors line-clamp-2"
                data-testid={`text-job-title-${job.id}`}
              >
                {job.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-[13px] text-muted-foreground">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{(job as any).employerName || "Employer"}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-[13px] text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{jobLocationText(job)}</span>
              </div>
            </div>
          </div>

          <p className="text-[13px] text-muted-foreground line-clamp-2 mt-2.5 leading-relaxed">
            {job.description}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${jobTypeBadgeColor[job.jobType] || "bg-muted text-muted-foreground"}`}
              data-testid={`badge-job-type-${job.id}`}
            >
              {job.jobType}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
              <Banknote className="w-3.5 h-3.5" />
              {formatSalary(job.salaryMin, job.salaryMax)}
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(job.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function JobPreviewPanel({
  job,
  formatSalary,
}: {
  job: Job;
  formatSalary: (min: number, max: number) => string;
}) {
  return (
    <div className="border rounded-2xl bg-card overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
      <div className="p-6 border-b">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="default">{job.category}</Badge>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${jobTypeBadgeColor[job.jobType] || "bg-muted text-muted-foreground"}`}>
            {job.jobType}
          </span>
        </div>
        <h2 className="text-xl font-bold leading-tight" data-testid="text-preview-title">{job.title}</h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            {(job as any).employerName || "Employer"}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            {jobLocationText(job)}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {formatTimeAgo(job.createdAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 mt-4">
          <span className="text-xl font-bold text-primary" data-testid="text-preview-salary">
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
          <Link href={jobUrl(job)}>
            <Button className="gap-2" data-testid="button-preview-apply">
              <Send className="w-4 h-4" />
              Apply Now
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-6 overflow-y-auto">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          Job Description
        </h3>
        <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed max-w-prose" data-testid="text-preview-description">
          {job.description}
        </p>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-6 pt-5 border-t text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Category</p>
            <p className="font-medium">{job.category}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Job Type</p>
            <p className="font-medium">{job.jobType}</p>
          </div>
          {job.state && (
            <div>
              <p className="text-xs text-muted-foreground">State</p>
              <p className="font-medium">{job.state}</p>
            </div>
          )}
          {job.city && (
            <div>
              <p className="text-xs text-muted-foreground">City / Town</p>
              <p className="font-medium">{job.city}</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Link href={jobUrl(job)}>
            <Button variant="outline" className="w-full gap-1.5" data-testid="button-preview-view-full">
              View full details
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BrowseJobs() {
  usePageTitle("Browse Jobs");
  const [, setLocation] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const [searchQuery, setSearchQuery] = useState(urlParams.get("q") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [isSplit, setIsSplit] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    state: "",
    jobType: "",
    salaryRange: "",
  });

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsSplit(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

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
  const paginatedJobs = useMemo(
    () => filteredJobs.slice((currentPage - 1) * JOBS_PER_PAGE, currentPage * JOBS_PER_PAGE),
    [filteredJobs, currentPage]
  );

  useEffect(() => {
    if (!isSplit) return;
    if (paginatedJobs.length === 0) {
      setSelectedJobId(null);
      return;
    }
    if (!paginatedJobs.some(j => j.id === selectedJobId)) {
      setSelectedJobId(paginatedJobs[0].id);
    }
  }, [isSplit, paginatedJobs, selectedJobId]);

  const selectedJob = useMemo(
    () => filteredJobs.find(j => j.id === selectedJobId) || null,
    [filteredJobs, selectedJobId]
  );

  const handleSelectJob = (job: Job) => {
    if (isSplit) {
      setSelectedJobId(job.id);
    } else {
      setLocation(jobUrl(job));
    }
  };

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

  const goToPage = (p: number) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const FilterFields = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
    </div>
  );

  const listSkeleton = (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="animate-pulse border rounded-xl p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-1" data-testid="text-browse-heading">Browse Jobs</h1>
          <p className="text-muted-foreground">
            {isLoading ? "Loading..." : `${filteredJobs.length} job${filteredJobs.length !== 1 ? "s" : ""} available`}
            {totalPages > 1 && !isLoading && ` · Page ${currentPage} of ${totalPages}`}
          </p>
        </motion.div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by title, skill, or location..." 
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-11 rounded-xl"
              data-testid="input-job-search"
            />
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="h-11 rounded-xl gap-2 font-medium px-5 shrink-0"
            data-testid="button-toggle-filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <Card className="rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Filter className="w-4 h-4" /> Filters
                    </h3>
                    {activeFilterCount > 0 && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={clearFilters} data-testid="button-clear-filters">
                        Clear all
                      </Button>
                    )}
                  </div>
                  <FilterFields />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            {activeFilters.category && (
              <Badge variant="secondary" className="text-[11px] gap-1 pr-1">
                {activeFilters.category}
                <button onClick={() => handleFilterChange("category", "all")} className="ml-0.5 hover:text-destructive"><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {activeFilters.state && (
              <Badge variant="secondary" className="text-[11px] gap-1 pr-1">
                {activeFilters.state}
                <button onClick={() => handleFilterChange("state", "all")} className="ml-0.5 hover:text-destructive"><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {activeFilters.jobType && (
              <Badge variant="secondary" className="text-[11px] gap-1 pr-1">
                {activeFilters.jobType}
                <button onClick={() => handleFilterChange("jobType", "all")} className="ml-0.5 hover:text-destructive"><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {activeFilters.salaryRange && (
              <Badge variant="secondary" className="text-[11px] gap-1 pr-1">
                Salary filter
                <button onClick={() => handleFilterChange("salaryRange", "all")} className="ml-0.5 hover:text-destructive"><X className="w-3 h-3" /></button>
              </Badge>
            )}
          </div>
        )}

        <PageAds page="browse-jobs" position="top" />

        {isLoading ? (
          <div className="mt-4 lg:flex lg:gap-6">
            <div className="lg:w-[400px] xl:w-[430px] lg:shrink-0">{listSkeleton}</div>
            <div className="hidden lg:block lg:flex-1">
              <div className="border rounded-2xl p-6 animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-40 bg-muted rounded" />
              </div>
            </div>
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
          <div className="mt-4 lg:flex lg:gap-6 lg:items-start">
            {/* Job list */}
            <div className="lg:w-[400px] xl:w-[430px] lg:shrink-0">
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
                    <div className="space-y-3">
                      {segment1.map((job, index) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          index={index}
                          formatSalary={formatSalary}
                          selected={isSplit && job.id === selectedJobId}
                          onSelect={() => handleSelectJob(job)}
                        />
                      ))}
                    </div>

                    {segment2.length > 0 && (
                      <>
                        <div className="my-5">
                          <PageAds page="browse-jobs" position="middle" />
                        </div>

                        <div className="space-y-3">
                          {segment2.map((job, index) => (
                            <JobCard
                              key={job.id}
                              job={job}
                              index={index + SEGMENT_SIZE}
                              formatSalary={formatSalary}
                              selected={isSplit && job.id === selectedJobId}
                              onSelect={() => handleSelectJob(job)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}

              {totalPages > 1 && (
                <nav className="flex items-center justify-center gap-1 mt-8 pt-6 border-t" aria-label="Pagination" data-testid="pagination">
                  <Button variant="ghost" size="icon" className="h-9 w-9" disabled={currentPage === 1} onClick={() => goToPage(1)} data-testid="button-page-first" aria-label="First page">
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)} data-testid="button-page-prev" aria-label="Previous page">
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
                        onClick={() => goToPage(p as number)}
                        data-testid={`button-page-${p}`}
                        aria-label={`Page ${p}`}
                        aria-current={currentPage === p ? "page" : undefined}
                      >
                        {p}
                      </Button>
                    )
                  )}

                  <Button variant="ghost" size="icon" className="h-9 w-9" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)} data-testid="button-page-next" aria-label="Next page">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9" disabled={currentPage === totalPages} onClick={() => goToPage(totalPages)} data-testid="button-page-last" aria-label="Last page">
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </nav>
              )}
            </div>

            {/* Detail preview (desktop split view) */}
            <div className="hidden lg:block lg:flex-1 lg:min-w-0">
              <div className="sticky top-24">
                {selectedJob ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedJob.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <JobPreviewPanel job={selectedJob} formatSalary={formatSalary} />
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="border rounded-2xl p-10 text-center text-muted-foreground">
                    <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">Select a job to preview its details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
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

        <div className="mt-8">
          <PageAds page="browse-jobs" position="bottom" />
        </div>
      </main>

      <Footer />
      <NewsletterBar />
    </div>
  );
}
