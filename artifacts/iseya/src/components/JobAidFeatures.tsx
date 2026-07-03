import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Link } from "wouter";
import { Lock, Sparkles, Check, Loader2, Clock, CheckCircle2, XCircle, Hourglass } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { JobAidRequest } from "@/lib/types";

type JobAidBenefit = { key: string; label: string; included: boolean; limit: number | null };
type JobAidPlan = {
  id: string;
  name: string;
  amount: number;
  originalAmount: number;
  discount: number;
  benefits: JobAidBenefit[];
  amountFormatted: string;
  originalAmountFormatted: string;
};
type JobAidStatus = {
  currentPlan: string | null;
  status: "active" | "none";
  jobAidEndDate: string | null;
};

const statusMeta: Record<
  JobAidRequest["status"],
  { label: string; className: string; icon: typeof Clock }
> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", icon: Clock },
  in_progress: { label: "In progress", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: Hourglass },
  completed: { label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle2 },
  rejected: { label: "Not approved", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: XCircle },
};

export function JobAidFeatures() {
  const { toast } = useToast();
  const [activeBenefit, setActiveBenefit] = useState<JobAidBenefit | null>(null);
  const [note, setNote] = useState("");

  const { data: status, isLoading: statusLoading } = useQuery<JobAidStatus>({
    queryKey: ["/api/jobaid/status"],
  });
  const { data: plans } = useQuery<JobAidPlan[]>({
    queryKey: ["/api/jobaid/plans"],
  });

  const isActive = status?.status === "active" && !!status.currentPlan;

  const { data: requests = [] } = useQuery<JobAidRequest[]>({
    queryKey: ["/api/jobaid/requests"],
    enabled: isActive,
    refetchInterval: 15000,
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: { benefitKey: string; note?: string }) => {
      const res = await apiRequest("POST", "/api/jobaid/requests", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobaid/requests"] });
      setActiveBenefit(null);
      setNote("");
      toast({ title: "Request submitted", description: "Our team will process it shortly." });
    },
    onError: (e: any) => {
      const msg = (e?.message || "").replace(/^\d+:\s*/, "");
      let description = msg;
      try {
        const parsed = JSON.parse(msg);
        description = parsed.message || msg;
      } catch {
        // not JSON, use raw message
      }
      toast({ title: "Could not submit request", description, variant: "destructive" });
    },
  });

  if (statusLoading) {
    return (
      <Card className="border-border/40 shadow-md">
        <CardContent className="py-10 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Locked state — no active Job-Aid plan
  if (!isActive) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
      >
        <Card className="relative overflow-hidden border-border/40 shadow-md" data-testid="card-jobaid-locked">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-lg font-display font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Job-Aid Features
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex flex-col items-center text-center py-6 gap-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <div className="max-w-md">
                <p className="font-semibold text-base">Unlock hands-on help landing your next job</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Get personalized recommendations, direct referrals, professional CV refining,
                  interview booking, and priority support. Subscribe to a Job-Aid plan to request these.
                </p>
              </div>
              <Link href="/job-aid">
                <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20" data-testid="button-jobaid-upgrade">
                  <Sparkles className="w-4 h-4" /> View Job-Aid Plans
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const currentPlan = plans?.find((p) => p.id === status?.currentPlan);
  const includedBenefits = (currentPlan?.benefits || []).filter((b) => b.included);

  const openStatuses: JobAidRequest["status"][] = ["pending", "in_progress"];
  const requestsForBenefit = (key: string) =>
    requests.filter((r) => r.benefitKey === key);
  const openRequestForBenefit = (key: string) =>
    requestsForBenefit(key).find((r) => openStatuses.includes(r.status));
  const usedForBenefit = (key: string) =>
    requestsForBenefit(key).filter((r) => r.status !== "rejected").length;

  const planEnd = status?.jobAidEndDate
    ? new Date(status.jobAidEndDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.24 }}
    >
      <Card className="border-border/40 shadow-md" data-testid="card-jobaid-features">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-lg font-display font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Job-Aid Features
            </CardTitle>
            <div className="flex items-center gap-2">
              {currentPlan && (
                <Badge variant="outline" className="text-xs" data-testid="badge-jobaid-plan">
                  {currentPlan.name}
                </Badge>
              )}
              {planEnd && (
                <span className="text-xs text-muted-foreground">Renews {planEnd}</span>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Request any feature included in your plan. Our team fulfills each request manually and
            you'll be notified when the status changes.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {includedBenefits.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              Your plan has no requestable features configured yet.
            </div>
          ) : (
            includedBenefits.map((benefit) => {
              const open = openRequestForBenefit(benefit.key);
              const used = usedForBenefit(benefit.key);
              const hasLimit = benefit.limit != null;
              const quotaReached = hasLimit && used >= (benefit.limit || 0);
              const latest = requestsForBenefit(benefit.key)[0];
              return (
                <div
                  key={benefit.key}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border/30"
                  data-testid={`row-jobaid-benefit-${benefit.key}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{benefit.label}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                        {hasLimit && (
                          <span data-testid={`text-jobaid-quota-${benefit.key}`}>
                            {used}/{benefit.limit} used
                          </span>
                        )}
                        {latest && (
                          <Badge className={`text-[10px] gap-1 border-none ${statusMeta[latest.status].className}`}>
                            {(() => {
                              const Icon = statusMeta[latest.status].icon;
                              return <Icon className="w-3 h-3" />;
                            })()}
                            {statusMeta[latest.status].label}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {open ? (
                      <Button size="sm" variant="outline" disabled data-testid={`button-jobaid-requested-${benefit.key}`}>
                        Requested
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          setActiveBenefit(benefit);
                          setNote("");
                        }}
                        disabled={quotaReached}
                        data-testid={`button-jobaid-request-${benefit.key}`}
                      >
                        {quotaReached ? "Limit reached" : "Request"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={!!activeBenefit} onOpenChange={(o) => !o && setActiveBenefit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request: {activeBenefit?.label}</DialogTitle>
            <DialogDescription>
              Add any details that will help our team fulfill your request (optional).
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="e.g. I'm targeting remote data-entry roles in Lagos…"
            data-testid="input-jobaid-note"
            className="w-full resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveBenefit(null)} data-testid="button-jobaid-cancel">
              Cancel
            </Button>
            <Button
              onClick={() =>
                activeBenefit &&
                submitMutation.mutate({ benefitKey: activeBenefit.key, note: note.trim() || undefined })
              }
              disabled={submitMutation.isPending}
              data-testid="button-jobaid-submit"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…
                </>
              ) : (
                "Submit request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
