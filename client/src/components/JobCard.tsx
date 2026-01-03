import { Job } from "@shared/schema";
import { MapPin, DollarSign, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

interface JobCardProps {
  job: Job;
  isEmployer?: boolean;
}

export function JobCard({ job, isEmployer = false }: JobCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/60 overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 w-fit">
            {job.category}
          </div>
          {job.isActive && (
            <span className="flex h-2 w-2 rounded-full bg-green-500 ring-2 ring-green-500/20" title="Active" />
          )}
        </div>
        <CardTitle className="text-xl font-display group-hover:text-primary transition-colors">
          {job.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 flex-1">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>{job.wage}</span>
          </div>
        </div>
        <p className="text-sm text-foreground/80 line-clamp-3">
          {job.description}
        </p>
      </CardContent>
      
      <CardFooter className="pt-3 border-t bg-muted/20">
        {isEmployer ? (
          <div className="flex gap-2 w-full">
            <Link href={`/jobs/${job.id}/applications`} className="flex-1">
              <Button variant="outline" className="w-full">View Applications</Button>
            </Link>
          </div>
        ) : (
          <Link href={`/jobs/${job.id}`} className="w-full">
            <Button className="w-full bg-primary hover:bg-primary/90">View Details</Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
