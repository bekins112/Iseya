import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  SlidersHorizontal, 
  Briefcase, 
  MapPin, 
  Clock, 
  Building2, 
  ArrowLeft,
  ChevronRight,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@shared/routes";
import type { Job } from "@shared/schema";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";

function formatTimeAgo(date: Date | string | null | undefined): string {
  if (!date) return "Recently";
  
  const now = new Date();
  const posted = new Date(date);
  const diffMs = now.getTime() - posted.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? 's' : ''} ago`;
}

const categories = [
  "Cleaning",
  "Construction",
  "Hospitality",
  "Retail",
  "Delivery",
  "Event Staff",
  "Warehouse",
  "Security",
  "Catering",
  "General Labour",
  "Other"
];

const locations = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
  "Kano",
  "Kaduna",
  "Benin City",
  "Enugu",
  "Owerri",
  "Abeokuta",
  "Other"
];

const jobTypes = ["full-time", "part-time", "contract", "temporary"];

export default function BrowseJobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    location: "",
    jobType: "",
  });

  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== "" && v !== "all")
  );

  const { data: jobs, isLoading } = useQuery<Job[]>({
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
    }
  });

  const filteredJobs = jobs?.filter(job => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query) ||
      job.category.toLowerCase().includes(query)
    );
  }) || [];

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: "", location: "", jobType: "" });
    setSearchQuery("");
  };

  const formatSalary = (min: number, max: number) => {
    const formatNum = (n: number) => n >= 1000 ? `₦${(n/1000).toFixed(0)}k` : `₦${n}`;
    return `${formatNum(min)} - ${formatNum(max)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src={iseyaLogo} alt="Iṣéyá" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/faqs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                FAQs
              </Link>
              <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse All Jobs</h1>
          <p className="text-muted-foreground">Find the perfect opportunity from {jobs?.length || 0} available positions</p>
        </motion.div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 bg-card/50 backdrop-blur-md p-4 rounded-2xl shadow-lg border"
          >
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search jobs by title, description, or location..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-xl"
                data-testid="input-job-search"
              />
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 rounded-xl gap-2 font-medium px-6"
              data-testid="button-toggle-filters"
            >
              <SlidersHorizontal className="h-5 w-5" />
              Filters
              {Object.keys(activeFilters).length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {Object.keys(activeFilters).length}
                </Badge>
              )}
            </Button>
          </motion.div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="rounded-2xl">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Briefcase className="w-4 h-4" /> Category
                        </label>
                        <Select 
                          value={filters.category} 
                          onValueChange={(v) => handleFilterChange("category", v)}
                        >
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> Location
                        </label>
                        <Select 
                          value={filters.location} 
                          onValueChange={(v) => handleFilterChange("location", v)}
                        >
                          <SelectTrigger data-testid="select-location">
                            <SelectValue placeholder="All Locations" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Locations</SelectItem>
                            {locations.map(loc => (
                              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4" /> Job Type
                        </label>
                        <Select 
                          value={filters.jobType} 
                          onValueChange={(v) => handleFilterChange("jobType", v)}
                        >
                          <SelectTrigger data-testid="select-job-type">
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {jobTypes.map(type => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {Object.keys(activeFilters).length > 0 && (
                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          {Object.keys(activeFilters).length} filter(s) applied
                        </p>
                        <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                          Clear all
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-20 bg-muted rounded" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-20" />
                    <div className="h-6 bg-muted rounded w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
            <Button onClick={clearFilters} variant="outline" data-testid="button-reset-search">
              Reset Search
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover-elevate transition-all group" data-testid={`card-job-${job.id}`}>
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {(job as any).employerName || "Employer"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatTimeAgo(job.createdAt)}
                          </span>
                        </div>
                      </div>
                      <Badge variant={job.isActive ? "default" : "secondary"}>
                        {job.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow">
                      {job.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Briefcase className="w-3 h-3" />
                        {job.category}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Clock className="w-3 h-3" />
                        {job.jobType}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="font-bold text-primary">
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                      <Link 
                        href={`/jobs/${job.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        data-testid={`button-view-job-${job.id}`}
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-2">Ready to apply?</h3>
              <p className="text-muted-foreground mb-6">
                Sign up now to apply for jobs and connect with employers
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button size="lg" data-testid="button-signup-cta">
                    Get Started Free
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/employer">
                  <Button size="lg" variant="outline" data-testid="button-employer-cta">
                    Post a Job
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={iseyaLogo} alt="Iṣéyá" className="h-6 w-auto" />
            <span className="text-sm text-muted-foreground">© 2026 Iṣéyá. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/faqs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              FAQs
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
