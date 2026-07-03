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
import {
  Lock,
  Sparkles,
  Check,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Hourglass,
  Info,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { jobSectors } from "@/lib/job-categories";
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

type BenefitAction = { label: string; href: string; variant?: "default" | "outline" };
type BenefitBehavior =
  | { kind: "recommend"; hint: string }
  | { kind: "actions"; hint: string; actions: BenefitAction[] }
  | { kind: "info"; hint: string };

// How each Job-Aid benefit behaves for the applicant.
const benefitBehavior: Record<string, BenefitBehavior> = {
  recommendations: {
    kind: "recommend",
    hint: "Pick the job categories you're interested in and we'll tailor recommendations to you.",
  },
  referrals: {
    kind: "info",
    hint: "No request needed — our team refers you directly to matching employers.",
  },
  cv_refining: {
    kind: "actions",
    hint: "Polish your CV instantly with our AI refiner, or reach out to our team.",
    actions: [
      { label: "Refine my CV", href: "/cv-refine" },
      { label: "Contact support", href: "/support", variant: "outline" },
    ],
  },
  interview_booking: {
    kind: "info",
    hint: "No request needed — our team schedules the interviews your plan covers.",
  },
  verification: {
    kind: "actions",
    hint: "Get the verified badge by uploading your ID and a quick selfie.",
    actions: [{ label: "Get verified", href: "/verification" }],
  },
  priority_support: {
    kind: "actions",
    hint: "You're first in line — reach our support team any time.",
    actions: [{ label: "Contact support", href: "/support", variant: "outline" }],
  },
};

const behaviorFor = (key: string): BenefitBehavior =>
  benefitBehavior[key] || { kind: "info", hint: "Included in your plan." };

export function JobAidFeatures() {
  const { toast } = useToast();
  // Only the "recommendations" benefit uses the request dialog now.
  const [recommendOpen, setRecommendOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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
      setRecommendOpen(false);
      setSelectedCategories([]);
      toast({ title: "Request submitted", description: "Our team will send you tailored recommendations shortly." });
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

  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
    );
  };

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
                  Get personalized recommendations, direct referrals, an AI CV refiner,
                  interview booking, and priority support. Subscribe to a Job-Aid plan to use these.
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
  const requestsForBenefit = (key: string) => requests.filter((r) => r.benefitKey === key);
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
            Use the benefits included in your plan below. Some are handled automatically by our team,
            while others you can start yourself right here.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {includedBenefits.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              Your plan has no features configured yet.
            </div>
          ) : (
            includedBenefits.map((benefit) => {
              const behavior = behaviorFor(benefit.key);
              const isRecommend = behavior.kind === "recommend";

              const open = isRecommend ? openRequestForBenefit(benefit.key) : undefined;
              const used = isRecommend ? usedForBenefit(benefit.key) : 0;
              const hasLimit = isRecommend && benefit.limit != null;
              const quotaReached = hasLimit && used >= (benefit.limit || 0);
              const latest = isRecommend ? requestsForBenefit(benefit.key)[0] : undefined;

              return (
                <div
                  key={benefit.key}
                  className="flex items-start justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border/30"
                  data-testid={`row-jobaid-benefit-${benefit.key}`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{benefit.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{behavior.hint}</p>
                      {isRecommend && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
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
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    {behavior.kind === "recommend" && (
                      open ? (
                        <Button size="sm" variant="outline" disabled data-testid={`button-jobaid-requested-${benefit.key}`}>
                          Requested
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedCategories([]);
                            setRecommendOpen(true);
                          }}
                          disabled={quotaReached}
                          data-testid={`button-jobaid-request-${benefit.key}`}
                        >
                          {quotaReached ? "Limit reached" : "Set preferences"}
                        </Button>
                      )
                    )}

                    {behavior.kind === "actions" &&
                      behavior.actions.map((action) => (
                        <Link key={action.href} href={action.href}>
                          <Button
                            size="sm"
                            variant={action.variant || "default"}
                            className="gap-1.5 whitespace-nowrap"
                            data-testid={`button-jobaid-action-${benefit.key}-${action.href.replace(/\//g, "")}`}
                          >
                            {action.label}
                            {(!action.variant || action.variant === "default") && (
                              <ArrowRight className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </Link>
                      ))}

                    {behavior.kind === "info" && (
                      <Badge
                        variant="outline"
                        className="gap-1 text-[10px] text-muted-foreground"
                        data-testid={`badge-jobaid-info-${benefit.key}`}
                      >
                        <Info className="w-3 h-3" /> Automatic
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={recommendOpen} onOpenChange={(o) => !o && setRecommendOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Choose your job categories</DialogTitle>
            <DialogDescription>
              Select the categories you're interested in. Our team will use these to send you tailored
              job recommendations. You can pick as many as you like.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-72 overflow-y-auto -mx-1 px-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {jobSectors.map((sector) => {
                const checked = selectedCategories.includes(sector.name);
                return (
                  <button
                    type="button"
                    key={sector.name}
                    onClick={() => toggleCategory(sector.name)}
                    aria-pressed={checked}
                    data-testid={`category-option-${sector.name.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`}
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
          </div>

          <p className="text-xs text-muted-foreground" data-testid="text-selected-count">
            {selectedCategories.length} selected
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRecommendOpen(false)} data-testid="button-jobaid-cancel">
              Cancel
            </Button>
            <Button
              onClick={() =>
                submitMutation.mutate({
                  benefitKey: "recommendations",
                  note: `Preferred job categories: ${selectedCategories.join(", ")}`,
                })
              }
              disabled={submitMutation.isPending || selectedCategories.length === 0}
              data-testid="button-jobaid-submit"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…
                </>
              ) : (
                "Submit preferences"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
