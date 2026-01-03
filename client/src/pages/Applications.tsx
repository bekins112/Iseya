import { useMyApplications } from "@/hooks/use-casual";
import { PageHeader, StatusBadge } from "@/components/ui-extension";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Applications() {
  const { data: applications, isLoading } = useMyApplications();

  // In a real app we'd join with job details, but for now assuming we fetch separately or have partial data
  // For MVP simplification, assuming the API returns job details embedded or we just show IDs
  // To make it pretty, we'll mock job titles or update the query to join.
  // Actually, let's just show basic info since we defined the schema strictly.
  
  return (
    <div className="space-y-6">
      <PageHeader title="My Applications" description="Track the status of your job applications." />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-4">
          {applications?.map(app => (
            <Card key={app.id} className="overflow-hidden">
              <CardContent className="p-0 flex flex-col md:flex-row">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">Job #{app.jobId}</h3> 
                    <StatusBadge status={app.status || 'pending'} />
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-1 mb-4">{app.message}</p>
                  <p className="text-xs text-muted-foreground">Applied on {new Date(app.createdAt!).toLocaleDateString()}</p>
                </div>
                <div className="bg-muted/30 p-6 flex items-center justify-center md:border-l">
                  <Link href={`/jobs/${app.jobId}`}>
                    <Button variant="outline" size="sm">View Job</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {applications?.length === 0 && (
             <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                <p className="text-muted-foreground">You haven't applied to any jobs yet.</p>
                <Link href="/jobs">
                  <Button variant="link" className="mt-2">Browse Jobs</Button>
                </Link>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
