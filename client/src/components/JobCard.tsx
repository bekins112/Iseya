import { Job } from "@shared/schema";
import { MapPin, DollarSign, Briefcase, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface JobCardProps {
  job: Job;
  isEmployer?: boolean;
}

export function JobCard({ job, isEmployer = false }: JobCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Card className="group hover:shadow-2xl transition-all duration-500 border-border/60 overflow-hidden h-full flex flex-col relative bg-card/50 backdrop-blur-sm">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />
        
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm">
              {job.category}
            </span>
            {job.isActive && (
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Live</span>
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-display group-hover:text-primary transition-colors leading-tight">
            {job.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 group-hover:bg-primary/5 transition-colors duration-300">
              <div className="bg-background p-2 rounded-xl shadow-sm">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Location</span>
                <span className="text-sm font-semibold truncate max-w-[100px]">{job.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 group-hover:bg-primary/5 transition-colors duration-300">
              <div className="bg-background p-2 rounded-xl shadow-sm">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Type</span>
                <span className="text-sm font-semibold">{job.jobType}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 group-hover:bg-primary/5 transition-colors duration-300 col-span-2">
              <div className="bg-background p-2 rounded-xl shadow-sm">
                <DollarSign className="h-4 w-4 text-accent" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Salary Range</span>
                <span className="text-sm font-semibold">₦{job.salaryMin.toLocaleString()} - ₦{job.salaryMax.toLocaleString()} ({job.wage})</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 italic">
            "{job.description}"
          </p>
        </CardContent>
        
        <CardFooter className="pt-6 border-t border-border/40 bg-muted/10">
          {isEmployer ? (
            <div className="flex gap-2 w-full">
              <Link href={`/jobs/${job.id}/applications`} className="flex-1">
                <Button variant="outline" className="w-full rounded-2xl border-2 hover:bg-primary hover:text-white transition-all group h-12">
                  View Applications
                  <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          ) : (
            <Link href={`/jobs/${job.id}`} className="w-full">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg shadow-primary/20 h-12 text-md font-bold group">
                Quick Apply
                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

