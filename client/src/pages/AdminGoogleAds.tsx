import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-extension";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useForm, FormProvider } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2, Settings, ExternalLink, Eye, EyeOff, Monitor, Code, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { GoogleAdPlacement } from "@shared/schema";
import { usePageTitle } from "@/hooks/use-page-title";

const PAGE_OPTIONS = [
  { value: "browse-jobs", label: "Browse Jobs" },
  { value: "job-details", label: "Job Details" },
  { value: "landing", label: "Landing Page" },
  { value: "for-employers", label: "For Employers" },
  { value: "for-applicants", label: "For Applicants" },
  { value: "for-agents", label: "For Agents" },
  { value: "dashboard-employer", label: "Employer Dashboard" },
  { value: "dashboard-applicant", label: "Applicant Dashboard" },
];

const POSITION_OPTIONS = [
  { value: "top", label: "Top of Page" },
  { value: "middle", label: "Middle of Page" },
  { value: "bottom", label: "Bottom of Page" },
  { value: "right", label: "Right Sidebar" },
];

const FORMAT_OPTIONS = [
  { value: "auto", label: "Auto (Recommended)" },
  { value: "horizontal", label: "Horizontal Banner" },
  { value: "vertical", label: "Vertical Banner" },
  { value: "rectangle", label: "Rectangle" },
  { value: "fluid", label: "Fluid / In-feed" },
];

const placementSchema = z.object({
  name: z.string().min(1, "Name is required"),
  adSlotId: z.string().min(1, "Ad Slot ID is required"),
  adFormat: z.string().default("auto"),
  targetPages: z.array(z.string()).min(1, "Select at least one page"),
  position: z.array(z.string()).min(1, "Select at least one position"),
  isActive: z.boolean().default(true),
  isResponsive: z.boolean().default(true),
  customWidth: z.number().nullable().optional(),
  customHeight: z.number().nullable().optional(),
});

type PlacementFormData = z.infer<typeof placementSchema>;

