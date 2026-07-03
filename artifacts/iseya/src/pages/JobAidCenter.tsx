import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { motion } from "framer-motion";
import {
  Sparkles,
  Send,
  CheckCircle2,
  Hourglass,
  Clock,
  XCircle,
  Activity,
  Target,
  ListChecks,
} from "lucide-react";
import { PageHeader } from "@/components/ui-extension";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAuth } from "@/hooks/use-auth";
import { JobAidFeatures } from "@/components/JobAidFeatures";
import type { JobAidRequest } from "@/lib/types";

type JobAidBenefit = { key: string; label: string; included: boolean; limit: number | null };
type JobAidPlan = {
  id: string;
  name: string;
  amount: number;
  benefits: JobAidBenefit[];
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

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function prettifyKey(key: string) {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function JobAidCenter() {
  usePageTitle("Job-Aid");
  const { user } = useAuth();

  const { data: status, isLoading: statusLoading } = useQuery<JobAidStatus>({
    queryKey: ["/api/jobaid/status"],
  });
  const { data: plans } = useQuery<JobAidPlan[]>({
    queryKey: ["/api/jobaid/plans"],
  });

  const isActive = status?.status === "active" && !!status?.currentPlan;

  const { data: requests = [] } = useQuery<JobAidRequest[]>({
    queryKey: ["/api/jobaid/requests"],
    enabled: isActive,
    refetchInterval: 15000,
  });

  const currentPlan = plans?.find((p) => p.id === status?.currentPlan);
  const includedBenefits = useMemo(
    () => (currentPlan?.benefits || []).filter((b) => b.included),
    [currentPlan],
  );

  const labelFor = (key: string) =>
    includedBenefits.find((b) => b.key === key)?.label || prettifyKey(key);

  const stats = useMemo(() => {
    const total = requests.length;
    const open = requests.filter((r) => r.status === "pending" || r.status === "in_progress").length;
    const completed = requests.filter((r) => r.status === "completed").length;
    const rejected = requests.filter((r) => r.status === "rejected").length;
    return { total, open, completed, rejected };
  }, [requests]);

  const usageRows = useMemo(() => {
    return includedBenefits
      .filter((b) => b.limit != null)
      .map((b) => {
        const used = requests.filter((r) => r.benefitKey === b.key && r.status !== "rejected").length;
        const limit = b.limit || 0;
        const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
        return { key: b.key, label: b.label, used, limit, pct };
      });
  }, [includedBenefits, requests]);

  const activity = useMemo(() => {
    return [...requests].sort((a, b) => {
      const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return tb - ta;
    });
  }, [requests]);

  if (user && user.role !== "applicant") {
    return <Redirect to="/dashboard" />;
  }

  const planEnd = formatDate(status?.jobAidEndDate);

  const statCards = [
    { label: "Requests Made", value: stats.total, icon: ListChecks, accent: "text-primary", bg: "bg-primary/10" },
    { label: "In Progress", value: stats.open, icon: Hourglass, accent: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { label: "Achieved", value: stats.completed, icon: CheckCircle2, accent: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30" },
    { label: "Not Approved", value: stats.rejected, icon: XCircle, accent: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
  ];

  return (
    <div className="space-y-8 pb-10">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <PageHeader
          title="Job-Aid Center"
          description={
            <span className="flex items-center gap-2 flex-wrap">
              {isActive && currentPlan ? (
                <>
                  <Badge variant="outline" className="gap-1" data-testid="badge-jobaid-plan">
                    <Sparkles className="w-3 h-3" /> {currentPlan.name}
                  </Badge>
                  <span className="text-muted-foreground">Renews {planEnd}</span>
                </>
              ) : (
                "Track and use the benefits included in your Job-Aid plan."
              )}
            </span>
          }
        />
      </motion.div>

      {isActive && !statusLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} className="border-border/40 shadow-sm" data-testid={`stat-jobaid-${card.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>
                      <Icon className={`w-5 h-5 ${card.accent}`} />
                    </div>
                    <span className="text-3xl font-bold" data-testid={`stat-value-${card.label.toLowerCase().replace(/\s+/g, "-")}`}>{card.value}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 font-medium">{card.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      )}

      {isActive && usageRows.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/40 shadow-md" data-testid="card-jobaid-usage">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Benefit Usage
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                How much of each limited benefit you have used this subscription period.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {usageRows.map((row) => (
                <div key={row.key} data-testid={`usage-row-${row.key}`}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-semibold">{row.label}</span>
                    <span className="text-muted-foreground" data-testid={`usage-count-${row.key}`}>
                      {row.used}/{row.limit} used
                    </span>
                  </div>
                  <Progress value={row.pct} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <JobAidFeatures />

      {isActive && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-border/40 shadow-md" data-testid="card-jobaid-activity">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Activity History
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                A log of every Job-Aid request and its latest status.
              </p>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <div className="text-center py-10" data-testid="empty-jobaid-activity">
                  <Send className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No activity yet. Request a benefit above and it will show up here.
                  </p>
                </div>
              ) : (
                <ol className="relative border-l border-border/50 ml-2 space-y-6">
                  {activity.map((req) => {
                    const meta = statusMeta[req.status];
                    const Icon = meta.icon;
                    return (
                      <li key={req.id} className="ml-6" data-testid={`activity-item-${req.id}`}>
                        <span className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ${meta.className}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-sm font-semibold">{labelFor(req.benefitKey)}</p>
                          <Badge className={`text-[10px] gap-1 border-none ${meta.className}`}>
                            <Icon className="w-3 h-3" />
                            {meta.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Requested {formatDate(req.createdAt)}
                          {req.updatedAt && req.updatedAt !== req.createdAt && (
                            <> · Updated {formatDate(req.updatedAt)}</>
                          )}
                        </p>
                        {req.note && (
                          <p className="text-xs text-muted-foreground mt-1.5">
                            <span className="font-medium text-foreground">Your note:</span> {req.note}
                          </p>
                        )}
                        {req.adminNote && (
                          <p className="text-xs text-muted-foreground mt-1">
                            <span className="font-medium text-foreground">Team response:</span> {req.adminNote}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
