import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PageHeader } from "@/components/ui-extension";
import { usePageTitle } from "@/hooks/use-page-title";
import { Mail, Send, Calendar, Clock, AlertCircle, Loader2 } from "lucide-react";

export default function AdminAutomatedEmails() {
  usePageTitle("Automated Emails | Iṣéyá");

  const { toast } = useToast();
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsTarget, setNewsTarget] = useState("all");
  const [sendNotification, setSendNotification] = useState(true);

  const { data: settings, isLoading: settingsLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/admin/settings"],
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Record<string, string>) => {
      const res = await apiRequest("PATCH", "/api/admin/settings", updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Settings updated" });
    },
  });

  const triggerJobAlerts = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/automated-emails/job-alerts");
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "Job Alerts Sent", description: data.message });
    },
    onError: () => {
      toast({ title: "Failed", description: "Could not send job alerts", variant: "destructive" });
    },
  });

  const triggerReminders = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/automated-emails/application-reminders");
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "Reminders Sent", description: data.message });
    },
    onError: () => {
      toast({ title: "Failed", description: "Could not send reminders", variant: "destructive" });
    },
  });

  const sendNewsPush = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/automated-emails/news-push", {
        title: newsTitle,
        content: newsContent,
        targetRole: newsTarget,
        sendNotification,
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "News Push Sent", description: data.message });
      setNewsTitle("");
      setNewsContent("");
      setNewsTarget("all");
    },
    onError: () => {
      toast({ title: "Failed", description: "Could not send news push", variant: "destructive" });
    },
  });

  const jobAlertsEnabled = settings?.auto_weekly_job_alerts === "true";
  const remindersEnabled = settings?.auto_application_reminders === "true";

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <PageHeader
        title="Automated Emails"
        subtitle="Manage scheduled email notifications and send manual email pushes to users"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="card-weekly-job-alerts">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-lg">Weekly Job Alerts</CardTitle>
            </div>
            <CardDescription>
              Sends personalized job listings to applicants every Monday at 8 AM, based on their preferred job types, categories, and location.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="toggle-job-alerts">Auto-send enabled</Label>
              <Switch
                id="toggle-job-alerts"
                data-testid="toggle-job-alerts"
                checked={jobAlertsEnabled}
                disabled={settingsLoading}
                onCheckedChange={(checked) => {
                  updateSettings.mutate({ auto_weekly_job_alerts: checked ? "true" : "false" });
                }}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Schedule: Every Monday at 8:00 AM</span>
            </div>
            <Button
              data-testid="button-trigger-job-alerts"
              variant="outline"
              className="w-full"
              onClick={() => triggerJobAlerts.mutate()}
              disabled={triggerJobAlerts.isPending}
            >
              {triggerJobAlerts.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Send Now (Manual)</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="card-application-reminders">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Application Reminders</CardTitle>
            </div>
            <CardDescription>
              Sends pending application status updates and new job suggestions to applicants every Wednesday and Friday at 8 AM.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="toggle-reminders">Auto-send enabled</Label>
              <Switch
                id="toggle-reminders"
                data-testid="toggle-reminders"
                checked={remindersEnabled}
                disabled={settingsLoading}
                onCheckedChange={(checked) => {
                  updateSettings.mutate({ auto_application_reminders: checked ? "true" : "false" });
                }}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Schedule: Wednesday & Friday at 8:00 AM</span>
            </div>
            <Button
              data-testid="button-trigger-reminders"
              variant="outline"
              className="w-full"
              onClick={() => triggerReminders.mutate()}
              disabled={triggerReminders.isPending}
            >
              {triggerReminders.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Send Now (Manual)</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-news-push">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">News & Promotions Push</CardTitle>
          </div>
          <CardDescription>
            Compose and send a one-time email blast to all users or specific roles. Optionally create an in-app notification too.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="news-title">Email Subject / Title</Label>
            <Input
              id="news-title"
              data-testid="input-news-title"
              placeholder="e.g. New Feature: Apply with one click!"
              value={newsTitle}
              onChange={(e) => setNewsTitle(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="news-content">Email Body</Label>
            <Textarea
              id="news-content"
              data-testid="textarea-news-content"
              placeholder="Write the email content here. HTML is supported."
              rows={6}
              value={newsContent}
              onChange={(e) => setNewsContent(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="news-target">Target Audience</Label>
              <Select value={newsTarget} onValueChange={setNewsTarget}>
                <SelectTrigger data-testid="select-news-target">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="applicant">Applicants Only</SelectItem>
                  <SelectItem value="employer">Employers Only</SelectItem>
                  <SelectItem value="agent">Agents Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end pb-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send-notification"
                  data-testid="checkbox-send-notification"
                  checked={sendNotification}
                  onCheckedChange={(checked) => setSendNotification(!!checked)}
                />
                <Label htmlFor="send-notification" className="text-sm">Also send in-app notification</Label>
              </div>
            </div>
          </div>

          <Button
            data-testid="button-send-news"
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            onClick={() => sendNewsPush.mutate()}
            disabled={sendNewsPush.isPending || !newsTitle.trim() || !newsContent.trim()}
          >
            {sendNewsPush.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending to all users...</>
            ) : (
              <><Send className="h-4 w-4 mr-2" /> Send Email Push</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
