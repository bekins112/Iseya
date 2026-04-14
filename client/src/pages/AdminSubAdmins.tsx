import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-extension";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Shield, UserPlus, MoreVertical, Trash2, Settings, Users, Briefcase, FileText, Eye, Crown, DollarSign, Ticket, Flag, ShieldCheck, Bell, SlidersHorizontal, Plus, Megaphone, Coins, Mail, MonitorPlay, Activity } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, AdminPermissions } from "@shared/schema";
import { usePageTitle } from "@/hooks/use-page-title";

interface AdminWithPermissions extends User {
  permissions?: AdminPermissions;
}

const defaultPermissions = {
  canManageUsers: false,
  canManageJobs: false,
  canManageApplications: false,
  canManageAdmins: false,
  canViewStats: true,
  canManageSubscriptions: false,
  canManageTransactions: false,
  canManageTickets: false,
  canManageReports: false,
  canManageVerifications: false,
  canManageNotifications: false,
  canManageAutomatedEmails: false,
  canManageAds: false,
  canManageAgentCredits: false,
  canManageSettings: false,
  canManageActivityLogs: false,
};

const permissionLabels = [
  { key: "canViewStats", label: "View Statistics", icon: Eye, description: "Can view platform stats and analytics" },
  { key: "canManageUsers", label: "Manage Users", icon: Users, description: "Can view, edit, and manage all users" },
  { key: "canManageJobs", label: "Manage Jobs", icon: Briefcase, description: "Can edit, activate/deactivate, and delete jobs" },
  { key: "canManageApplications", label: "Manage Applications", icon: FileText, description: "Can view and manage all applications" },
  { key: "canManageSubscriptions", label: "Manage Subscriptions", icon: Crown, description: "Can view and update user subscriptions" },
  { key: "canManageTransactions", label: "View Transactions", icon: DollarSign, description: "Can view transaction history and revenue stats" },
  { key: "canManageTickets", label: "Manage Tickets", icon: Ticket, description: "Can view and respond to support tickets" },
  { key: "canManageReports", label: "Manage Reports", icon: Flag, description: "Can review and resolve user reports" },
  { key: "canManageVerifications", label: "Manage Verifications", icon: ShieldCheck, description: "Can approve or reject verification requests" },
  { key: "canManageNotifications", label: "Send Notifications", icon: Bell, description: "Can create and manage platform notifications" },
  { key: "canManageAutomatedEmails", label: "Automated Emails", icon: Mail, description: "Can manage automated email schedules and send newsletters" },
  { key: "canManageAds", label: "Manage Ads & Popups", icon: Megaphone, description: "Can create and manage internal ads and popups" },
  { key: "canManageAgentCredits", label: "Manage Agent Credits", icon: Coins, description: "Can add, deduct, or set agent job post credits" },
  { key: "canManageSettings", label: "Platform Settings & Google Settings", icon: SlidersHorizontal, description: "Can modify pricing, platform configuration, and Google Settings (AdSense, Ads, Analytics)" },
  { key: "canManageActivityLogs", label: "Activity Logs", icon: Activity, description: "Can view and clear platform activity logs" },
  { key: "canManageAdmins", label: "Manage Admins", icon: Shield, description: "Can create and manage other sub-admins" },
];

