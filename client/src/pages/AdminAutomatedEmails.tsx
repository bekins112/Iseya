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
import { Mail, Send, Calendar, Clock, AlertCircle, Loader2, ImageIcon, UserCheck } from "lucide-react";

const DAY_OPTIONS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, "0");
  return { value: `${h}:00`, label: `${h}:00` };
});

function getDayLabels(daysStr: string): string {
  const days = daysStr.split(",").map(s => s.trim());
  return days.map(d => DAY_OPTIONS.find(o => o.value === d)?.label || d).join(", ");
}

function DayPicker({ selectedDays, onChange, testIdPrefix }: { selectedDays: string; onChange: (val: string) => void; testIdPrefix: string }) {
  const selected = new Set(selectedDays.split(",").map(s => s.trim()).filter(Boolean));

  const toggle = (day: string) => {
    const next = new Set(selected);
    if (next.has(day)) {
      next.delete(day);
    } else {
      next.add(day);
    }
    if (next.size === 0) return;
    const sorted = Array.from(next).sort((a, b) => Number(a) - Number(b));
    onChange(sorted.join(","));
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {DAY_OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          data-testid={`${testIdPrefix}-day-${opt.value}`}
          onClick={() => toggle(opt.value)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
            selected.has(opt.value)
              ? "bg-yellow-600 text-white border-yellow-600"
              : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/60"
          }`}
        >
          {opt.label.slice(0, 3)}
        </button>
      ))}
    </div>
  );
}

export default function AdminAutomatedEmails() {
  usePageTitle("Automated Emails | Iṣéyá");

  const { toast } = useToast();
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsTarget, setNewsTarget] = useState("all");
  const [sendNotification, setSendNotification] = useState(true);
  const [promoImage, setPromoImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
      const formData = new FormData();
      formData.append("title", newsTitle);
      formData.append("content", newsContent);
      formData.append("targetRole", newsTarget);
      formData.append("sendNotification", sendNotification ? "true" : "false");
      if (promoImage) {
        formData.append("image", promoImage);
      }
      const res = await fetch("/api/admin/automated-emails/news-push", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed" }));
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "News Push Sent", description: data.message });
      setNewsTitle("");
      setNewsContent("");
      setNewsTarget("all");
      setPromoImage(null);
      setImagePreview(null);
    },
    onError: (err: any) => {
      toast({ title: "Failed", description: err.message || "Could not send news push", variant: "destructive" });
    },
  });

  const triggerProfileReminders = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/automated-emails/profile-reminders");
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "Profile Reminders Sent", description: data.message });
    },
    onError: () => {
      toast({ title: "Failed", description: "Could not send profile reminders", variant: "destructive" });
    },
  });

  const jobAlertsEnabled = settings?.auto_weekly_job_alerts === "true";
  const remindersEnabled = settings?.auto_application_reminders === "true";
  const profileRemindersEnabled = settings?.auto_profile_reminders === "true";
  const alertDays = settings?.job_alerts_schedule_days || "1";
  const alertTime = settings?.job_alerts_schedule_time || "08:00";
  const reminderDays = settings?.app_reminders_schedule_days || "3,5";
  const reminderTime = settings?.app_reminders_schedule_time || "08:00";
  const profileDays = settings?.profile_reminders_schedule_days || "2,4";
  const profileTime = settings?.profile_reminders_schedule_time || "10:00";

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <PageHeader
        title="Automated Emails"
        subtitle="Manage scheduled email notifications and send manual email pushes to users"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card data-testid="card-weekly-job-alerts">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-lg">Weekly Job Alerts</CardTitle>
            </div>
            <CardDescription>
              Sends personalized job listings to applicants based on their preferred job types, categories, and location.
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

            <div className="space-y-2 rounded-lg border p-3 bg-muted/10">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Send on days</Label>
              <DayPicker
                selectedDays={alertDays}
                testIdPrefix="job-alerts"
                onChange={(val) => updateSettings.mutate({ job_alerts_schedule_days: val })}
              />
              <div className="flex items-center gap-2 mt-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Time</Label>
                <Select
                  value={alertTime}
                  onValueChange={(val) => updateSettings.mutate({ job_alerts_schedule_time: val })}
                >
                  <SelectTrigger className="h-8 text-sm w-28" data-testid="select-job-alerts-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {TIME_OPTIONS.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Schedule: {getDayLabels(alertDays)} at {alertTime}</span>
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
              Sends pending application status updates and new job suggestions to applicants.
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

            <div className="space-y-2 rounded-lg border p-3 bg-muted/10">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Send on days</Label>
              <DayPicker
                selectedDays={reminderDays}
                testIdPrefix="reminders"
                onChange={(val) => updateSettings.mutate({ app_reminders_schedule_days: val })}
              />
              <div className="flex items-center gap-2 mt-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Time</Label>
                <Select
                  value={reminderTime}
                  onValueChange={(val) => updateSettings.mutate({ app_reminders_schedule_time: val })}
                >
                  <SelectTrigger className="h-8 text-sm w-28" data-testid="select-reminders-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {TIME_OPTIONS.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Schedule: {getDayLabels(reminderDays)} at {reminderTime}</span>
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
        <Card data-testid="card-profile-reminders">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Profile Completion Reminders</CardTitle>
            </div>
            <CardDescription>
              Sends email and in-app notification to users who haven't completed their profile, listing missing fields.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="toggle-profile-reminders">Auto-send enabled</Label>
              <Switch
                id="toggle-profile-reminders"
                data-testid="toggle-profile-reminders"
                checked={profileRemindersEnabled}
                disabled={settingsLoading}
                onCheckedChange={(checked) => {
                  updateSettings.mutate({ auto_profile_reminders: checked ? "true" : "false" });
                }}
              />
            </div>

            <div className="space-y-2 rounded-lg border p-3 bg-muted/10">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Send on days</Label>
              <DayPicker
                selectedDays={profileDays}
                testIdPrefix="profile-reminders"
                onChange={(val) => updateSettings.mutate({ profile_reminders_schedule_days: val })}
              />
              <div className="flex items-center gap-2 mt-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Time</Label>
                <Select
                  value={profileTime}
                  onValueChange={(val) => updateSettings.mutate({ profile_reminders_schedule_time: val })}
                >
                  <SelectTrigger className="h-8 text-sm w-28" data-testid="select-profile-reminders-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {TIME_OPTIONS.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Schedule: {getDayLabels(profileDays)} at {profileTime}</span>
            </div>

            <Button
              data-testid="button-trigger-profile-reminders"
              variant="outline"
              className="w-full"
              onClick={() => triggerProfileReminders.mutate()}
              disabled={triggerProfileReminders.isPending}
            >
              {triggerProfileReminders.isPending ? (
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

          <div>
            <Label>Attach Image (optional)</Label>
            <div className="mt-1">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg border" />
                  <button
                    type="button"
                    data-testid="button-remove-promo-image"
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow"
                    onClick={() => { setPromoImage(null); setImagePreview(null); }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label
                  className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-muted/30 transition-colors text-sm text-muted-foreground"
                  data-testid="label-upload-promo-image"
                >
                  <ImageIcon className="h-5 w-5" />
                  <span>Click to upload an image (JPG, PNG, WEBP, GIF — max 5MB)</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    data-testid="input-promo-image"
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
