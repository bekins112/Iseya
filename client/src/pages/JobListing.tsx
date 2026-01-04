import { useJobs } from "@/hooks/use-casual";
import { PageHeader } from "@/components/ui-extension";
import { JobCard } from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

export default function JobListing() {
  const [category, setCategory] = useState<string>("");
  const { data: jobs, isLoading } = useJobs(category && category !== "all" ? { category } : undefined);

  return (
    <div className="space-y-8 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PageHeader title="Discover Opportunities" description="Find the perfect casual job that fits your lifestyle." />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4 bg-card/50 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-primary/5 border border-border/40"
      >
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search roles, companies, or keywords..." 
            className="pl-12 bg-background h-12 rounded-2xl border-border/60 focus:ring-primary/20 transition-all text-md" 
          />
        </div>
        <div className="flex gap-3">
          <div className="w-full md:w-64">
             <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-background h-12 rounded-2xl border-border/60 focus:ring-primary/20 text-md">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Waitress / Waiter">Waitress / Waiter</SelectItem>
                <SelectItem value="House Keeper">House Keeper</SelectItem>
                <SelectItem value="Cleaner">Cleaner</SelectItem>
                <SelectItem value="Office Assistant">Office Assistant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-border/60 shrink-0">
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>

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
                <p className="text-muted-foreground">Try adjusting your search or filters to find more jobs.</p>
                <Button variant="link" onClick={() => setCategory("all")} className="mt-4 text-primary font-bold">Clear all filters</Button>
             </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

