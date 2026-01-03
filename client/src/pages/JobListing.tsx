import { useJobs } from "@/hooks/use-casual";
import { PageHeader } from "@/components/ui-extension";
import { JobCard } from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function JobListing() {
  const [category, setCategory] = useState<string>("");
  const { data: jobs, isLoading } = useJobs(category && category !== "all" ? { category } : undefined);

  return (
    <div className="space-y-6">
      <PageHeader title="Find Casual Work" description="Explore opportunities that fit your schedule." />

      <div className="flex flex-col md:flex-row gap-4 bg-muted/30 p-4 rounded-xl mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search jobs by title or keyword..." className="pl-10 bg-background" />
        </div>
        <div className="w-full md:w-64">
           <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Waitress / Waiter">Waitress / Waiter</SelectItem>
              <SelectItem value="House Keeper">House Keeper</SelectItem>
              <SelectItem value="Cleaner">Cleaner</SelectItem>
              <SelectItem value="Office Assistant">Office Assistant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-enter">
          {jobs?.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
          {jobs?.length === 0 && (
             <div className="col-span-full text-center py-20">
                <p className="text-xl text-muted-foreground">No jobs found matching your criteria.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
