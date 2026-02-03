import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-extension";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Shield, UserPlus, MoreVertical, Trash2, Settings, Users, Briefcase, FileText, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, AdminPermissions } from "@shared/schema";

interface AdminWithPermissions extends User {
  permissions?: AdminPermissions;
}

export default function AdminSubAdmins() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminWithPermissions | null>(null);
  const [removingAdmin, setRemovingAdmin] = useState<AdminWithPermissions | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [permissions, setPermissions] = useState({
    canManageUsers: false,
    canManageJobs: false,
    canManageApplications: false,
    canManageAdmins: false,
    canViewStats: true,
  });

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
    setPermissions({
      canManageUsers: false,
      canManageJobs: false,
      canManageApplications: false,
      canManageAdmins: false,
      canViewStats: true,
    });
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
      });
    }
  };

  const handleCreateAdmin = () => {
    if (!selectedUserId) {
      toast({ title: "Please select a user", variant: "destructive" });
      return;
    }
    createAdminMutation.mutate({ userId: selectedUserId, permissions });
  };

  const handleUpdatePermissions = () => {
    if (!editingAdmin) return;
    updatePermissionsMutation.mutate({ userId: editingAdmin.id, perms: permissions });
  };

  const permissionLabels = [
    { key: "canViewStats", label: "View Statistics", icon: Eye, description: "Can view platform stats and analytics" },
    { key: "canManageUsers", label: "Manage Users", icon: Users, description: "Can view, edit, and verify users" },
    { key: "canManageJobs", label: "Manage Jobs", icon: Briefcase, description: "Can edit, activate/deactivate, and delete jobs" },
    { key: "canManageApplications", label: "Manage Applications", icon: FileText, description: "Can view all applications" },
    { key: "canManageAdmins", label: "Manage Admins", icon: Shield, description: "Can create and manage other sub-admins" },
  ];

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
                    <div className="hidden md:flex flex-wrap gap-1">
                      {admin.permissions?.canManageUsers && (
                        <Badge variant="outline" className="text-xs">Users</Badge>
                      )}
                      {admin.permissions?.canManageJobs && (
                        <Badge variant="outline" className="text-xs">Jobs</Badge>
                      )}
                      {admin.permissions?.canManageApplications && (
                        <Badge variant="outline" className="text-xs">Apps</Badge>
                      )}
                      {admin.permissions?.canManageAdmins && (
                        <Badge variant="outline" className="text-xs">Admins</Badge>
                      )}
                      {!admin.permissions && (
                        <Badge className="text-xs">Full Access</Badge>
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

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Sub-Admin</DialogTitle>
            <DialogDescription>
              Select a user and configure their admin permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
              disabled={createAdminMutation.isPending || !selectedUserId}
              data-testid="button-create-admin"
            >
              {createAdminMutation.isPending ? "Creating..." : "Create Sub-Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingAdmin} onOpenChange={() => setEditingAdmin(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
            <DialogDescription>
              Update permissions for {editingAdmin?.firstName || editingAdmin?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
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