export default function AdminSubAdmins() {
  usePageTitle("Admin Sub-Admins");
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminWithPermissions | null>(null);
  const [removingAdmin, setRemovingAdmin] = useState<AdminWithPermissions | null>(null);
  const [addMode, setAddMode] = useState<"existing" | "new">("new");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newAdminForm, setNewAdminForm] = useState({ email: "", password: "", firstName: "", lastName: "" });
  const [permissions, setPermissions] = useState({ ...defaultPermissions });

  const { data: admins = [], isLoading: adminsLoading } = useQuery<AdminWithPermissions[]>({
    queryKey: ["/api/admin/admins"],
  });

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const createAdminMutation = useMutation({
    mutationFn: async (data: { userId: string; permissions: typeof permissions }) => {
      return apiRequest("POST", "/api/admin/admins", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Sub-admin created successfully" });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create sub-admin", variant: "destructive" });
    },
  });

  const createNewAdminMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; firstName: string; lastName: string; permissions: typeof permissions }) => {
      const res = await apiRequest("POST", "/api/admin/admins/create-new", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "New admin account created successfully" });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (err: Error) => {
      const msg = err.message.includes(":") ? err.message.split(": ").slice(1).join(": ") : err.message;
      toast({ title: "Failed to create admin", description: msg, variant: "destructive" });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ userId, perms }: { userId: string; perms: Partial<AdminPermissions> }) => {
      return apiRequest("PATCH", `/api/admin/admins/${userId}/permissions`, perms);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admins"] });
      toast({ title: "Permissions updated successfully" });
      setEditingAdmin(null);
    },
    onError: () => {
      toast({ title: "Failed to update permissions", variant: "destructive" });
    },
  });

  const removeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("DELETE", `/api/admin/admins/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Admin removed successfully" });
      setRemovingAdmin(null);
    },
    onError: () => {
      toast({ title: "Failed to remove admin", variant: "destructive" });
    },
  });

  if (user?.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  const resetForm = () => {
    setSelectedUserId("");
    setNewAdminForm({ email: "", password: "", firstName: "", lastName: "" });
    setPermissions({ ...defaultPermissions });
    setAddMode("new");
  };

  const nonAdminUsers = allUsers.filter((u) => u.role !== "admin");

  const openEditDialog = (admin: AdminWithPermissions) => {
    setEditingAdmin(admin);
    if (admin.permissions) {
      setPermissions({
        canManageUsers: admin.permissions.canManageUsers || false,
        canManageJobs: admin.permissions.canManageJobs || false,
        canManageApplications: admin.permissions.canManageApplications || false,
        canManageAdmins: admin.permissions.canManageAdmins || false,
        canViewStats: admin.permissions.canViewStats !== false,
        canManageSubscriptions: admin.permissions.canManageSubscriptions || false,
        canManageTransactions: admin.permissions.canManageTransactions || false,
        canManageTickets: admin.permissions.canManageTickets || false,
        canManageReports: admin.permissions.canManageReports || false,
        canManageVerifications: admin.permissions.canManageVerifications || false,
        canManageNotifications: admin.permissions.canManageNotifications || false,
        canManageAutomatedEmails: admin.permissions.canManageAutomatedEmails || false,
        canManageAds: admin.permissions.canManageAds || false,
        canManageAgentCredits: admin.permissions.canManageAgentCredits || false,
        canManageSettings: admin.permissions.canManageSettings || false,
        canManageActivityLogs: admin.permissions.canManageActivityLogs || false,
      });
    }
  };

  const handleCreateAdmin = () => {
    if (addMode === "existing") {
      if (!selectedUserId) {
        toast({ title: "Please select a user", variant: "destructive" });
        return;
      }
      createAdminMutation.mutate({ userId: selectedUserId, permissions });
    } else {
      if (!newAdminForm.email || !newAdminForm.password || !newAdminForm.firstName || !newAdminForm.lastName) {
        toast({ title: "Please fill in all fields", variant: "destructive" });
        return;
      }
      if (newAdminForm.password.length < 6) {
        toast({ title: "Password must be at least 6 characters", variant: "destructive" });
        return;
      }
      createNewAdminMutation.mutate({ ...newAdminForm, permissions });
    }
  };

  const handleUpdatePermissions = () => {
    if (!editingAdmin) return;
    updatePermissionsMutation.mutate({ userId: editingAdmin.id, perms: permissions });
  };

  const isCreating = createAdminMutation.isPending || createNewAdminMutation.isPending;
  const canSubmit = addMode === "existing" ? !!selectedUserId : (!!newAdminForm.email && !!newAdminForm.password && !!newAdminForm.firstName && !!newAdminForm.lastName);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sub-Admin Management"
        description="Create and manage sub-admin accounts with custom access levels"
      />

      <div className="flex justify-end">
        <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-admin">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Sub-Admin
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Admins</CardTitle>
          <CardDescription>Manage existing admin accounts and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {adminsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No sub-admins yet</p>
              <p className="text-sm">Add your first sub-admin to help manage the platform</p>
            </div>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                  data-testid={`admin-row-${admin.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {admin.firstName && admin.lastName 
                          ? `${admin.firstName} ${admin.lastName}` 
                          : admin.email || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-wrap gap-1 max-w-[300px]">
                      {!admin.permissions ? (
                        <Badge className="text-xs">Full Access</Badge>
                      ) : (
                        <>
                          {admin.permissions.canViewStats && <Badge variant="outline" className="text-xs">Stats</Badge>}
                          {admin.permissions.canManageUsers && <Badge variant="outline" className="text-xs">Users</Badge>}
                          {admin.permissions.canManageJobs && <Badge variant="outline" className="text-xs">Jobs</Badge>}
                          {admin.permissions.canManageApplications && <Badge variant="outline" className="text-xs">Apps</Badge>}
                          {admin.permissions.canManageSubscriptions && <Badge variant="outline" className="text-xs">Subs</Badge>}
                          {admin.permissions.canManageTransactions && <Badge variant="outline" className="text-xs">Txns</Badge>}
                          {admin.permissions.canManageTickets && <Badge variant="outline" className="text-xs">Tickets</Badge>}
                          {admin.permissions.canManageReports && <Badge variant="outline" className="text-xs">Reports</Badge>}
                          {admin.permissions.canManageVerifications && <Badge variant="outline" className="text-xs">Verify</Badge>}
                          {admin.permissions.canManageNotifications && <Badge variant="outline" className="text-xs">Notifs</Badge>}
                          {admin.permissions.canManageAutomatedEmails && <Badge variant="outline" className="text-xs">Emails</Badge>}
                          {admin.permissions.canManageAds && <Badge variant="outline" className="text-xs">Ads</Badge>}
                          {admin.permissions.canManageAgentCredits && <Badge variant="outline" className="text-xs">Agent Credits</Badge>}
                          {admin.permissions.canManageSettings && <Badge variant="outline" className="text-xs">Settings</Badge>}
                          {admin.permissions.canManageSettings && <Badge variant="outline" className="text-xs">Google Ads</Badge>}
                          {admin.permissions.canManageActivityLogs && <Badge variant="outline" className="text-xs">Activity Logs</Badge>}
                          {admin.permissions.canManageAdmins && <Badge variant="outline" className="text-xs">Admins</Badge>}
                        </>
                      )}
                    </div>
                    {admin.id !== user?.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-admin-menu-${admin.id}`}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(admin)}>
                            <Settings className="w-4 h-4 mr-2" />
                            Edit Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setRemovingAdmin(admin)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Sub-Admin Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Sub-Admin</DialogTitle>
            <DialogDescription>
              Create a new admin account or promote an existing user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 overflow-y-auto flex-1">
            {/* Mode toggle */}
            <div className="flex rounded-lg border overflow-hidden">
              <button
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${addMode === "new" ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"}`}
                onClick={() => setAddMode("new")}
                data-testid="tab-create-new"
              >
                <Plus className="w-4 h-4 inline mr-1.5" />
                Create New Account
              </button>
              <button
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${addMode === "existing" ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"}`}
                onClick={() => setAddMode("existing")}
                data-testid="tab-existing-user"
              >
                <Users className="w-4 h-4 inline mr-1.5" />
                Existing User
              </button>
            </div>

            {addMode === "new" ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">First Name</Label>
                    <Input
                      placeholder="First name"
                      value={newAdminForm.firstName}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, firstName: e.target.value })}
                      data-testid="input-admin-firstname"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Last Name</Label>
                    <Input
                      placeholder="Last name"
                      value={newAdminForm.lastName}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, lastName: e.target.value })}
                      data-testid="input-admin-lastname"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={newAdminForm.email}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                    data-testid="input-admin-email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Password</Label>
                  <Input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={newAdminForm.password}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                    data-testid="input-admin-password"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Select User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger data-testid="select-user-for-admin">
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {nonAdminUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.firstName && u.lastName 
                          ? `${u.firstName} ${u.lastName} (${u.email})` 
                          : u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-3">
              <Label>Permissions</Label>
              {permissionLabels.map((perm) => (
                <div key={perm.key} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <perm.icon className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{perm.label}</p>
                      <p className="text-xs text-muted-foreground">{perm.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={permissions[perm.key as keyof typeof permissions]}
                    onCheckedChange={(checked) => 
                      setPermissions({ ...permissions, [perm.key]: checked })
                    }
                    data-testid={`switch-${perm.key}`}
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAdmin}
              disabled={isCreating || !canSubmit}
              data-testid="button-create-admin"
            >
              {isCreating ? "Creating..." : addMode === "new" ? "Create Admin Account" : "Promote to Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permissions Dialog */}
      <Dialog open={!!editingAdmin} onOpenChange={() => setEditingAdmin(null)}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
            <DialogDescription>
              Update permissions for {editingAdmin?.firstName || editingAdmin?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 overflow-y-auto flex-1">
            {permissionLabels.map((perm) => (
              <div key={perm.key} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <perm.icon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{perm.label}</p>
                    <p className="text-xs text-muted-foreground">{perm.description}</p>
                  </div>
                </div>
                <Switch
                  checked={permissions[perm.key as keyof typeof permissions]}
                  onCheckedChange={(checked) => 
                    setPermissions({ ...permissions, [perm.key]: checked })
                  }
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAdmin(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdatePermissions}
              disabled={updatePermissionsMutation.isPending}
              data-testid="button-save-permissions"
            >
              {updatePermissionsMutation.isPending ? "Saving..." : "Save Permissions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Admin Dialog */}
      <Dialog open={!!removingAdmin} onOpenChange={() => setRemovingAdmin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Admin</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove admin privileges from {removingAdmin?.firstName || removingAdmin?.email}? 
              They will be downgraded to a regular user.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemovingAdmin(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => removingAdmin && removeAdminMutation.mutate(removingAdmin.id)}
              disabled={removeAdminMutation.isPending}
              data-testid="button-confirm-remove-admin"
            >
              {removeAdminMutation.isPending ? "Removing..." : "Remove Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
