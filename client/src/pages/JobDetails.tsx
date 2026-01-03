import { useRoute, Link } from "wouter";
import { useJob, useCreateApplication } from "@/hooks/use-casual";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/ui-extension";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { MapPin, DollarSign, ArrowLeft } from "lucide-react";

export default function JobDetails() {
  const [, params] = useRoute("/jobs/:id");
  const id = parseInt(params?.id || "0");
  const { data: job, isLoading } = useJob(id);
  const { user } = useAuth();
  const createApplication = useCreateApplication();
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  if (isLoading) return <div className="animate-pulse h-96 bg-muted rounded-xl" />;
  if (!job) return <div>Job not found</div>;

  const isEmployer = user?.role === "employer";
  const isMyJob = job.employerId === user?.id;

  const handleApply = () => {
    if (!user) return;
    createApplication.mutate({
      jobId: job.id,
      applicantId: user.id,
      message: message,
      status: "pending"
    }, {
      onSuccess: () => setOpen(false)
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/jobs" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
      </Link>

      <div className="bg-background border rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-muted/30 p-8 border-b">
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
                {job.category}
              </span>
              <h1 className="text-3xl font-display font-bold text-foreground mb-4">{job.title}</h1>
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {job.location}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> {job.wage}
                </div>
              </div>
            </div>

            {!isEmployer && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="shadow-lg shadow-primary/20">Apply Now</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Apply for {job.title}</DialogTitle>
                    <DialogDescription>
                      Introduce yourself to the employer. Keep it professional and brief.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Your Message</Label>
                      <Textarea 
                        placeholder="Hi, I'm interested in this position because..." 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[150px]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleApply} disabled={createApplication.isPending}>
                      {createApplication.isPending ? "Sending..." : "Send Application"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            
            {isMyJob && (
               <Link href={`/jobs/${job.id}/applications`}>
                  <Button variant="outline">View Applications</Button>
               </Link>
            )}
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-xl font-bold mb-4">Description</h3>
          <div className="prose max-w-none text-muted-foreground whitespace-pre-line">
            {job.description}
          </div>
        </div>
      </div>
    </div>
  );
}
