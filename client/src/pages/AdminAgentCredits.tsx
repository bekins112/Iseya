import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-extension";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Briefcase,
  Coins,
  Plus,
  Minus,
  Settings,
  Mail,
  Phone,
  Building2,
  Crown,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { usePageTitle } from "@/hooks/use-page-title";

type AgentCredit = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  agencyName: string | null;
  phone: string | null;
  agentPostCredits: number;
  subscriptionStatus: string | null;
  createdAt: string | null;
};

export default function AdminAgentCredits() {
  usePageTitle("Admin Agent Credits");
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [managingAgent, setManagingAgent] = useState<AgentCredit | null>(null);
  const [creditAction, setCreditAction] = useState<"add" | "deduct" | "set">("add");
  const [creditAmount, setCreditAmount] = useState(1);
  const [creditReason, setCreditReason] = useState("");

  const { data: agents = [], isLoading } = useQuery<AgentCredit[]>({
    queryKey: ["/api/admin/agent-credits"],
  });

  const updateCreditsMutation = useMutation({
    mutationFn: async ({ userId, action, amount, reason }: { userId: string; action: string; amount: number; reason: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/agent-credits/${userId}`, { action, amount, reason });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/agent-credits"] });
      toast({
        title: "Credits Updated",
        description: `Credits changed from ${data.previousCredits} to ${data.newCredits}`,
      });
      setManagingAgent(null);
      setCreditAction("add");
      setCreditAmount(1);
      setCreditReason("");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update credits", variant: "destructive" });
    },
  });

  if (user?.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  const filteredAgents = agents.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.firstName?.toLowerCase().includes(q) ||
      a.lastName?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.agencyName?.toLowerCase().includes(q)
    );
  });

  const totalCredits = agents.reduce((sum, a) => sum + a.agentPostCredits, 0);
  const agentsWithCredits = agents.filter(a => a.agentPostCredits > 0).length;

  const getSubscriptionBadge = (status: string | null) => {
    switch (status) {
      case "enterprise": return <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-[10px]">Enterprise</Badge>;
      case "premium": return <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px]">Premium</Badge>;
      case "standard": return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px]">Standard</Badge>;
      default: return <Badge variant="outline" className="text-[10px]">Free</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Agent Credit Management"
        description="View and manage job post credits for all agents"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-teal-500" />
            <div>
              <p className="text-2xl font-bold" data-testid="text-total-agents">{agents.length}</p>
              <p className="text-xs text-muted-foreground">Total Agents</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            <div>
              <p className="text-2xl font-bold" data-testid="text-total-credits">{totalCredits}</p>
              <p className="text-xs text-muted-foreground">Total Credits</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold" data-testid="text-agents-with-credits">{agentsWithCredits}</p>
              <p className="text-xs text-muted-foreground">With Credits</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Minus className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-2xl font-bold" data-testid="text-agents-no-credits">{agents.length - agentsWithCredits}</p>
              <p className="text-xs text-muted-foreground">No Credits</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            All Agents
          </CardTitle>
          <CardDescription>Manage job post credits for individual agents</CardDescription>
          <div className="pt-3">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or agency..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search-agents"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-10">
              <Briefcase className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {search ? "No agents match your search." : "No agents registered yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="hidden md:grid grid-cols-[1fr_120px_100px_100px_120px] gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                <span>Agent</span>
                <span>Credits</span>
                <span>Plan</span>
                <span>Joined</span>
                <span>Actions</span>
              </div>
              {filteredAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_120px_100px_100px_120px] gap-2 px-3 py-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors"
                  data-testid={`row-agent-${agent.id}`}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate" data-testid={`text-agent-name-${agent.id}`}>
                      {agent.firstName} {agent.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{agent.email}</p>
                    {agent.agencyName && (
                      <p className="text-xs text-muted-foreground/70 truncate flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> {agent.agencyName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-primary" />
                      <span className={`font-bold text-lg ${agent.agentPostCredits > 0 ? "text-green-600" : "text-muted-foreground"}`} data-testid={`text-credits-${agent.id}`}>
                        {agent.agentPostCredits}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getSubscriptionBadge(agent.subscriptionStatus)}
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-muted-foreground">
                      {agent.createdAt ? format(new Date(agent.createdAt), "MMM d, yyyy") : "-"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1"
                      onClick={() => {
                        setManagingAgent(agent);
                        setCreditAction("add");
                        setCreditAmount(1);
                        setCreditReason("");
                      }}
                      data-testid={`button-manage-credits-${agent.id}`}
                    >
                      <Settings className="w-3 h-3" />
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!managingAgent} onOpenChange={(open) => { if (!open) setManagingAgent(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              Manage Credits
            </DialogTitle>
            <DialogDescription>
              Adjust job post credits for this agent
            </DialogDescription>
          </DialogHeader>
          {managingAgent && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 border p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Agent</span>
                  <span className="font-medium">{managingAgent.firstName} {managingAgent.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-xs font-mono">{managingAgent.email}</span>
                </div>
                {managingAgent.agencyName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Agency</span>
                    <span>{managingAgent.agencyName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Credits</span>
                  <span className="font-bold text-lg text-primary" data-testid="text-current-credits">{managingAgent.agentPostCredits}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Action</Label>
                  <Select value={creditAction} onValueChange={(v) => setCreditAction(v as any)}>
                    <SelectTrigger data-testid="select-credit-action">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">Add Credits</SelectItem>
                      <SelectItem value="deduct">Deduct Credits</SelectItem>
                      <SelectItem value="set">Set Credits To</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    min={1}
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    data-testid="input-credit-amount"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Reason (optional)</Label>
                  <Textarea
                    placeholder="e.g. Promotional bonus, payment confirmed manually..."
                    value={creditReason}
                    onChange={(e) => setCreditReason(e.target.value)}
                    rows={2}
                    data-testid="input-credit-reason"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 p-3 text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">Preview:</p>
                <p className="text-blue-700 dark:text-blue-400 text-xs">
                  {creditAction === "add" && `Credits will change from ${managingAgent.agentPostCredits} → ${managingAgent.agentPostCredits + creditAmount}`}
                  {creditAction === "deduct" && `Credits will change from ${managingAgent.agentPostCredits} → ${Math.max(0, managingAgent.agentPostCredits - creditAmount)}`}
                  {creditAction === "set" && `Credits will be set to ${Math.max(0, creditAmount)}`}
                </p>
                <p className="text-blue-600/70 dark:text-blue-500/70 text-xs mt-1">The agent will receive a notification about this change.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setManagingAgent(null)} data-testid="button-cancel-credits">Cancel</Button>
            <Button
              onClick={() => {
                if (managingAgent) {
                  updateCreditsMutation.mutate({
                    userId: managingAgent.id,
                    action: creditAction,
                    amount: creditAmount,
                    reason: creditReason,
                  });
                }
              }}
              disabled={updateCreditsMutation.isPending}
              data-testid="button-confirm-credits"
            >
              {updateCreditsMutation.isPending ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
