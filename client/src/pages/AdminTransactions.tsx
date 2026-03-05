import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-extension";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Redirect } from "wouter";
import {
  Search,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Wallet,
  ShieldCheck,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
} from "lucide-react";
import { format } from "date-fns";

type TransactionItem = {
  id: number;
  userId: string;
  type: string;
  gateway: string;
  reference: string | null;
  amount: number;
  currency: string;
  status: string;
  plan: string | null;
  metadata: string | null;
  createdAt: string;
  userName: string;
  userEmail: string;
};

type TransactionStats = {
  totalRevenue: number;
  subscriptionRevenue: number;
  verificationRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  monthlyRevenue: { month: string; subscriptions: number; verifications: number; total: number }[];
};

export default function AdminTransactions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gatewayFilter, setGatewayFilter] = useState("all");
  const [resolvingTxn, setResolvingTxn] = useState<TransactionItem | null>(null);
  const [resolveNote, setResolveNote] = useState("");

  const resolveTransaction = useMutation({
    mutationFn: async ({ id, adminNote }: { id: number; adminNote: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/transactions/${id}/resolve`, { adminNote });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Transaction Resolved", description: "The transaction has been marked as successful and benefits applied." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions/stats"] });
      setResolvingTxn(null);
      setResolveNote("");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to resolve transaction", variant: "destructive" });
    },
  });

  const { data: txns = [], isLoading } = useQuery<TransactionItem[]>({
    queryKey: ["/api/admin/transactions", typeFilter, statusFilter, gatewayFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (gatewayFilter !== "all") params.append("gateway", gatewayFilter);
      const res = await fetch(`/api/admin/transactions?${params}`, { credentials: "include" });
      return res.json();
    },
  });

  const { data: stats } = useQuery<TransactionStats>({
    queryKey: ["/api/admin/transactions/stats"],
  });

  if (user?.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  const filteredTxns = txns.filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.userName.toLowerCase().includes(q) ||
      t.userEmail.toLowerCase().includes(q) ||
      (t.reference || "").toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q) ||
      (t.plan || "").toLowerCase().includes(q)
    );
  });

  const statusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "failed": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "success": return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" data-testid={`badge-status-success`}>Success</Badge>;
      case "failed": return <Badge variant="destructive" data-testid={`badge-status-failed`}>Failed</Badge>;
      default: return <Badge variant="outline" data-testid={`badge-status-pending`}>Pending</Badge>;
    }
  };

  const gatewayIcon = (gateway: string) => {
    return gateway === "paystack"
      ? <CreditCard className="w-4 h-4 text-blue-500" />
      : <Wallet className="w-4 h-4 text-orange-500" />;
  };

  const maxMonthly = stats?.monthlyRevenue
    ? Math.max(...stats.monthlyRevenue.map(m => m.total), 1)
    : 1;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Manage Transactions"
        description="View all payments, collections, and reconciliation data"
      />

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card data-testid="card-total-revenue">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground font-medium">Total Revenue</span>
              </div>
              <p className="text-xl font-bold" data-testid="text-total-revenue">₦{stats.totalRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card data-testid="card-subscription-revenue">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground font-medium">Subscriptions</span>
              </div>
              <p className="text-xl font-bold" data-testid="text-subscription-revenue">₦{stats.subscriptionRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card data-testid="card-verification-revenue">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground font-medium">Verifications</span>
              </div>
              <p className="text-xl font-bold" data-testid="text-verification-revenue">₦{stats.verificationRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card data-testid="card-total-transactions">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">Total Txns</span>
              </div>
              <p className="text-xl font-bold" data-testid="text-total-transactions">{stats.totalTransactions}</p>
            </CardContent>
          </Card>
          <Card data-testid="card-successful-transactions">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground font-medium">Successful</span>
              </div>
              <p className="text-xl font-bold text-green-600" data-testid="text-successful-count">{stats.successfulTransactions}</p>
            </CardContent>
          </Card>
          <Card data-testid="card-failed-transactions">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownRight className="w-4 h-4 text-red-500" />
                <span className="text-xs text-muted-foreground font-medium">Failed</span>
              </div>
              <p className="text-xl font-bold text-red-600" data-testid="text-failed-count">{stats.failedTransactions}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {stats && stats.monthlyRevenue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Monthly Revenue
            </CardTitle>
            <CardDescription>Collections from subscriptions and verifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.monthlyRevenue.map((m) => (
                <div key={m.month} className="space-y-1.5" data-testid={`chart-month-${m.month}`}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{m.month}</span>
                    <span className="font-bold">₦{m.total.toLocaleString()}</span>
                  </div>
                  <div className="flex h-6 rounded-md overflow-hidden bg-muted">
                    {m.subscriptions > 0 && (
                      <div
                        className="bg-primary/80 flex items-center justify-center text-[10px] text-primary-foreground font-medium"
                        style={{ width: `${(m.subscriptions / maxMonthly) * 100}%` }}
                        title={`Subscriptions: ₦${m.subscriptions.toLocaleString()}`}
                      >
                        {m.subscriptions > maxMonthly * 0.1 ? `₦${m.subscriptions.toLocaleString()}` : ""}
                      </div>
                    )}
                    {m.verifications > 0 && (
                      <div
                        className="bg-green-500/80 flex items-center justify-center text-[10px] text-white font-medium"
                        style={{ width: `${(m.verifications / maxMonthly) * 100}%` }}
                        title={`Verifications: ₦${m.verifications.toLocaleString()}`}
                      >
                        {m.verifications > maxMonthly * 0.1 ? `₦${m.verifications.toLocaleString()}` : ""}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex gap-6 pt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-primary/80" />
                  Subscriptions
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-green-500/80" />
                  Verifications
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            All Transactions
          </CardTitle>
          <CardDescription>Filter and search transactions for reconciliation</CardDescription>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, ref..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search-transactions"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger data-testid="select-type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
                <SelectItem value="verification">Verification</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Successful</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={gatewayFilter} onValueChange={setGatewayFilter}>
              <SelectTrigger data-testid="select-gateway-filter">
                <SelectValue placeholder="All Gateways" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gateways</SelectItem>
                <SelectItem value="paystack">Paystack</SelectItem>
                <SelectItem value="flutterwave">Flutterwave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredTxns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No transactions found</p>
              <p className="text-sm">Transactions will appear here when payments are made.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="hidden md:grid grid-cols-[1fr_120px_100px_100px_100px_120px_140px] gap-2 px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b">
                <span>User / Reference</span>
                <span>Amount</span>
                <span>Type</span>
                <span>Gateway</span>
                <span>Plan</span>
                <span>Date</span>
                <span>Status / Action</span>
              </div>
              {filteredTxns.map((t) => (
                <div
                  key={t.id}
                  className={`grid grid-cols-1 md:grid-cols-[1fr_120px_100px_100px_100px_120px_140px] gap-2 px-3 py-3 rounded-lg hover:bg-muted/50 border transition-colors ${
                    t.status === "failed" ? "border-red-200 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/10" :
                    t.status === "pending" ? "border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10" :
                    "border-transparent hover:border-border"
                  }`}
                  data-testid={`row-transaction-${t.id}`}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate" data-testid={`text-txn-user-${t.id}`}>{t.userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.userEmail}</p>
                    {t.reference && (
                      <p className="text-xs text-muted-foreground/60 truncate font-mono">{t.reference}</p>
                    )}
                  </div>
                  <div className="flex items-center md:justify-start">
                    <span className="font-bold text-sm" data-testid={`text-txn-amount-${t.id}`}>₦{t.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {t.type === "subscription" ? (
                      <Crown className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                    )}
                    <span className="text-xs capitalize">{t.type}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {gatewayIcon(t.gateway)}
                    <span className="text-xs capitalize">{t.gateway}</span>
                  </div>
                  <div className="flex items-center">
                    {t.plan ? (
                      <Badge variant="outline" className="text-xs capitalize">{t.plan}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-muted-foreground">
                      {t.createdAt ? format(new Date(t.createdAt), "MMM d, yyyy HH:mm") : "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      {statusIcon(t.status)}
                      {statusBadge(t.status)}
                    </div>
                    {(t.status === "failed" || t.status === "pending") && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1"
                        onClick={() => { setResolvingTxn(t); setResolveNote(""); }}
                        data-testid={`button-resolve-${t.id}`}
                      >
                        <RotateCcw className="w-3 h-3" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!resolvingTxn} onOpenChange={(open) => { if (!open) { setResolvingTxn(null); setResolveNote(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-green-600" />
              Resolve Transaction
            </DialogTitle>
            <DialogDescription>
              Confirm that this payment was received and apply the associated benefits to the user.
            </DialogDescription>
          </DialogHeader>
          {resolvingTxn && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 border p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User</span>
                  <span className="font-medium" data-testid="text-resolve-user">{resolvingTxn.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold" data-testid="text-resolve-amount">₦{resolvingTxn.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="capitalize">{resolvingTxn.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gateway</span>
                  <span className="capitalize">{resolvingTxn.gateway}</span>
                </div>
                {resolvingTxn.plan && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="capitalize">{resolvingTxn.plan}</span>
                  </div>
                )}
                {resolvingTxn.reference && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference</span>
                    <span className="font-mono text-xs">{resolvingTxn.reference}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Status</span>
                  <Badge variant="destructive" className="text-xs">{resolvingTxn.status}</Badge>
                </div>
              </div>

              <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 p-3 text-sm">
                <p className="font-medium text-green-800 dark:text-green-300 mb-1">What will happen:</p>
                <ul className="text-green-700 dark:text-green-400 text-xs space-y-1">
                  <li>• Transaction will be marked as successful</li>
                  {resolvingTxn.type === "subscription" && resolvingTxn.plan && (
                    <li>• User's {resolvingTxn.plan} plan subscription will be activated for 30 days</li>
                  )}
                  {resolvingTxn.type === "verification" && (
                    <li>• User's verification request will be moved to "under review"</li>
                  )}
                  <li>• User will receive a notification about the resolution</li>
                </ul>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Admin Note (optional)</label>
                <Textarea
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  placeholder="e.g. Payment confirmed via bank transfer receipt"
                  className="min-h-[60px] resize-none text-sm"
                  data-testid="textarea-resolve-note"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setResolvingTxn(null); setResolveNote(""); }} data-testid="button-cancel-resolve">
              Cancel
            </Button>
            <Button
              onClick={() => resolvingTxn && resolveTransaction.mutate({ id: resolvingTxn.id, adminNote: resolveNote })}
              disabled={resolveTransaction.isPending}
              data-testid="button-confirm-resolve"
            >
              {resolveTransaction.isPending ? "Resolving..." : "Confirm & Resolve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
