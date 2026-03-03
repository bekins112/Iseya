import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui-extension";
import { Bell, Send, Trash2, Users, User, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const notificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.enum(["all", "role", "individual"]),
  targetRole: z.string().optional(),
  targetUserId: z.string().optional(),
}).refine((data) => {
  if (data.type === "role" && !data.targetRole) return false;
  if (data.type === "individual" && !data.targetUserId) return false;
  return true;
}, {
  message: "Please select a target for this notification",
  path: ["targetRole"],
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

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
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  if (user?.role !== "admin") {
    setLocation("/dashboard");
    return null;
  }

  const { data: notifications = [], isLoading } = useQuery<NotificationItem[]>({
    queryKey: ["/api/admin/notifications"],
  });

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "all",
      targetRole: "",
      targetUserId: "",
    },
  });

  const selectedType = form.watch("type");

  const createMutation = useMutation({
    mutationFn: async (data: NotificationFormValues) => {
      await apiRequest("POST", "/api/admin/notifications", {
        title: data.title,
        message: data.message,
        type: data.type,
        targetRole: data.type === "role" ? data.targetRole : null,
        targetUserId: data.type === "individual" ? data.targetUserId : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      form.reset({ title: "", message: "", type: "all", targetRole: "", targetUserId: "" });
      toast({ title: "Notification sent", description: "Notification has been sent successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send notification.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      toast({ title: "Deleted", description: "Notification has been deleted." });
    },
  });

  const onSubmit = (data: NotificationFormValues) => {
    createMutation.mutate(data);
  };

  const getTypeBadge = (type: string, targetRole: string | null) => {
    if (type === "all") return <Badge variant="secondary" className="gap-1"><Globe className="w-3 h-3" />All Users</Badge>;
    if (type === "role") return <Badge variant="outline" className="gap-1"><Users className="w-3 h-3" />{targetRole === "employer" ? "Employers" : "Applicants"}</Badge>;
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Notification title" {...field} data-testid="input-notification-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Write your notification message..." className="min-h-[100px] resize-none" {...field} data-testid="input-notification-message" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Send To</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-notification-type">
                              <SelectValue placeholder="Select target" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="role">By Role</SelectItem>
                            <SelectItem value="individual">Individual User</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {selectedType === "role" && (
                    <FormField
                      control={form.control}
                      name="targetRole"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Role</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-target-role">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="applicant">Applicants</SelectItem>
                              <SelectItem value="employer">Employers</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {selectedType === "individual" && (
                    <FormField
                      control={form.control}
                      name="targetUserId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter the user's ID" {...field} data-testid="input-target-user-id" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createMutation.isPending}
                    data-testid="button-send-notification"
                  >
                    {createMutation.isPending ? "Sending..." : "Send Notification"}
                  </Button>
                </form>
              </Form>
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
                <Badge variant="secondary" className="ml-auto">{notifications.length}</Badge>
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
                  {notifications.map((notif) => (
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
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
