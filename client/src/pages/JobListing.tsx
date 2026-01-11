import { useAuth } from "@/hooks/use-auth";
import { useJobs } from "@/hooks/use-casual";
import { PageHeader } from "@/components/ui-extension";
import { JobCard } from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, Briefcase, MapPin, DollarSign, Clock } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function JobListing() {
  const { user } = useAuth();
  const isEmployer = user?.role === "employer";
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    location: "",
    jobType: "",
    minSalary: "",
    maxSalary: "",
  });

  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== "" && v !== "all")
  );

  const { data: jobs, isLoading } = useJobs(isEmployer ? { employerId: user?.id } : (Object.keys(activeFilters).length > 0 ? activeFilters : undefined));

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      location: "",
      jobType: "",
      minSalary: "",
      maxSalary: "",
    });
  };

  return (
    <div className="space-y-8 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PageHeader 
          title={isEmployer ? "Your Job Postings" : "Discover Opportunities"} 
          description={isEmployer ? "Manage and track the performance of your listings." : "Find the perfect casual job that fits your lifestyle."} 
        />
      </motion.div>

      {!isEmployer && (
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 bg-card/50 backdrop-blur-md p-4 rounded-3xl shadow-xl shadow-primary/5 border border-border/40"
          >
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search roles or keywords..." 
                className="pl-12 bg-background h-12 rounded-2xl border-border/60 focus:ring-primary/20 transition-all text-md" 
              />
            </div>
            <Button 
              variant={showFilters ? "outline" : "outline"} 
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 rounded-2xl gap-2 font-bold px-6"
            >
              <SlidersHorizontal className="h-5 w-5" />
              Filters
              {Object.keys(activeFilters).length > 0 && (
                <span className="ml-1 bg-primary-foreground text-primary rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
                  {Object.keys(activeFilters).length}
                </span>
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
                <Card className="rounded-3xl border-border/40 bg-card/30 backdrop-blur-sm shadow-inner">
                  <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Briefcase className="w-3 h-3" /> Category
                      </label>
                      <Select value={filters.category} onValueChange={(v) => handleFilterChange("category", v)}>
                        <SelectTrigger className="bg-background h-10 rounded-xl">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="Waitress / Waiter">Waitress / Waiter</SelectItem>
                          <SelectItem value="House Keeper">House Keeper</SelectItem>
                          <SelectItem value="Cleaner">Cleaner</SelectItem>
                          <SelectItem value="Office Assistant">Office Assistant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> Location
                      </label>
                      <Input 
                        placeholder="City or Neighborhood" 
                        value={filters.location}
                        onChange={(e) => handleFilterChange("location", e.target.value)}
                        className="h-10 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Job Type
                      </label>
                      <Select value={filters.jobType} onValueChange={(v) => handleFilterChange("jobType", v)}>
                        <SelectTrigger className="bg-background h-10 rounded-xl">
                          <SelectValue placeholder="Any Type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="all">Any Type</SelectItem>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 lg:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <DollarSign className="w-3 h-3" /> Salary Range (Min - Max)
                      </label>
                      <div className="flex items-center gap-4">
                        <Input 
                          type="number"
                          placeholder="Min" 
                          value={filters.minSalary}
                          onChange={(e) => handleFilterChange("minSalary", e.target.value)}
                          className="h-10 rounded-xl"
                        />
                        <span className="text-muted-foreground font-bold">-</span>
                        <Input 
                          type="number"
                          placeholder="Max" 
                          value={filters.maxSalary}
                          onChange={(e) => handleFilterChange("maxSalary", e.target.value)}
                          className="h-10 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="flex items-end justify-end">
                      <Button variant="ghost" onClick={clearFilters} className="text-primary font-bold">
                        Reset Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-72 bg-muted/40 rounded-3xl animate-pulse border border-border/20" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div 
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {jobs?.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </motion.div>
          {jobs?.length === 0 && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="col-span-full text-center py-32 bg-muted/20 rounded-3xl border-2 border-dashed"
             >
                <Briefcase className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-2xl font-display font-bold text-muted-foreground">No matches found</p>
                <p className="text-muted-foreground">Try adjusting your filters to find more jobs.</p>
                <Button variant="ghost" onClick={clearFilters} className="mt-4 text-primary font-bold">Clear all filters</Button>
             </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
