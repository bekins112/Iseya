import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui-extension";
import { Bell, Send, Trash2, Users, User, Globe, Mail, Monitor, ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { AdminPagination, usePagination } from "@/components/AdminPagination";
import { usePageTitle } from "@/hooks/use-page-title";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  targetRole: string | null;
  targetUserId: string | null;
  createdBy: string;
  createdAt: string;
}

export default function AdminNotifications() {
  usePageTitle("Admin Notifications");
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("all");
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [targetEmail, setTargetEmail] = useState("");
  const [delivery, setDelivery] = useState("internal");
  const [promoImage, setPromoImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (user?.role !== "admin") {
    setLocation("/dashboard");
    return null;
  }

  const { data: notifications = [], isLoading } = useQuery<NotificationItem[]>({
    queryKey: ["/api/admin/notifications"],
  });

  const sendExternal = delivery === "external" || delivery === "both";

  const createMutation = useMutation({
    mutationFn: async () => {
      if (type === "role" && targetRoles.length > 0) {
        for (const role of targetRoles) {
          const formData = new FormData();
          formData.append("title", title);
          formData.append("message", message);
          formData.append("type", "role");
          formData.append("targetRole", role);
          formData.append("delivery", delivery);
          if (promoImage && sendExternal) formData.append("image", promoImage);
          const res = await fetch("/api/admin/notifications", {
            method: "POST",
            body: formData,
            credentials: "include",
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ message: "Failed" }));
            throw new Error(err.message);
          }
        }
      } else {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("message", message);
        formData.append("type", type);
        formData.append("delivery", delivery);
        if (type === "individual") {
          formData.append("targetEmail", targetEmail);
        }
        if (promoImage && sendExternal) formData.append("image", promoImage);
        const res = await fetch("/api/admin/notifications", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: "Failed" }));
          throw new Error(err.message);
        }
        return res.json();
      }
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      setTitle("");
      setMessage("");
      setType("all");
      setTargetRoles([]);
      setTargetEmail("");
      setPromoImage(null);
      setImagePreview(null);
      const desc = data?.message || "Notification has been sent successfully.";
      toast({ title: "Notification sent", description: desc });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to send notification.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/notifications/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      toast({ title: "Deleted", description: "Notification has been deleted." });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/notifications/all", { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to clear");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      toast({ title: "Cleared", description: "All notifications have been cleared." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to clear notifications.", variant: "destructive" });
    },
  });

  const canSubmit = title.trim() && message.trim() &&
    (type !== "role" || targetRoles.length > 0) &&
    (type !== "individual" || targetEmail.trim());

  const getRoleLabel = (role: string | null) => {
    if (role === "employer") return "Employers";
    if (role === "agent") return "Agents";
    if (role === "applicant") return "Applicants";
    if (role === "admin") return "Admins";
    return role || "Unknown";
  };

  const getTypeBadge = (notifType: string, targetRole: string | null) => {
    if (notifType === "all") return <Badge variant="secondary" className="gap-1"><Globe className="w-3 h-3" />All Users</Badge>;
    if (notifType === "role") return <Badge variant="outline" className="gap-1"><Users className="w-3 h-3" />{getRoleLabel(targetRole)}</Badge>;
    return <Badge variant="outline" className="gap-1"><User className="w-3 h-3" />Individual</Badge>;
  };

  return (
    <div className="space-y-8" data-testid="admin-notifications-page">
      <PageHeader title="Notifications" subtitle="Send notifications to users on the platform" />

      <div className="grid lg:grid-cols-5 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Send className="w-5 h-5 text-primary" />
                Send Notification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    placeholder="Notification title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    data-testid="input-notification-title"
                  />
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Write your notification message..."
                    className="min-h-[100px] resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    data-testid="input-notification-message"
                  />
                </div>

                <div>
                  <Label>Send To</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger data-testid="select-notification-type">
                      <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="role">By Role</SelectItem>
                      <SelectItem value="individual">Individual User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {type === "role" && (
                  <div>
                    <Label>Target Roles</Label>
                    <div className="flex flex-wrap gap-4 pt-1">
                      {[
                        { value: "applicant", label: "Applicants" },
                        { value: "employer", label: "Employers" },
                        { value: "agent", label: "Agents" },
                      ].map((role) => {
                        const isChecked = targetRoles.includes(role.value);
                        return (
                          <label
                            key={role.value}
                            className="flex items-center gap-2 cursor-pointer"
                            data-testid={`checkbox-role-${role.value}`}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTargetRoles([...targetRoles, role.value]);
                                } else {
                                  setTargetRoles(targetRoles.filter((r) => r !== role.value));
                                }
                              }}
                            />
                            <span className="text-sm font-medium">{role.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {type === "individual" && (
                  <div>
                    <Label>User Email</Label>
                    <Input
                      type="email"
                      placeholder="Enter the user's email address"
                      value={targetEmail}
                      onChange={(e) => setTargetEmail(e.target.value)}
                      data-testid="input-target-user-email"
                    />
                  </div>
                )}

                <div>
                  <Label>Delivery Method</Label>
                  <Select value={delivery} onValueChange={setDelivery}>
                    <SelectTrigger data-testid="select-delivery-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">
                        <span className="flex items-center gap-2"><Monitor className="w-3.5 h-3.5" /> Internal (In-App Only)</span>
                      </SelectItem>
                      <SelectItem value="external">
                        <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> External (Email Only)</span>
                      </SelectItem>
                      <SelectItem value="both">
                        <span className="flex items-center gap-2"><Bell className="w-3.5 h-3.5" /> Both (In-App + Email)</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {sendExternal && (
                  <div>
                    <Label>Attach Image (optional)</Label>
                    <div className="mt-1">
                      {imagePreview ? (
                        <div className="relative inline-block">
                          <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg border" />
                          <button
                            type="button"
                            data-testid="button-remove-notif-image"
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow"
                            onClick={() => { setPromoImage(null); setImagePreview(null); }}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label
                          className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-3 cursor-pointer hover:bg-muted/30 transition-colors text-xs text-muted-foreground"
                          data-testid="label-upload-notif-image"
                        >
                          <ImageIcon className="h-4 w-4" />
                          <span>Upload image (JPG, PNG, WEBP, GIF — max 5MB)</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            data-testid="input-notif-image"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  toast({ title: "File too large", description: "Max 5MB allowed", variant: "destructive" });
                                  return;
                                }
                                setPromoImage(file);
                                setImagePreview(URL.createObjectURL(file));
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  disabled={createMutation.isPending || !canSubmit}
                  onClick={() => createMutation.mutate()}
                  data-testid="button-send-notification"
                >
                  {createMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                  ) : (
                    "Send Notification"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5 text-primary" />
                Sent Notifications
                <Badge variant="secondary" className="ml-2">{notifications.length}</Badge>
                {notifications.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto text-destructive hover:text-destructive gap-1"
                    onClick={() => clearAllMutation.mutate()}
                    disabled={clearAllMutation.isPending}
                    data-testid="button-clear-all-notifications"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear All
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground" data-testid="text-no-sent-notifications">
                  <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No notifications sent yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {usePagination(notifications, pageSize, page).map((notif) => (
                    <div
                      key={notif.id}
                      className="p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors"
                      data-testid={`admin-notification-item-${notif.id}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">{notif.title}</p>
                            {getTypeBadge(notif.type, notif.targetRole)}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{notif.message}</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {notif.createdAt && formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                          onClick={() => deleteMutation.mutate(notif.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-notification-${notif.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <AdminPagination totalItems={notifications.length} currentPage={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
