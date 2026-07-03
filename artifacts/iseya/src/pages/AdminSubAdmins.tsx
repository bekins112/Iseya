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
import { Shield, UserPlus, MoreVertical, Trash2, Settings, Users, Briefcase, FileText, Eye, Crown, DollarSign, Ticket, Flag, ShieldCheck, Bell, SlidersHorizontal, Plus, Megaphone, Coins, Mail, MonitorPlay, Activity, Building2, MessageCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, AdminPermissions, AdminRole } from "@/lib/types";
import { usePageTitle } from "@/hooks/use-page-title";
import { RoleColorDot } from "@/lib/roleColor";

interface AdminWithPermissions extends User {
  permissions?: AdminPermissions;
  assignedRole?: AdminRole | null;
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
  canManageHiringCompanies: false,
  canManageGoogleSettings: false,
  canManageChats: false,
  canManageJobAid: false,
};

const permissionLabels = [
  { key: "canViewStats", label: "View Statistics", short: "Stats", icon: Eye, description: "Can view platform stats and analytics" },
  { key: "canManageUsers", label: "Manage Users", short: "Users", icon: Users, description: "Can view, edit, and manage all users" },
  { key: "canManageJobs", label: "Manage Jobs", short: "Jobs", icon: Briefcase, description: "Can edit, activate/deactivate, and delete jobs" },
  { key: "canManageApplications", label: "Manage Applications", short: "Apps", icon: FileText, description: "Can view and manage all applications" },
  { key: "canManageSubscriptions", label: "Manage Subscriptions", short: "Subs", icon: Crown, description: "Can view and update user subscriptions" },
  { key: "canManageTransactions", label: "View Transactions", short: "Txns", icon: DollarSign, description: "Can view transaction history and revenue stats" },
  { key: "canManageTickets", label: "Manage Tickets", short: "Tickets", icon: Ticket, description: "Can view and respond to support tickets" },
  { key: "canManageReports", label: "Manage Reports", short: "Reports", icon: Flag, description: "Can review and resolve user reports" },
  { key: "canManageVerifications", label: "Manage Verifications", short: "Verify", icon: ShieldCheck, description: "Can approve or reject verification requests" },
  { key: "canManageNotifications", label: "Send Notifications", short: "Notifs", icon: Bell, description: "Can create and manage platform notifications" },
  { key: "canManageAutomatedEmails", label: "Automated Emails", short: "Emails", icon: Mail, description: "Can manage automated email schedules and send newsletters" },
  { key: "canManageAds", label: "Manage Ads & Popups", short: "Ads", icon: Megaphone, description: "Can create and manage internal ads and popups" },
  { key: "canManageAgentCredits", label: "Manage Agent Credits", short: "Agent Credits", icon: Coins, description: "Can add, deduct, or set agent job post credits" },
  { key: "canManageHiringCompanies", label: "Manage Hiring Companies", short: "Hiring Companies", icon: Building2, description: "Can add, edit, and remove featured hiring companies" },
  { key: "canManageGoogleSettings", label: "Google Settings", short: "Google Settings", icon: MonitorPlay, description: "Can configure Google AdSense, Google Ads, and Analytics" },
  { key: "canManageSettings", label: "Platform Settings", short: "Settings", icon: SlidersHorizontal, description: "Can modify pricing and platform-wide configuration" },
  { key: "canManageActivityLogs", label: "Activity Logs", short: "Activity Logs", icon: Activity, description: "Can view and clear platform activity logs" },
  { key: "canManageChats", label: "Manage Live Chats", short: "Chats", icon: MessageCircle, description: "Can take over visitor chats from the bot and reply as the Iṣéyá team" },
  { key: "canManageJobAid", label: "Manage Job-Aid", short: "Job-Aid", icon: Briefcase, description: "Can view and fulfill applicant Job-Aid feature requests" },
  { key: "canManageAdmins", label: "Manage Admins", short: "Admins", icon: Shield, description: "Can create and manage other sub-admins" },
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
  const [selectedRoleId, setSelectedRoleId] = useState<string>("none");

  const { data: admins = [], isLoading: adminsLoading } = useQuery<AdminWithPermissions[]>({
    queryKey: ["/api/admin/admins"],
  });

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: roles = [] } = useQuery<AdminRole[]>({
    queryKey: ["/api/admin/roles"],
  });

  const createAdminMutation = useMutation({
    mutationFn: async (data: { userId: string; roleId: number | null; permissions: typeof permissions }) => {
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
    mutationFn: async (data: { email: string; password: string; firstName: string; lastName: string; roleId: number | null; permissions: typeof permissions }) => {
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
    setSelectedRoleId("none");
    setAddMode("new");
  };

  const nonAdminUsers = allUsers.filter((u) => u.role !== "admin");

  const openEditDialog = (admin: AdminWithPermissions) => {
    setEditingAdmin(admin);
    setSelectedRoleId(admin.permissions?.roleId ? String(admin.permissions.roleId) : "none");
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
        canManageHiringCompanies: admin.permissions.canManageHiringCompanies || false,
        canManageGoogleSettings: admin.permissions.canManageGoogleSettings || false,
        canManageChats: admin.permissions.canManageChats || false,
        canManageJobAid: admin.permissions.canManageJobAid || false,
      });
    }
  };

  const handleCreateAdmin = () => {
    const roleId = selectedRoleId === "none" ? null : Number(selectedRoleId);
    if (addMode === "existing") {
      if (!selectedUserId) {
        toast({ title: "Please select a user", variant: "destructive" });
        return;
      }
      createAdminMutation.mutate({ userId: selectedUserId, roleId, permissions });
    } else {
      if (!newAdminForm.email || !newAdminForm.password || !newAdminForm.firstName || !newAdminForm.lastName) {
        toast({ title: "Please fill in all fields", variant: "destructive" });
        return;
      }
      if (newAdminForm.password.length < 6) {
        toast({ title: "Password must be at least 6 characters", variant: "destructive" });
        return;
      }
      createNewAdminMutation.mutate({ ...newAdminForm, roleId, permissions });
    }
  };

  const handleUpdatePermissions = () => {
    if (!editingAdmin) return;
    const roleId = selectedRoleId === "none" ? null : Number(selectedRoleId);
    updatePermissionsMutation.mutate({ userId: editingAdmin.id, perms: { ...permissions, roleId } });
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
              {admins.map((admin) => {
                const role = admin.assignedRole;
                const perms = admin.permissions;
                const fromRole = (key: string) =>
                  !!role && !!role[key as keyof AdminRole];
                const overrideOnly = (key: string) =>
                  !!perms && !!perms[key as keyof AdminPermissions] && !fromRole(key);
                const roleBadges = perms
                  ? permissionLabels.filter((p) => fromRole(p.key))
                  : [];
                const overrideBadges = perms
                  ? permissionLabels.filter((p) => overrideOnly(p.key))
                  : [];
                const hasAny = roleBadges.length > 0 || overrideBadges.length > 0;
                return (
                <div
                  key={admin.id}
                  className="flex items-start md:items-center justify-between gap-3 p-4 rounded-lg border"
                  data-testid={`admin-row-${admin.id}`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {admin.firstName && admin.lastName 
                          ? `${admin.firstName} ${admin.lastName}` 
                          : admin.email || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{admin.email}</p>
                      {/* Mobile-only role + permissions summary */}
                      <details
                        className="md:hidden mt-2 group"
                        data-testid={`admin-badges-mobile-${admin.id}`}
                      >
                        <summary className="list-none cursor-pointer flex flex-wrap items-center gap-1.5 text-xs">
                          {role ? (
                            <Badge
                              className="text-xs bg-primary/15 text-primary border-primary/30 hover:bg-primary/20"
                              data-testid={`admin-role-badge-mobile-${admin.id}`}
                            >
                              <RoleColorDot
                                color={role.color}
                                className="mr-1"
                                data-testid={`admin-role-color-mobile-${admin.id}`}
                              />
                              {role.name}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">No role</Badge>
                          )}
                          {!perms ? (
                            <Badge className="text-xs">Full Access</Badge>
                          ) : (
                            <span className="text-muted-foreground">
                              {roleBadges.length} from role
                              {overrideBadges.length > 0 && ` • ${overrideBadges.length} override${overrideBadges.length === 1 ? "" : "s"}`}
                            </span>
                          )}
                          {perms && hasAny && (
                            <span className="text-[10px] text-primary underline-offset-2 group-open:hidden">
                              show
                            </span>
                          )}
                          {perms && hasAny && (
                            <span className="text-[10px] text-primary underline-offset-2 hidden group-open:inline">
                              hide
                            </span>
                          )}
                        </summary>
                        {perms && hasAny && (
                          <div className="mt-2 space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {roleBadges.map((p) => (
                                <Badge
                                  key={`m-role-${p.key}`}
                                  title={`From role${role ? ` "${role.name}"` : ""}: ${p.label}`}
                                  className="text-xs bg-primary/10 text-primary border-primary/30 hover:bg-primary/15"
                                  data-testid={`badge-mobile-role-${admin.id}-${p.key}`}
                                >
                                  {p.short}
                                </Badge>
                              ))}
                              {overrideBadges.map((p) => (
                                <Badge
                                  key={`m-override-${p.key}`}
                                  variant="outline"
                                  title={`Per-user override: ${p.label}`}
                                  className="text-xs"
                                  data-testid={`badge-mobile-override-${admin.id}-${p.key}`}
                                >
                                  {p.short}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-2 items-center text-[10px] text-muted-foreground">
                              {roleBadges.length > 0 && (
                                <span className="inline-flex items-center gap-1">
                                  <span className="inline-block w-2 h-2 rounded-sm bg-primary/40 border border-primary/40" />
                                  from role
                                </span>
                              )}
                              {overrideBadges.length > 0 && (
                                <span className="inline-flex items-center gap-1">
                                  <span className="inline-block w-2 h-2 rounded-sm border border-border bg-background" />
                                  per-user override
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </details>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="hidden md:flex flex-col items-end gap-1 max-w-[360px]"
                      data-testid={`admin-badges-${admin.id}`}
                    >
                      <div className="flex flex-wrap gap-1 justify-end items-center">
                        {role && (
                          <Badge
                            className="text-xs bg-primary/15 text-primary border-primary/30 hover:bg-primary/20"
                            data-testid={`admin-role-badge-${admin.id}`}
                          >
                            <RoleColorDot
                              color={role.color}
                              className="mr-1"
                              data-testid={`admin-role-color-${admin.id}`}
                            />
                            {role.name}
                          </Badge>
                        )}
                        {!perms ? (
                          <Badge className="text-xs">Full Access</Badge>
                        ) : (
                          <>
                            {roleBadges.map((p) => (
                              <Badge
                                key={`role-${p.key}`}
                                title={`From role${role ? ` "${role.name}"` : ""}: ${p.label}`}
                                className="text-xs bg-primary/10 text-primary border-primary/30 hover:bg-primary/15"
                                data-testid={`badge-role-${admin.id}-${p.key}`}
                              >
                                {p.short}
                              </Badge>
                            ))}
                            {overrideBadges.map((p) => (
                              <Badge
                                key={`override-${p.key}`}
                                variant="outline"
                                title={`Per-user override: ${p.label}`}
                                className="text-xs"
                                data-testid={`badge-override-${admin.id}-${p.key}`}
                              >
                                {p.short}
                              </Badge>
                            ))}
                          </>
                        )}
                      </div>
                      {perms && hasAny && (role || overrideBadges.length > 0) && (
                        <div className="flex flex-wrap gap-2 items-center text-[10px] text-muted-foreground justify-end">
                          {role && roleBadges.length > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <span className="inline-block w-2 h-2 rounded-sm bg-primary/40 border border-primary/40" />
                              from role
                            </span>
                          )}
                          {overrideBadges.length > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <span className="inline-block w-2 h-2 rounded-sm border border-border bg-background" />
                              per-user override
                            </span>
                          )}
                        </div>
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
                );
              })}
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

            <div className="space-y-1.5">
              <Label className="text-xs">Role (optional)</Label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger data-testid="select-role-add">
                  <SelectValue placeholder="No role — use per-user permissions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No role — use per-user permissions only</SelectItem>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      <span className="inline-flex items-center gap-2">
                        <RoleColorDot color={r.color} />
                        {r.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Effective permissions = role permissions + any per-user toggles below.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Per-user Overrides</Label>
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
          {(() => {
            const previewRole =
              selectedRoleId === "none"
                ? null
                : roles.find((r) => String(r.id) === selectedRoleId) ?? null;
            const fromRole = (key: string) =>
              !!previewRole && !!previewRole[key as keyof AdminRole];
            const effective = (key: string) =>
              fromRole(key) || !!permissions[key as keyof typeof permissions];
            const effectiveCount = permissionLabels.filter((p) => effective(p.key)).length;
            const fromRoleCount = permissionLabels.filter((p) => fromRole(p.key)).length;
            const overrideOnlyCount = permissionLabels.filter(
              (p) => !fromRole(p.key) && !!permissions[p.key as keyof typeof permissions],
            ).length;
            return (
              <div className="space-y-3 py-4 overflow-y-auto flex-1">
                <div className="space-y-1.5">
                  <Label className="text-xs">Role</Label>
                  <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                    <SelectTrigger data-testid="select-role-edit">
                      <SelectValue placeholder="No role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No role — use per-user permissions only</SelectItem>
                      {roles.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          <span className="inline-flex items-center gap-2">
                            <RoleColorDot color={r.color} />
                            {r.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Effective access = role permissions OR per-user overrides below.
                  </p>
                </div>

                <div
                  className="rounded-lg border bg-muted/30 p-3 space-y-1.5"
                  data-testid="effective-access-summary"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Effective access</p>
                    <Badge variant="secondary" className="text-xs">
                      {effectiveCount} / {permissionLabels.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {previewRole ? (
                      <>
                        <span className="font-medium text-foreground">{fromRoleCount}</span> from role
                        {" "}<span className="font-medium text-foreground">{previewRole.name}</span>,{" "}
                        <span className="font-medium text-foreground">{overrideOnlyCount}</span> from per-user overrides.
                      </>
                    ) : (
                      <>
                        No role assigned —{" "}
                        <span className="font-medium text-foreground">{overrideOnlyCount}</span> from per-user overrides.
                      </>
                    )}
                  </p>
                </div>

                <Label>Per-user Overrides</Label>
                {permissionLabels.map((perm) => {
                  const grantedByRole = fromRole(perm.key);
                  const overrideOn = !!permissions[perm.key as keyof typeof permissions];
                  const isEffective = grantedByRole || overrideOn;
                  return (
                    <div
                      key={perm.key}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        grantedByRole ? "bg-primary/5 border-primary/20" : ""
                      }`}
                      data-testid={`edit-perm-row-${perm.key}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <perm.icon
                          className={`w-4 h-4 shrink-0 ${
                            isEffective ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-medium">{perm.label}</p>
                            {grantedByRole && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 h-4 border-primary/40 text-primary bg-primary/10"
                                data-testid={`badge-from-role-${perm.key}`}
                              >
                                <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />
                                from role
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {grantedByRole
                              ? `Already granted by ${previewRole?.name ?? "role"}${
                                  overrideOn ? " (override also on)" : ""
                                }`
                              : perm.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={overrideOn}
                        onCheckedChange={(checked) =>
                          setPermissions({ ...permissions, [perm.key]: checked })
                        }
                        data-testid={`switch-edit-${perm.key}`}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })()}
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