export default function AdminGoogleAds() {
  usePageTitle("Admin - Google Ads");
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [publisherId, setPublisherId] = useState("");
  const [headerCode, setHeaderCode] = useState("");
  const [bodyCode, setBodyCode] = useState("");
  const [gaTrackingId, setGaTrackingId] = useState("");
  const [gaCode, setGaCode] = useState("");
  const [settingsEdited, setSettingsEdited] = useState(false);

  const { data, isLoading } = useQuery<{ publisherId: string; headerCode: string; bodyCode: string; gaTrackingId: string; gaCode: string; placements: GoogleAdPlacement[] }>({
    queryKey: ["/api/admin/google-ads"],
    queryFn: async () => {
      const res = await fetch("/api/admin/google-ads", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (!authLoading && data?.publisherId !== undefined && !settingsEdited) {
    if (publisherId !== data.publisherId) setPublisherId(data.publisherId);
    if (headerCode !== data.headerCode) setHeaderCode(data.headerCode);
    if (bodyCode !== data.bodyCode) setBodyCode(data.bodyCode);
    if (gaTrackingId !== data.gaTrackingId) setGaTrackingId(data.gaTrackingId);
    if (gaCode !== data.gaCode) setGaCode(data.gaCode);
  }

  const form = useForm<PlacementFormData>({
    resolver: zodResolver(placementSchema),
    defaultValues: {
      name: "",
      adSlotId: "",
      adFormat: "auto",
      targetPages: [],
      position: ["right"],
      isActive: true,
      isResponsive: true,
      customWidth: null,
      customHeight: null,
    },
  });

  const saveSettings = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/google-ads/settings", {
        publisherId: publisherId.trim(),
        headerCode,
        bodyCode,
        gaTrackingId: gaTrackingId.trim(),
        gaCode,
      });
    },
    onSuccess: () => {
      toast({ title: "Settings saved", description: "Google Ads settings updated." });
      setSettingsEdited(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/google-ads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/google-ads/codes"] });
    },
    onError: () => toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" }),
  });

  const createPlacement = useMutation({
    mutationFn: async (data: PlacementFormData) => {
      await apiRequest("POST", "/api/admin/google-ads", data);
    },
    onSuccess: () => {
      toast({ title: "Placement created" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/google-ads"] });
      setDialogOpen(false);
      form.reset();
    },
    onError: () => toast({ title: "Error", description: "Failed to create placement.", variant: "destructive" }),
  });

  const updatePlacement = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PlacementFormData> }) => {
      await apiRequest("PATCH", `/api/admin/google-ads/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Placement updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/google-ads"] });
      setDialogOpen(false);
      setEditingId(null);
      form.reset();
    },
    onError: () => toast({ title: "Error", description: "Failed to update placement.", variant: "destructive" }),
  });

  const deletePlacement = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/google-ads/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Placement deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/google-ads"] });
      setDeleteConfirmId(null);
    },
    onError: () => toast({ title: "Error", description: "Failed to delete placement.", variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/admin/google-ads/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/google-ads"] });
    },
  });

  const openEdit = (placement: GoogleAdPlacement) => {
    setEditingId(placement.id);
    form.reset({
      name: placement.name,
      adSlotId: placement.adSlotId,
      adFormat: placement.adFormat,
      targetPages: placement.targetPages,
      position: placement.position || ["right"],
      isActive: placement.isActive ?? true,
      isResponsive: placement.isResponsive ?? true,
      customWidth: placement.customWidth,
      customHeight: placement.customHeight,
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({
      name: "",
      adSlotId: "",
      adFormat: "auto",
      targetPages: [],
      position: ["right"],
      isActive: true,
      isResponsive: true,
      customWidth: null,
      customHeight: null,
    });
    setDialogOpen(true);
  };

  const onSubmit = (formData: PlacementFormData) => {
    if (editingId) {
      updatePlacement.mutate({ id: editingId, data: formData });
    } else {
      createPlacement.mutate(formData);
    }
  };

  if (authLoading) return null;
  if (!user || user.role !== "admin") return <Redirect to="/" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Google Ads & Analytics"
        description="Configure Google AdSense, Analytics tracking, and manage ad placements across the site"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="w-5 h-5" />
            Google AdSense Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="publisher-id">Publisher ID (Client ID)</Label>
            <Input
              id="publisher-id"
              placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              value={publisherId}
              onChange={(e) => { setPublisherId(e.target.value); setSettingsEdited(true); }}
              data-testid="input-publisher-id"
            />
            <p className="text-xs text-muted-foreground">
              Your Google AdSense publisher ID. Find it in your{" "}
              <a href="https://www.google.com/adsense" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                AdSense account <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="header-code" className="flex items-center gap-1.5">
              <Code className="w-4 h-4" />
              Header Code
            </Label>
            <Textarea
              id="header-code"
              placeholder={'Paste your Google Ad code for the <head> section here...\ne.g. <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX" crossorigin="anonymous"></script>'}
              value={headerCode}
              onChange={(e) => { setHeaderCode(e.target.value); setSettingsEdited(true); }}
              rows={4}
              className="font-mono text-xs"
              data-testid="input-header-code"
            />
            <p className="text-xs text-muted-foreground">
              Code that will be injected into the {'<head>'} section of every page. Typically the AdSense script tag.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="body-code" className="flex items-center gap-1.5">
              <Code className="w-4 h-4" />
              Body Code
            </Label>
            <Textarea
              id="body-code"
              placeholder="Paste your Google Ad code for the <body> section here..."
              value={bodyCode}
              onChange={(e) => { setBodyCode(e.target.value); setSettingsEdited(true); }}
              rows={4}
              className="font-mono text-xs"
              data-testid="input-body-code"
            />
            <p className="text-xs text-muted-foreground">
              Code that will be injected at the end of the {'<body>'} section. Use for additional tracking or ad scripts.
            </p>
          </div>

          <Button
            onClick={() => saveSettings.mutate()}
            disabled={saveSettings.isPending || !settingsEdited}
            className="w-full sm:w-auto"
            data-testid="button-save-ads-settings"
          >
            {saveSettings.isPending ? "Saving..." : "Save AdSense Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5" />
            Google Analytics Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="ga-tracking-id">Tracking / Measurement ID</Label>
            <Input
              id="ga-tracking-id"
              placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"
              value={gaTrackingId}
              onChange={(e) => { setGaTrackingId(e.target.value); setSettingsEdited(true); }}
              data-testid="input-ga-tracking-id"
            />
            <p className="text-xs text-muted-foreground">
              Your Google Analytics Measurement ID (GA4: G-XXXX or Universal Analytics: UA-XXXX). Find it in your{" "}
              <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                Analytics account <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ga-code" className="flex items-center gap-1.5">
              <Code className="w-4 h-4" />
              Additional Analytics Code
            </Label>
            <Textarea
              id="ga-code"
              placeholder={'Paste any additional Google Analytics or Tag Manager code here...\ne.g. <script>(function(w,d,s,l,i){...})(window,document,\'script\',\'dataLayer\',\'GTM-XXXX\');</script>'}
              value={gaCode}
              onChange={(e) => { setGaCode(e.target.value); setSettingsEdited(true); }}
              rows={4}
              className="font-mono text-xs"
              data-testid="input-ga-code"
            />
            <p className="text-xs text-muted-foreground">
              Optional extra code for Google Tag Manager, custom events, or advanced analytics configuration. Injected into the {'<head>'}.
            </p>
          </div>

          <Button
            onClick={() => saveSettings.mutate()}
            disabled={saveSettings.isPending || !settingsEdited}
            className="w-full sm:w-auto"
            data-testid="button-save-analytics-settings"
          >
            {saveSettings.isPending ? "Saving..." : "Save Analytics Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Monitor className="w-5 h-5" />
            Ad Placements ({data?.placements?.length || 0})
          </CardTitle>
          <Button onClick={openCreate} size="sm" className="gap-1.5" data-testid="button-add-placement">
            <Plus className="w-4 h-4" />
            Add Placement
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse border rounded-lg p-4">
                  <div className="h-5 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : !data?.placements?.length ? (
            <div className="text-center py-12">
              <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-1">No Ad Placements</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first Google Ad placement to start showing ads</p>
              <Button onClick={openCreate} size="sm" className="gap-1.5" data-testid="button-add-first-placement">
                <Plus className="w-4 h-4" />
                Add Placement
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.placements.map((placement) => (
                <div
                  key={placement.id}
                  className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  data-testid={`card-google-ad-${placement.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-semibold text-sm">{placement.name}</h4>
                      <Badge variant={placement.isActive ? "default" : "secondary"} className="text-[10px]">
                        {placement.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {FORMAT_OPTIONS.find(f => f.value === placement.adFormat)?.label || placement.adFormat}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>Slot: <span className="font-mono">{placement.adSlotId}</span></p>
                      <p>Pages: {placement.targetPages.map(p => PAGE_OPTIONS.find(o => o.value === p)?.label || p).join(", ")}</p>
                      <p>Position: {(placement.position || []).map(p => POSITION_OPTIONS.find(o => o.value === p)?.label || p).join(", ")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={placement.isActive ?? true}
                      onCheckedChange={(checked) => toggleActive.mutate({ id: placement.id, isActive: checked })}
                      data-testid={`switch-active-${placement.id}`}
                    />
                    <Button variant="ghost" size="icon" onClick={() => openEdit(placement)} data-testid={`button-edit-${placement.id}`}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteConfirmId(placement.id)} data-testid={`button-delete-${placement.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 space-y-1">
              <p className="font-semibold text-foreground">1. Set Publisher ID</p>
              <p>Enter your Google AdSense Publisher ID (ca-pub-XXXX) from your AdSense account.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 space-y-1">
              <p className="font-semibold text-foreground">2. Create Placements</p>
              <p>Add ad slots with their Slot ID from AdSense. Choose which pages and positions to display them.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 space-y-1">
              <p className="font-semibold text-foreground">3. Go Live</p>
              <p>Toggle placements on/off anytime. Google Ads will appear alongside your internal ads.</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 mt-3">
            <p className="text-amber-900 dark:text-amber-300 text-xs">
              <strong>Note:</strong> Google AdSense must approve your site before ads display. Make sure your site meets their{" "}
              <a href="https://support.google.com/adsense/answer/48182" target="_blank" rel="noopener noreferrer" className="underline">
                program policies
              </a>.
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingId(null); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Placement" : "New Ad Placement"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update this Google Ad placement" : "Create a new Google Ad placement. You'll need the Ad Slot ID from your AdSense account."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placement Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Browse Jobs Sidebar" {...field} data-testid="input-placement-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adSlotId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Slot ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 1234567890" {...field} data-testid="input-slot-id" />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">From your AdSense ad unit settings</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Format</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-format">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FORMAT_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetPages"
                render={() => (
                  <FormItem>
                    <FormLabel>Target Pages</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {PAGE_OPTIONS.map((opt) => (
                        <FormField
                          key={opt.value}
                          control={form.control}
                          name="targetPages"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(opt.value)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    field.onChange(checked ? [...current, opt.value] : current.filter(v => v !== opt.value));
                                  }}
                                  data-testid={`checkbox-page-${opt.value}`}
                                />
                              </FormControl>
                              <FormLabel className="font-normal !mt-0 text-xs">{opt.label}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={() => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {POSITION_OPTIONS.map((opt) => (
                        <FormField
                          key={opt.value}
                          control={form.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(opt.value)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    field.onChange(checked ? [...current, opt.value] : current.filter(v => v !== opt.value));
                                  }}
                                  data-testid={`checkbox-pos-${opt.value}`}
                                />
                              </FormControl>
                              <FormLabel className="font-normal !mt-0 text-xs">{opt.label}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between pt-2">
                <FormField
                  control={form.control}
                  name="isResponsive"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-responsive" />
                      </FormControl>
                      <FormLabel className="!mt-0 text-sm">Responsive</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-active" />
                      </FormControl>
                      <FormLabel className="!mt-0 text-sm">Active</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              {!form.watch("isResponsive") && (
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="customWidth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width (px)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            data-testid="input-width"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customHeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (px)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            data-testid="input-height"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createPlacement.isPending || updatePlacement.isPending} data-testid="button-save-placement">
                  {createPlacement.isPending || updatePlacement.isPending ? "Saving..." : editingId ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Placement</DialogTitle>
            <DialogDescription>Are you sure you want to delete this ad placement? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && deletePlacement.mutate(deleteConfirmId)}
              disabled={deletePlacement.isPending}
              data-testid="button-confirm-delete"
            >
              {deletePlacement.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
