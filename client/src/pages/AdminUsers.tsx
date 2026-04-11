import { useState } from "react";
import { calculateAge, getAge, getMaxDobFor18, getMinDobDate } from "@/lib/age-utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-extension";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Search, Users, Building2, UserCheck, Shield, MoreVertical,
  CheckCircle, XCircle, Eye, Pencil, Ban, Trash2, AlertTriangle,
  Mail, Phone, MapPin, Calendar, Crown, Briefcase, KeyRound, Copy, Clock,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";
import { ExportButton } from "@/components/ExportButton";
import { usePageTitle } from "@/hooks/use-page-title";

const userExportColumns = [
  { key: "id", label: "ID" },
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "role", label: "Role" },
  { key: "subscriptionTier", label: "Subscription Tier", transform: (v: any) => v || "free" },
  { key: "subscriptionExpiry", label: "Subscription Expiry", transform: (v: any) => v ? new Date(v).toLocaleDateString() : "" },
  { key: "isVerified", label: "Verified", transform: (v: any) => v ? "Yes" : "No" },
  { key: "isSuspended", label: "Suspended", transform: (v: any) => v ? "Yes" : "No" },
  { key: "suspendedReason", label: "Suspend Reason" },
  { key: "state", label: "State" },
  { key: "city", label: "City" },
  { key: "location", label: "Location" },
  { key: "bio", label: "Bio" },
  { key: "companyName", label: "Company Name" },
  { key: "createdAt", label: "Joined", transform: (v: any) => v ? new Date(v).toLocaleDateString() : "" },
];

