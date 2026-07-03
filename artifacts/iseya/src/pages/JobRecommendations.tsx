import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Redirect, Link } from "wouter";
import { motion } from "framer-motion";
import {
  Compass,
  Sparkles,
  Lock,
  Loader2,
  Check,
  Briefcase,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/ui-extension";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { jobSectors } from "@/lib/job-categories";
import { JobCard } from "@/components/JobCard";
import { api } from "@/lib/api-routes";
import type { Job } from "@/lib/types";

type RecommendationsMeta = {
  included: boolean;
  limit: number | null;
  categories: string[];
};

type ApplicantApplication = { jobId: number };

// Map each sector name to the set of role categories it contains (lowercased),
// so a preferred sector matches the specific job categories jobs are posted under.
const sectorToCategories = new Map<string, string[]>(
  jobSectors.map((s) => [s.name, s.subcategories.map((c) => c.toLowerCase())]),
);

export default function JobRecommendations() {
  usePageTitle("Job Recommendations");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: meta, isLoading: metaLoading } = useQuery<RecommendationsMeta>({
    queryKey: ["/api/jobaid/recommendations/meta"],
  });

  const eligible = !!meta?.included;
  const savedCategories = useMemo(() => meta?.categories ?? [], [meta]);
  const limit = meta?.limit && meta.limit > 0 ? meta.limit : 50;

  const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: [api.jobs.list.path],
    queryFn: async () => {
      const res = await fetch(api.jobs.list.path);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    },
    enabled: eligible,
  });

  const { data: myApps } = useQuery<ApplicantApplication[]>({
    queryKey: [api.applications.listForApplicant.path],
    enabled: eligible,
  });

  // Draft selection for the preferences editor. Reset whenever the saved set
  // changes (initial load and after a successful save).
  const [draft, setDraft] = useState<string[]>([]);
  const savedKey = savedCategories.slice().sort().join("|");
  useEffect(() => {
    setDraft(savedCategories);
  }, [savedKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = draft.slice().sort().join("|") !== savedKey;

  const saveMutation = useMutation({
    mutationFn: async (categories: string[]) => {
      const res = await apiRequest("POST", "/api/jobaid/preferences", { categories });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobaid/recommendations/meta"] });
      toast({ title: "Preferences saved", description: "Your recommendations have been updated." });
    },
    onError: (e: any) => {
      const raw = (e?.message || "").replace(/^\d+:\s*/, "");
      let description = raw;
      try {
        description = JSON.parse(raw).message || raw;
      } catch {
        // not JSON
      }
      toast({ title: "Could not save preferences", description, variant: "destructive" });
    },
  });

  const toggleSector = (name: string) =>
    setDraft((prev) => (prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]));

  const appliedJobIds = useMemo(
    () => new Set((myApps ?? []).map((a) => a.jobId)),
    [myApps],
  );

  // Expand the saved sectors into the set of allowed job categories.
  const allowedCategories = useMemo(() => {
    const set = new Set<string>();
    for (const sector of savedCategories) {
      set.add(sector.toLowerCase()); // legacy: jobs saved under the sector name
      for (const cat of sectorToCategories.get(sector) ?? []) set.add(cat);
    }
    return set;
  }, [savedCategories]);

  const recommendations = useMemo(() => {
    if (!jobs || savedCategories.length === 0) return [];
    const userState = (user?.state || "").toLowerCase();
    const matches = jobs.filter(
      (j) =>
        allowedCategories.has((j.category || "").toLowerCase()) &&
        !appliedJobIds.has(j.id),
    );
    matches.sort((a, b) => {
      const sa = userState && (a.state || "").toLowerCase() === userState ? 1 : 0;
      const sb = userState && (b.state || "").toLowerCase() === userState ? 1 : 0;
      if (sa !== sb) return sb - sa;
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
    return matches.slice(0, limit);
  }, [jobs, savedCategories, allowedCategories, appliedJobIds, user?.state, limit]);

  if (user && user.role !== "applicant") {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="space-y-8 pb-10">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <PageHeader
          title="Job Recommendations"
          description="Jobs matched to the sectors you care about — updated automatically as new roles are posted. No requests needed."
        />
      </motion.div>

      {metaLoading ? (
        <Card className="border-border/40 shadow-md">
          <CardContent className="py-16 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : !eligible ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="relative overflow-hidden border-border/40 shadow-md" data-testid="card-recommendations-locked">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
            <CardContent className="relative flex flex-col items-center text-center py-12 gap-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <div className="max-w-md">
                <p className="font-semibold text-base">Personalized recommendations are a Job-Aid benefit</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Subscribe to a Job-Aid plan that includes personalized recommendations to get jobs
                  matched to your preferred sectors automatically.
                </p>
              </div>
              <Link href="/job-aid">
                <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20" data-testid="button-recommendations-upgrade">
                  <Sparkles className="w-4 h-4" /> View Job-Aid Plans
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="border-border/40 shadow-md" data-testid="card-recommendation-preferences">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display font-bold flex items-center gap-2">
                  <Compass className="w-5 h-5 text-primary" />
                  Your preferred sectors
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Pick the sectors you're interested in. We'll match you with active jobs in those areas.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {jobSectors.map((sector) => {
                    const checked = draft.includes(sector.name);
                    return (
                      <button
                        type="button"
                        key={sector.name}
                        onClick={() => toggleSector(sector.name)}
                        aria-pressed={checked}
                        data-testid={`sector-option-${sector.name.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                          checked
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border/40 hover:bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${
                            checked ? "bg-primary border-primary text-primary-foreground" : "border-border"
                          }`}
                        >
                          {checked && <Check className="w-3 h-3" />}
                        </span>
                        <span className="truncate">{sector.name}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-xs text-muted-foreground" data-testid="text-selected-sectors">
                    {draft.length} selected
                  </p>
                  <Button
                    onClick={() => saveMutation.mutate(draft)}
                    disabled={saveMutation.isPending || !dirty}
                    data-testid="button-save-preferences"
                  >
                    {saveMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
                      </>
                    ) : (
                      "Save preferences"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
              <h2 className="text-lg font-display font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Recommended for you
                {recommendations.length > 0 && (
                  <Badge variant="outline" className="text-xs" data-testid="badge-recommendation-count">
                    {recommendations.length}
                  </Badge>
                )}
              </h2>
            </div>

            {savedCategories.length === 0 ? (
              <Card className="border-border/40 shadow-sm">
                <CardContent className="flex flex-col items-center text-center py-12 gap-3">
                  <Compass className="w-10 h-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Choose your preferred sectors above and save to start getting personalized job recommendations.
                  </p>
                </CardContent>
              </Card>
            ) : jobsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : recommendations.length === 0 ? (
              <Card className="border-border/40 shadow-sm">
                <CardContent className="flex flex-col items-center text-center py-12 gap-3">
                  <Briefcase className="w-10 h-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground max-w-sm">
                    No matching jobs right now. We'll surface new roles here as soon as they're posted in your
                    preferred sectors.
                  </p>
                  <Link href="/jobs">
                    <Button variant="outline" className="gap-2" data-testid="button-browse-all-jobs">
                      <RefreshCw className="w-4 h-4" /> Browse all jobs
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {recommendations.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
