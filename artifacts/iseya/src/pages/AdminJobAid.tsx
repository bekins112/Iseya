import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-extension";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/use-page-title";
import type { JobAidRequest } from "@/lib/types";
import { Sparkles, RefreshCw, Loader2, Clock, Hourglass, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

const BENEFIT_LABELS: Record<string, string> = {
  recommendations: "Personalized job recommendations",
  referrals: "Direct job referrals",
  cv_refining: "Professional CV refining",
  interview_booking: "Interview booking assistance",
  verification: "Profile verification included",
  priority_support: "Priority support",
};
const PLAN_NAMES: Record<string, string> = {
  casual: "Casual Job-Aid",
  smart: "Smart Job-Aid",
  remote: "Remote Job-Aid",
  freelance: "Freelance Job-Aid",
  corporate: "Corporate Job-Aid",
};

type StatusValue = JobAidRequest["status"];
const STATUS_OPTIONS: StatusValue[] = ["pending", "in_progress", "completed", "rejected"];
const statusMeta: Record<StatusValue, { label: string; className: string; icon: typeof Clock }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", icon: Clock },
  in_progress: { label: "In progress", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: Hourglass },
  completed: { label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle2 },
  rejected: { label: "Not approved", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: XCircle },
};

type Filter = "all" | StatusValue;
const FILTERS: Filter[] = ["all", "pending", "in_progress", "completed", "rejected"];

export default function AdminJobAid() {
  usePageTitle("Job-Aid Requests");
  const { user } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState<Filter>("pending");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draftStatus, setDraftStatus] = useState<StatusValue>("pending");
  const [draftNote, setDraftNote] = useState("");

  if (user && user.role !== "admin") return <Redirect to="/dashboard" />;

  const { data: requests = [], refetch, isFetching } = useQuery<JobAidRequest[]>({
    queryKey: ["/api/admin/jobaid/requests", filter],
    queryFn: async () => {
      const qs = filter === "all" ? "" : `?status=${filter}`;
      const res = await fetch(`/api/admin/jobaid/requests${qs}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    refetchInterval: 8000,
  });

  const selected = requests.find((r) => r.id === selectedId) || null;

  const selectRequest = (r: JobAidRequest) => {
    setSelectedId(r.id);
    setDraftStatus(r.status);
    setDraftNote(r.adminNote || "");
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/admin/jobaid/requests/${selectedId}`, {
        status: draftStatus,
        adminNote: draftNote.trim() || null,
      });
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Request updated", description: "The applicant has been notified." });
    },
    onError: (e: any) => {
      toast({ title: "Failed to update", description: e.message, variant: "destructive" });
    },
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div>
      <PageHeader
        title="Job-Aid Requests"
        description={`Fulfill applicant Job-Aid feature requests${
          filter === "pending" && pendingCount ? ` — ${pendingCount} pending` : ""
        }`}
      />

      <div className="flex gap-2 mb-4 flex-wrap items-center">
        {FILTERS.map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            data-testid={`filter-${f}`}
          >
            {f === "all" ? "All" : statusMeta[f].label}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* List */}
        <Card className="lg:col-span-1 max-h-[75vh] overflow-y-auto">
          <CardContent className="p-2">
            {requests.length === 0 ? (
              <div className="text-sm text-muted-foreground py-12 text-center">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No {filter === "all" ? "" : statusMeta[filter as StatusValue].label.toLowerCase()} requests.
              </div>
            ) : (
              requests.map((r) => {
                const meta = statusMeta[r.status];
                const Icon = meta.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => selectRequest(r)}
                    data-testid={`request-${r.id}`}
                    className={`w-full text-left p-3 rounded-lg mb-1 hover:bg-muted/50 transition ${
                      selectedId === r.id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-sm truncate">{r.userName || "Applicant"}</div>
                      <Badge className={`text-[10px] gap-1 border-none ${meta.className}`}>
                        <Icon className="w-3 h-3" />
                        {meta.label}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {BENEFIT_LABELS[r.benefitKey] || r.benefitKey}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {PLAN_NAMES[r.plan] || r.plan} ·{" "}
                      {r.createdAt ? format(new Date(r.createdAt), "MMM d, HH:mm") : ""}
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Detail */}
        <Card className="lg:col-span-2 max-h-[75vh] overflow-y-auto">
          {!selected ? (
            <CardContent className="flex items-center justify-center text-sm text-muted-foreground py-24">
              Select a request to review and update it.
            </CardContent>
          ) : (
            <CardContent className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-base">{selected.userName || "Applicant"}</h3>
                <div className="text-xs text-muted-foreground mt-0.5 space-y-0.5">
                  {selected.userEmail && <div data-testid="text-request-email">{selected.userEmail}</div>}
                  {selected.userPhone && <div data-testid="text-request-phone">{selected.userPhone}</div>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Feature</p>
                  <p className="font-medium" data-testid="text-request-benefit">
                    {BENEFIT_LABELS[selected.benefitKey] || selected.benefitKey}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Plan</p>
                  <p className="font-medium">{PLAN_NAMES[selected.plan] || selected.plan}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Requested</p>
                  <p className="font-medium">
                    {selected.createdAt ? format(new Date(selected.createdAt), "MMM d, yyyy HH:mm") : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Last update</p>
                  <p className="font-medium">
                    {selected.updatedAt ? format(new Date(selected.updatedAt), "MMM d, yyyy HH:mm") : "—"}
                  </p>
                </div>
              </div>

              {selected.note && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Applicant note</p>
                  <p className="text-sm bg-muted/40 rounded-lg p-3 whitespace-pre-wrap" data-testid="text-request-note">
                    {selected.note}
                  </p>
                </div>
              )}

              <div className="border-t pt-4 space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Update status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={draftStatus === s ? "default" : "outline"}
                        onClick={() => setDraftStatus(s)}
                        data-testid={`status-option-${s}`}
                      >
                        {statusMeta[s].label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Note to applicant (optional)
                  </p>
                  <textarea
                    value={draftNote}
                    onChange={(e) => setDraftNote(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    placeholder="Shared with the applicant, e.g. reason for rejection or next steps…"
                    data-testid="input-admin-note"
                    className="w-full resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <Button
                  onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending}
                  data-testid="button-save-request"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
                    </>
                  ) : (
                    "Save & notify applicant"
                  )}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