export default function AdminUsers() {
  usePageTitle("Admin Users");
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [suspendingUser, setSuspendingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [tempPasswordUser, setTempPasswordUser] = useState<User | null>(null);
  const [tempPasswordResult, setTempPasswordResult] = useState<{
    tempPassword: string;
    expiresAt: string;
    userEmail: string;
    userName: string;
  } | null>(null);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users", roleFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (search) params.set("search", search);
      const url = `/api/admin/users${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      return apiRequest("PATCH", `/api/admin/users/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated successfully" });
      setEditingUser(null);
      setSuspendingUser(null);
    },
    onError: (err: any) => {
      toast({ title: err.message || "Failed to update user", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User deleted successfully" });
      setDeletingUser(null);
    },
    onError: (err: any) => {
      toast({ title: err.message || "Failed to delete user", variant: "destructive" });
    },
  });

  const tempPasswordMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/users/${id}/temp-password`);
      return res.json();
    },
    onSuccess: (data) => {
      setTempPasswordResult(data);
    },
    onError: (err: any) => {
      toast({ title: err.message || "Failed to generate temporary password", variant: "destructive" });
      setTempPasswordUser(null);
    },
  });

  if (user?.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch = !search ||
      u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const getRoleIcon = (role: string | null) => {
    switch (role) {
      case "employer": return <Building2 className="w-4 h-4" />;
      case "agent": return <Briefcase className="w-4 h-4" />;
      case "admin": return <Shield className="w-4 h-4" />;
      default: return <UserCheck className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case "employer": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "agent": return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200";
      case "admin": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  const getSubscriptionColor = (status: string | null) => {
    switch (status) {
      case "enterprise": return "bg-gradient-to-r from-yellow-500 to-amber-500 text-white";
      case "premium": return "bg-gradient-to-r from-purple-500 to-indigo-500 text-white";
      case "standard": return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const openEditDialog = (u: User) => {
    setEditingUser(u);
    setEditForm({
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      email: u.email || "",
      role: u.role || "applicant",
      phone: u.phone || "",
      location: u.location || "",
      bio: u.bio || "",
      dateOfBirth: u.dateOfBirth || "",
      gender: u.gender || "",
      isVerified: u.isVerified || false,
      subscriptionStatus: u.subscriptionStatus || "free",
      subscriptionEndDate: u.subscriptionEndDate ? new Date(u.subscriptionEndDate).toISOString().split("T")[0] : "",
      companyName: u.companyName || "",
      businessCategory: u.businessCategory || "",
    });
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    const updates: Record<string, any> = { ...editForm };
    if (updates.dateOfBirth) {
      updates.age = calculateAge(updates.dateOfBirth);
    }
    if (!updates.subscriptionEndDate) updates.subscriptionEndDate = null;
    if (!updates.phone) updates.phone = null;
    if (!updates.location) updates.location = null;
    if (!updates.bio) updates.bio = null;
    if (!updates.gender) updates.gender = null;
    if (!updates.companyName) updates.companyName = null;
    if (!updates.businessCategory) updates.businessCategory = null;
    updateUserMutation.mutate({ id: editingUser.id, updates });
  };

  const handleSuspend = (u: User) => {
    updateUserMutation.mutate({
      id: u.id,
      updates: {
        isSuspended: true,
        suspendedReason: suspendReason || "Violated platform terms",
      },
    });
  };

  const handleUnsuspend = (u: User) => {
    updateUserMutation.mutate({
      id: u.id,
      updates: { isSuspended: false },
    });
  };

  const totalUsers = users.length;
  const applicantCount = users.filter(u => u.role === "applicant").length;
  const employerCount = users.filter(u => u.role === "employer").length;
  const agentCount = users.filter(u => u.role === "agent").length;
  const suspendedCount = users.filter(u => u.isSuspended).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Users"
        description="View, edit, suspend, and manage all platform users"
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="text-2xl font-bold" data-testid="text-total-users">{totalUsers}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold" data-testid="text-total-applicants">{applicantCount}</p>
              <p className="text-xs text-muted-foreground">Applicants</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-2xl font-bold" data-testid="text-total-employers">{employerCount}</p>
              <p className="text-xs text-muted-foreground">Employers</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-teal-500" />
            <div>
              <p className="text-2xl font-bold" data-testid="text-total-agents">{agentCount}</p>
              <p className="text-xs text-muted-foreground">Agents</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-2xl font-bold" data-testid="text-total-suspended">{suspendedCount}</p>
              <p className="text-xs text-muted-foreground">Suspended</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search-users"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-role-filter">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="applicant">Applicants</SelectItem>
                <SelectItem value="employer">Employers</SelectItem>
                <SelectItem value="agent">Agents</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <ExportButton
              data={filteredUsers}
              columns={userExportColumns}
              filename="users"
              totalLabel="users"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className={`flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors ${u.isSuspended ? "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20" : ""}`}
                  data-testid={`user-row-${u.id}`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      {u.profileImageUrl ? (
                        <img src={u.profileImageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <span className="text-sm font-medium">
                          {u.firstName?.[0] || u.email?.[0] || "?"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">
                          {u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email || "Unknown"}
                        </p>
                        {u.isVerified && (
                          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                        )}
                        {u.isSuspended && (
                          <Badge variant="destructive" className="text-xs shrink-0">Suspended</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Badge className={`${getRoleColor(u.role)} hidden sm:flex`}>
                      <span className="flex items-center gap-1">
                        {getRoleIcon(u.role)}
                        {u.role || "applicant"}
                      </span>
                    </Badge>
                    <Badge className={`${getSubscriptionColor(u.subscriptionStatus)} hidden md:flex text-xs`}>
                      {u.subscriptionStatus || "free"}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-user-menu-${u.id}`}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewingUser(u)} data-testid={`button-view-user-${u.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(u)} data-testid={`button-edit-user-${u.id}`}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateUserMutation.mutate({
                            id: u.id,
                            updates: { isVerified: !u.isVerified }
                          })}
                        >
                          {u.isVerified ? (
                            <><XCircle className="w-4 h-4 mr-2" />Remove Verification</>
                          ) : (
                            <><CheckCircle className="w-4 h-4 mr-2" />Verify User</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {u.isSuspended ? (
                          <DropdownMenuItem onClick={() => handleUnsuspend(u)}>
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            Unsuspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => { setSuspendingUser(u); setSuspendReason(""); }}
                            className="text-orange-600"
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        )}
                        {u.role !== "admin" && (
                          <DropdownMenuItem
                            onClick={() => {
                              setTempPasswordUser(u);
                              setTempPasswordResult(null);
                            }}
                            data-testid={`button-temp-password-${u.id}`}
                          >
                            <KeyRound className="w-4 h-4 mr-2" />
                            Support Access
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => setDeletingUser(u)}
                          className="text-red-600"
                          data-testid={`button-delete-user-${u.id}`}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View User Details Dialog */}
      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              User Details
              {viewingUser?.isSuspended && <Badge variant="destructive">Suspended</Badge>}
            </DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center shrink-0">
                  {viewingUser.profileImageUrl ? (
                    <img src={viewingUser.profileImageUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold">
                      {viewingUser.firstName?.[0] || "?"}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold" data-testid="text-view-user-name">
                    {viewingUser.firstName} {viewingUser.lastName}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getRoleColor(viewingUser.role)}>
                      {getRoleIcon(viewingUser.role)}
                      <span className="ml-1">{viewingUser.role || "applicant"}</span>
                    </Badge>
                    {viewingUser.isVerified && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" /> Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{viewingUser.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{viewingUser.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{viewingUser.location || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Joined: {viewingUser.createdAt ? new Date(viewingUser.createdAt).toLocaleDateString() : "—"}</span>
                </div>
              </div>

              {viewingUser.bio && (
                <div>
                  <p className="text-sm font-medium mb-1">Bio</p>
                  <p className="text-sm text-muted-foreground">{viewingUser.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Age</p>
                  <p className="font-medium">{getAge(viewingUser) || "—"}{getAge(viewingUser) ? " years" : ""}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{viewingUser.gender || "—"}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium">Subscription</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getSubscriptionColor(viewingUser.subscriptionStatus)}>
                    {viewingUser.subscriptionStatus || "free"}
                  </Badge>
                  {viewingUser.subscriptionEndDate && (
                    <span className="text-xs text-muted-foreground">
                      Expires: {new Date(viewingUser.subscriptionEndDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {viewingUser.role === "employer" && (
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium">Company Info</p>
                  </div>
                  <div className="grid gap-1 text-sm">
                    <p><span className="text-muted-foreground">Company:</span> {viewingUser.companyName || "—"}</p>
                    <p><span className="text-muted-foreground">Category:</span> {viewingUser.businessCategory || "—"}</p>
                    <p><span className="text-muted-foreground">Address:</span> {viewingUser.companyAddress || "—"}</p>
                  </div>
                </div>
              )}

              {viewingUser.isSuspended && viewingUser.suspendedReason && (
                <div className="p-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
                  <p className="text-sm font-medium text-red-600 mb-1">Suspension Reason</p>
                  <p className="text-sm">{viewingUser.suspendedReason}</p>
                  {viewingUser.suspendedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Suspended on: {new Date(viewingUser.suspendedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setViewingUser(null)}>Close</Button>
                <Button onClick={() => { setViewingUser(null); openEditDialog(viewingUser); }} data-testid="button-edit-from-view">
                  <Pencil className="w-4 h-4 mr-2" /> Edit User
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              {editingUser?.firstName} {editingUser?.lastName} ({editingUser?.email})
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="role">Role & Access</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-firstName">First Name</Label>
                  <Input
                    id="edit-firstName"
                    value={editForm.firstName || ""}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    data-testid="input-edit-first-name"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input
                    id="edit-lastName"
                    value={editForm.lastName || ""}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    data-testid="input-edit-last-name"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email || ""}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  data-testid="input-edit-email"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone || ""}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  data-testid="input-edit-phone"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editForm.location || ""}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  data-testid="input-edit-location"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-dob">Date of Birth</Label>
                  <Input
                    id="edit-dob"
                    type="date"
                    max={getMaxDobFor18()}
                    min={getMinDobDate()}
                    value={editForm.dateOfBirth || ""}
                    onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                    data-testid="input-edit-dob"
                  />
                  {editForm.dateOfBirth && (
                    <p className="text-xs text-muted-foreground">Age: {calculateAge(editForm.dateOfBirth)} years</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-gender">Gender</Label>
                  <Select value={editForm.gender || ""} onValueChange={(v) => setEditForm({ ...editForm, gender: v })}>
                    <SelectTrigger data-testid="select-edit-gender">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-bio">Bio</Label>
                <Textarea
                  id="edit-bio"
                  value={editForm.bio || ""}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                  data-testid="input-edit-bio"
                />
              </div>
              {editForm.role === "employer" && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="edit-company">Company Name</Label>
                    <Input
                      id="edit-company"
                      value={editForm.companyName || ""}
                      onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                      data-testid="input-edit-company"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="edit-businessCategory">Business Category</Label>
                    <Input
                      id="edit-businessCategory"
                      value={editForm.businessCategory || ""}
                      onChange={(e) => setEditForm({ ...editForm, businessCategory: e.target.value })}
                      data-testid="input-edit-business-category"
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="role" className="space-y-4 mt-4">
              <div className="space-y-1">
                <Label>Role</Label>
                <Select value={editForm.role || "applicant"} onValueChange={(v) => setEditForm({ ...editForm, role: v })}>
                  <SelectTrigger data-testid="select-edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applicant">Applicant</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">Verified User</p>
                  <p className="text-xs text-muted-foreground">User identity has been verified</p>
                </div>
                <Switch
                  checked={editForm.isVerified || false}
                  onCheckedChange={(v) => setEditForm({ ...editForm, isVerified: v })}
                  data-testid="switch-verified"
                />
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-4 mt-4">
              <div className="space-y-1">
                <Label>Subscription Tier</Label>
                <Select value={editForm.subscriptionStatus || "free"} onValueChange={(v) => setEditForm({ ...editForm, subscriptionStatus: v })}>
                  <SelectTrigger data-testid="select-edit-subscription">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-subEnd">Subscription End Date</Label>
                <Input
                  id="edit-subEnd"
                  type="date"
                  value={editForm.subscriptionEndDate || ""}
                  onChange={(e) => setEditForm({ ...editForm, subscriptionEndDate: e.target.value })}
                  data-testid="input-edit-sub-end"
                />
                <p className="text-xs text-muted-foreground">Leave empty for no expiration</p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateUserMutation.isPending}
              data-testid="button-save-user"
            >
              {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend User Dialog */}
      <Dialog open={!!suspendingUser} onOpenChange={() => setSuspendingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <Ban className="w-5 h-5" /> Suspend User
            </DialogTitle>
            <DialogDescription>
              Suspend {suspendingUser?.firstName} {suspendingUser?.lastName} ({suspendingUser?.email})?
              They will not be able to log in while suspended.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="suspend-reason">Reason for suspension</Label>
              <Textarea
                id="suspend-reason"
                placeholder="Enter the reason for suspending this user..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={3}
                data-testid="input-suspend-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendingUser(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => suspendingUser && handleSuspend(suspendingUser)}
              disabled={updateUserMutation.isPending}
              data-testid="button-confirm-suspend"
            >
              {updateUserMutation.isPending ? "Suspending..." : "Suspend User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" /> Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete <strong>{deletingUser?.firstName} {deletingUser?.lastName}</strong> ({deletingUser?.email})?
              This will remove all their data including jobs, applications, tickets, and transactions. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingUser(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deletingUser && deleteUserMutation.mutate(deletingUser.id)}
              disabled={deleteUserMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Support Access (Temp Password) Dialog */}
      <Dialog open={!!tempPasswordUser} onOpenChange={(open) => {
        if (!open) { setTempPasswordUser(null); setTempPasswordResult(null); }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              Support Access
            </DialogTitle>
            <DialogDescription>
              Generate a temporary login password for <strong>{tempPasswordUser?.firstName} {tempPasswordUser?.lastName}</strong> ({tempPasswordUser?.email}) to investigate their account.
            </DialogDescription>
          </DialogHeader>

          {!tempPasswordResult ? (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Important</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>The temporary password expires after 30 minutes</li>
                      <li>It is single-use and will be cleared after login</li>
                      <li>Generating a new one invalidates any previous temporary password</li>
                      <li>The user's original password is not affected</li>
                    </ul>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTempPasswordUser(null)}>Cancel</Button>
                <Button
                  onClick={() => tempPasswordUser && tempPasswordMutation.mutate(tempPasswordUser.id)}
                  disabled={tempPasswordMutation.isPending}
                  data-testid="button-generate-temp-password"
                >
                  {tempPasswordMutation.isPending ? "Generating..." : "Generate Temp Password"}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-4 space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">User Email</Label>
                  <p className="font-medium text-sm" data-testid="text-temp-user-email">{tempPasswordResult.userEmail}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Temporary Password</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 bg-background px-3 py-2 rounded border text-sm font-mono select-all" data-testid="text-temp-password">
                      {tempPasswordResult.tempPassword}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(tempPasswordResult.tempPassword);
                        toast({ title: "Copied to clipboard" });
                      }}
                      data-testid="button-copy-temp-password"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  Expires: {new Date(tempPasswordResult.expiresAt).toLocaleString()}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => { setTempPasswordUser(null); setTempPasswordResult(null); }}>
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
