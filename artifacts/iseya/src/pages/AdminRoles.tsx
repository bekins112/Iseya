import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-extension";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Pencil,
  Users,
  Briefcase,
  FileText,
  Eye,
  Crown,
  DollarSign,
  Ticket,
  Flag,
  Bell,
  SlidersHorizontal,
  Megaphone,
  Coins,
  Mail,
  MonitorPlay,
  Activity,
  Building2,
  MessageCircle,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/use-page-title";
import type { AdminRole } from "@/lib/types";

const permissionLabels = [
  { key: "canViewStats", label: "View Statistics", icon: Eye },
  { key: "canManageUsers", label: "Manage Users", icon: Users },
  { key: "canManageJobs", label: "Manage Jobs", icon: Briefcase },
  { key: "canManageApplications", label: "Manage Applications", icon: FileText },
  { key: "canManageSubscriptions", label: "Manage Subscriptions", icon: Crown },
  { key: "canManageTransactions", label: "View Transactions", icon: DollarSign },
  { key: "canManageTickets", label: "Manage Tickets", icon: Ticket },
  { key: "canManageReports", label: "Manage Reports", icon: Flag },
  { key: "canManageVerifications", label: "Manage Verifications", icon: ShieldCheck },
  { key: "canManageNotifications", label: "Send Notifications", icon: Bell },
  { key: "canManageAutomatedEmails", label: "Automated Emails", icon: Mail },
  { key: "canManageAds", label: "Manage Ads & Popups", icon: Megaphone },
  { key: "canManageAgentCredits", label: "Manage Agent Credits", icon: Coins },
  { key: "canManageHiringCompanies", label: "Manage Hiring Companies", icon: Building2 },
  { key: "canManageGoogleSettings", label: "Google Settings", icon: MonitorPlay },
  { key: "canManageSettings", label: "Platform Settings", icon: SlidersHorizontal },
  { key: "canManageActivityLogs", label: "Activity Logs", icon: Activity },
  { key: "canManageChats", label: "Manage Live Chats", icon: MessageCircle },
  { key: "canManageAdmins", label: "Manage Admins", icon: Shield },
] as const;

type PermKey = (typeof permissionLabels)[number]["key"];

function emptyPerms(): Record<PermKey, boolean> {
  const init = {} as Record<PermKey, boolean>;
  for (const p of permissionLabels) init[p.key] = p.key === "canViewStats";
  return init;
}

export default function AdminRoles() {
  usePageTitle("Roles & Permissions");
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRole | null>(null);
  const [removing, setRemoving] = useState<AdminRole | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [perms, setPerms] = useState<Record<PermKey, boolean>>(emptyPerms());

  if (user && user.role !== "admin") return <Redirect to="/dashboard" />;

  const { data: roles = [], isLoading } = useQuery<AdminRole[]>({
    queryKey: ["/api/admin/roles"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/roles", {
        name: name.trim(),
        description: description.trim() || null,
        ...perms,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      toast({ title: "Role created" });
      closeDialog();
    },
    onError: (err: Error) => {
      const msg = err.message.includes(":") ? err.message.split(": ").slice(1).join(": ") : err.message;
      toast({ title: "Failed to create role", description: msg, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const res = await apiRequest("PATCH", `/api/admin/roles/${editing.id}`, {
        name: name.trim(),
        description: description.trim() || null,
        ...perms,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/my-permissions"] });
      toast({ title: "Role updated" });
      closeDialog();
    },
    onError: (err: Error) => {
      const msg = err.message.includes(":") ? err.message.split(": ").slice(1).join(": ") : err.message;
      toast({ title: "Failed to update role", description: msg, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admins"] });
      toast({ title: "Role deleted" });
      setRemoving(null);
    },
    onError: (err: Error) => {
      const msg = err.message.includes(":") ? err.message.split(": ").slice(1).join(": ") : err.message;
      toast({ title: "Failed to delete role", description: msg, variant: "destructive" });
    },
  });

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setPerms(emptyPerms());
    setDialogOpen(true);
  }

  function openEdit(role: AdminRole) {
    setEditing(role);
    setName(role.name);
    setDescription(role.description || "");
    const next = emptyPerms();
    for (const p of permissionLabels) next[p.key] = !!(role as any)[p.key];
    setPerms(next);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
  }

  const enabledCount = useMemo(
    () => Object.values(perms).filter(Boolean).length,
    [perms],
  );

  function handleSubmit() {
    if (!name.trim() || name.trim().length < 2) {
      toast({ title: "Role name is required (min 2 characters)", variant: "destructive" });
      return;
    }
    if (editing) updateMutation.mutate();
    else createMutation.mutate();
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Create reusable permission bundles, then assign them to sub-admins so everyone with the same role has the same access."
      />

      <div className="flex justify-end">
        <Button onClick={openCreate} data-testid="button-add-role">
          <Plus className="w-4 h-4 mr-2" />
          New Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Roles</CardTitle>
          <CardDescription>
            Each sub-admin can be assigned one role. Their effective permissions
            = the role's permissions plus any per-user overrides.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <ShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No roles yet</p>
              <p className="text-sm">Create your first role to standardize sub-admin access.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {roles.map((role) => {
                const grants = permissionLabels.filter(
                  (p) => !!(role as any)[p.key],
                );
                return (
                  <div
                    key={role.id}
                    className="flex items-start justify-between gap-4 p-4 rounded-lg border"
                    data-testid={`role-row-${role.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{role.name}</p>
                        {role.isSystem && <Badge variant="secondary">System</Badge>}
                        <Badge variant="outline" className="text-xs">
                          {role.adminCount ?? 0} {role.adminCount === 1 ? "admin" : "admins"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {grants.length} {grants.length === 1 ? "permission" : "permissions"}
                        </Badge>
                      </div>
                      {role.description && (
                        <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {grants.slice(0, 8).map((g) => (
                          <Badge key={g.key} variant="outline" className="text-xs">
                            {g.label}
                          </Badge>
                        ))}
                        {grants.length > 8 && (
                          <Badge variant="outline" className="text-xs">
                            +{grants.length - 8} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(role)}
                        data-testid={`button-edit-role-${role.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {!role.isSystem && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setRemoving(role)}
                          data-testid={`button-delete-role-${role.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => (o ? setDialogOpen(true) : closeDialog())}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Role" : "New Role"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Updating a role updates effective permissions for everyone assigned to it."
                : "Group permissions into a reusable role you can assign to sub-admins."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 overflow-y-auto flex-1">
            <div className="space-y-1.5">
              <Label className="text-xs">Role Name</Label>
              <Input
                placeholder="e.g. Support Lead, Finance, Content Manager"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-role-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description (optional)</Label>
              <Textarea
                placeholder="What this role is responsible for"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                data-testid="input-role-description"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Permissions</Label>
                <Badge variant="outline" className="text-xs">{enabledCount} enabled</Badge>
              </div>
              {permissionLabels.map((perm) => (
                <div key={perm.key} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <perm.icon className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{perm.label}</p>
                  </div>
                  <Switch
                    checked={perms[perm.key]}
                    onCheckedChange={(checked) => setPerms({ ...perms, [perm.key]: checked })}
                    data-testid={`switch-role-${perm.key}`}
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} data-testid="button-save-role">
              {isSubmitting ? "Saving..." : editing ? "Save Changes" : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!removing} onOpenChange={() => setRemoving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Delete role "{removing?.name}"? Any sub-admins assigned this role
              will lose its permissions but keep any per-user overrides.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => removing && deleteMutation.mutate(removing.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete-role"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
