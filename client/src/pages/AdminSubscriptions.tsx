import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-extension";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Crown, Building2, Calendar, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";
import { format } from "date-fns";

export default function AdminSubscriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ 
    subscriptionStatus: "free" as "free" | "premium", 
    subscriptionEndDate: "" 
  });

  const { data: employers = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/subscriptions", { status: statusFilter !== "all" ? statusFilter : undefined }],
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: { subscriptionStatus?: string; subscriptionEndDate?: string } }) => {
      return apiRequest("PATCH", `/api/admin/subscriptions/${userId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
      toast({ title: "Subscription updated successfully" });
      setEditingUser(null);
    },
    onError: () => {
      toast({ title: "Failed to update subscription", variant: "destructive" });
    },
  });

  if (user?.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  const filteredEmployers = employers.filter((e) => {
    const matchesSearch = !search || 
      e.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      e.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase()) ||
      e.companyName?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const premiumCount = employers.filter(e => e.subscriptionStatus === "premium").length;
  const freeCount = employers.filter(e => e.subscriptionStatus !== "premium").length;

  const openEditDialog = (employer: User) => {
    setEditingUser(employer);
    setEditForm({ 
      subscriptionStatus: (employer.subscriptionStatus as "free" | "premium") || "free",
      subscriptionEndDate: employer.subscriptionEndDate 
        ? format(new Date(employer.subscriptionEndDate), "yyyy-MM-dd") 
        : ""
    });
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    updateSubscriptionMutation.mutate({
      userId: editingUser.id,
      updates: {
        subscriptionStatus: editForm.subscriptionStatus,
        subscriptionEndDate: editForm.subscriptionEndDate || undefined,
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Management"
        description="Manage employer subscription plans"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Total Employers</span>
            </div>
            <p className="text-2xl font-bold">{employers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-muted-foreground">Premium</span>
            </div>
            <p className="text-2xl font-bold">{premiumCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Free Tier</span>
            </div>
            <p className="text-2xl font-bold">{freeCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search-subscriptions"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-subscription-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subscriptions</SelectItem>
                <SelectItem value="free">Free Tier</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredEmployers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No employers found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEmployers.map((employer) => (
                <div
                  key={employer.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  data-testid={`subscription-row-${employer.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {employer.profileImageUrl ? (
                        <img src={employer.profileImageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <Building2 className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {employer.companyName || `${employer.firstName || ""} ${employer.lastName || ""}`.trim() || employer.email}
                      </p>
                      <p className="text-sm text-muted-foreground">{employer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      {employer.subscriptionStatus === "premium" ? (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Free</Badge>
                      )}
                      {employer.subscriptionEndDate && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Expires: {format(new Date(employer.subscriptionEndDate), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-subscription-menu-${employer.id}`}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(employer)}>
                          Edit Subscription
                        </DropdownMenuItem>
                        {employer.subscriptionStatus !== "premium" ? (
                          <DropdownMenuItem 
                            onClick={() => updateSubscriptionMutation.mutate({ 
                              userId: employer.id, 
                              updates: { subscriptionStatus: "premium" } 
                            })}
                          >
                            Upgrade to Premium
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => updateSubscriptionMutation.mutate({ 
                              userId: employer.id, 
                              updates: { subscriptionStatus: "free" } 
                            })}
                          >
                            Downgrade to Free
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Subscription Status</Label>
              <Select 
                value={editForm.subscriptionStatus} 
                onValueChange={(v: "free" | "premium") => setEditForm({ ...editForm, subscriptionStatus: v })}
              >
                <SelectTrigger data-testid="select-edit-subscription">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editForm.subscriptionStatus === "premium" && (
              <div className="space-y-2">
                <Label>Subscription End Date</Label>
                <Input
                  type="date"
                  value={editForm.subscriptionEndDate}
                  onChange={(e) => setEditForm({ ...editForm, subscriptionEndDate: e.target.value })}
                  data-testid="input-subscription-end-date"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              disabled={updateSubscriptionMutation.isPending}
              data-testid="button-save-subscription"
            >
              {updateSubscriptionMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
