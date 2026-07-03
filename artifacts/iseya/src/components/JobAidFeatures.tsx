import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Lock,
  Sparkles,
  Check,
  Loader2,
  Info,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

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

type BenefitAction = { label: string; href: string; variant?: "default" | "outline" };
type BenefitBehavior =
  | { kind: "actions"; hint: string; actions: BenefitAction[] }
  | { kind: "info"; hint: string };

// How each Job-Aid benefit behaves for the applicant.
const benefitBehavior: Record<string, BenefitBehavior> = {
  recommendations: {
    kind: "actions",
    hint: "Pick your preferred sectors and get matching jobs automatically — then apply in one tap.",
    actions: [{ label: "View recommendations", href: "/recommendations" }],
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
  const { data: status, isLoading: statusLoading } = useQuery<JobAidStatus>({
    queryKey: ["/api/jobaid/status"],
  });
  const { data: plans } = useQuery<JobAidPlan[]>({
    queryKey: ["/api/jobaid/plans"],
  });

  const isActive = status?.status === "active" && !!status.currentPlan;

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
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
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
    </motion.div>
  );
}
