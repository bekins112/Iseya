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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui-extension";
import { Megaphone, Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, Calendar, Upload, X, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion } from "framer-motion";
import type { InternalAd } from "@shared/schema";

const TARGET_PAGE_OPTIONS = [
  { value: "landing", label: "Landing Page" },
  { value: "browse-jobs", label: "Browse Jobs" },
  { value: "job-details", label: "Job Details" },
  { value: "dashboard-employer", label: "Employer Dashboard" },
  { value: "dashboard-agent", label: "Agent Dashboard" },
  { value: "dashboard-applicant", label: "Applicant Dashboard" },
];

const POSITION_OPTIONS = [
  { value: "top", label: "Top of Page" },
  { value: "middle", label: "Middle of Page" },
  { value: "bottom", label: "Bottom of Page" },
];

const adFormSchema = z.object({
  title: z.string().optional().default(""),
  content: z.string().optional().default(""),
  type: z.enum(["banner", "popup"]),
  targetPages: z.array(z.string()).min(1, "Select at least one target page"),
  position: z.array(z.string()).min(1, "Select at least one position"),
  linkUrl: z.string().optional().nullable(),
  linkText: z.string().optional().nullable(),
  bgColor: z.string().optional().nullable(),
  textColor: z.string().optional().nullable(),
  bannerWidth: z.number().int().min(50).default(250),
  bannerHeight: z.number().int().min(20).default(92),
  popupWidth: z.number().int().min(100).default(400),
  popupHeight: z.number().int().min(100).default(500),
  isActive: z.boolean().default(true),
  priority: z.number().int().default(0),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.type === "popup") {
    if (!data.title || data.title.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Title is required for popups", path: ["title"] });
    }
    if (!data.content || data.content.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Content is required for popups", path: ["content"] });
    }
  }
});

type AdFormValues = z.infer<typeof adFormSchema>;

const defaultFormValues: AdFormValues = {
  title: "",
  content: "",
  type: "banner",
  targetPages: [],
  position: ["top"],
  linkUrl: "",
  linkText: "",
  bgColor: "",
  textColor: "",
  bannerWidth: 250,
  bannerHeight: 92,
  popupWidth: 400,
  popupHeight: 500,
  isActive: true,
  priority: 0,
  startDate: "",
  endDate: "",
};

export default function AdminAds() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<InternalAd | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  if (user?.role !== "admin") {
    setLocation("/dashboard");
    return null;
  }

  const { data: ads = [], isLoading } = useQuery<InternalAd[]>({
    queryKey: ["/api/admin/ads"],
  });

  const form = useForm<AdFormValues>({
    resolver: zodResolver(adFormSchema),
    defaultValues: defaultFormValues,
  });

  const openCreateDialog = () => {
    setEditingAd(null);
    form.reset(defaultFormValues);
    setImageFile(null);
    setImagePreview(null);
    setRemoveExistingImage(false);
    setDialogOpen(true);
  };

  const openEditDialog = (ad: InternalAd) => {
    setEditingAd(ad);
    form.reset({
      title: ad.title,
      content: ad.content,
      type: ad.type as "banner" | "popup",
      targetPages: ad.targetPages || [],
      position: Array.isArray(ad.position) ? ad.position : [ad.position || "top"],
      linkUrl: ad.linkUrl || "",
      linkText: ad.linkText || "",
      bgColor: ad.bgColor || "",
      textColor: ad.textColor || "",
      bannerWidth: ad.bannerWidth ?? 250,
      bannerHeight: ad.bannerHeight ?? 92,
      popupWidth: ad.popupWidth ?? 400,
      popupHeight: ad.popupHeight ?? 500,
      isActive: ad.isActive ?? true,
      priority: ad.priority ?? 0,
      startDate: ad.startDate ? format(new Date(ad.startDate), "yyyy-MM-dd'T'HH:mm") : "",
      endDate: ad.endDate ? format(new Date(ad.endDate), "yyyy-MM-dd'T'HH:mm") : "",
    });
    setImageFile(null);
    setImagePreview(ad.imageUrl || null);
    setRemoveExistingImage(false);
    setDialogOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setRemoveExistingImage(false);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveExistingImage(true);
  };

  const buildFormData = (data: AdFormValues, file: File | null, removeImage: boolean) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", data.content);
    formData.append("type", data.type);
    formData.append("targetPages", JSON.stringify(data.targetPages));
    formData.append("position", JSON.stringify(data.position || ["top"]));
    formData.append("linkUrl", data.linkUrl || "");
    formData.append("linkText", data.linkText || "");
    formData.append("bgColor", data.bgColor || "");
    formData.append("textColor", data.textColor || "");
    formData.append("isActive", String(data.isActive));
    formData.append("bannerWidth", String(data.bannerWidth));
    formData.append("bannerHeight", String(data.bannerHeight));
    formData.append("popupWidth", String(data.popupWidth));
    formData.append("popupHeight", String(data.popupHeight));
    formData.append("priority", String(data.priority));
    formData.append("startDate", data.startDate || "");
    formData.append("endDate", data.endDate || "");
    if (file) formData.append("image", file);
    if (removeImage) formData.append("removeImage", "true");
    return formData;
  };

  const createMutation = useMutation({
    mutationFn: async (data: AdFormValues) => {
      const formData = buildFormData(data, imageFile, false);
      const res = await fetch("/api/admin/ads", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) { const err = await res.json().catch(() => ({ message: "Failed" })); throw new Error(err.message); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      setDialogOpen(false);
      form.reset(defaultFormValues);
      setImageFile(null);
      setImagePreview(null);
      toast({ title: "Ad created", description: "The ad has been created successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message || "Failed to create ad.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AdFormValues }) => {
      const formData = buildFormData(data, imageFile, removeExistingImage);
      const res = await fetch(`/api/admin/ads/${id}`, { method: "PATCH", body: formData, credentials: "include" });
      if (!res.ok) { const err = await res.json().catch(() => ({ message: "Failed" })); throw new Error(err.message); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      setDialogOpen(false);
      setEditingAd(null);
      form.reset(defaultFormValues);
      setImageFile(null);
      setImagePreview(null);
      toast({ title: "Ad updated", description: "The ad has been updated successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message || "Failed to update ad.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/ads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      setDeleteConfirmId(null);
      toast({ title: "Ad deleted", description: "The ad has been deleted." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete ad.", variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/admin/ads/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to toggle ad status.", variant: "destructive" });
    },
  });

  const onSubmit = (data: AdFormValues) => {
    if (editingAd) {
      updateMutation.mutate({ id: editingAd.id, data: data });
    } else {
      createMutation.mutate(data);
    }
  };

  const activeCount = ads.filter(a => a.isActive).length;
  const bannerCount = ads.filter(a => a.type === "banner").length;
  const popupCount = ads.filter(a => a.type === "popup").length;

  return (
    <div className="space-y-6" data-testid="admin-ads-page">
      <PageHeader
        title="Ads & Popups"
        description="Create and manage promotional banners and popups"
        actions={
          <Button onClick={openCreateDialog} data-testid="button-create-ad">
            <Plus className="w-4 h-4 mr-2" />
            Create Ad
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Megaphone className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold" data-testid="text-total-ads">{ads.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <p className="text-2xl font-bold" data-testid="text-active-ads">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ExternalLink className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Banners</span>
            </div>
            <p className="text-2xl font-bold" data-testid="text-banner-count">{bannerCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Megaphone className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-muted-foreground">Popups</span>
            </div>
            <p className="text-2xl font-bold" data-testid="text-popup-count">{popupCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Megaphone className="w-5 h-5 text-primary" />
            All Ads & Popups
            <Badge variant="secondary" className="ml-auto">{ads.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-md animate-pulse" />
              ))}
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground" data-testid="text-no-ads">
              <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No ads or popups created yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ads.map((ad) => (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  data-testid={`ad-item-${ad.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {ad.imageUrl && (
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className="w-16 h-16 rounded-lg object-cover shrink-0 border"
                        data-testid={`img-ad-thumb-${ad.id}`}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold text-sm" data-testid={`text-ad-title-${ad.id}`}>{ad.title}</p>
                        <Badge variant={ad.type === "banner" ? "secondary" : "outline"} data-testid={`badge-ad-type-${ad.id}`}>
                          {ad.type === "banner" ? "Banner" : "Popup"}
                        </Badge>
                        <Badge
                          variant={ad.isActive ? "default" : "secondary"}
                          className={ad.isActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}
                          data-testid={`badge-ad-status-${ad.id}`}
                        >
                          {ad.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline" className="text-xs" data-testid={`badge-ad-position-${ad.id}`}>
                          {(Array.isArray(ad.position) ? ad.position : [ad.position || "top"]).map(p => p === "middle" ? "Middle" : p === "bottom" ? "Bottom" : "Top").join(", ")}
                        </Badge>
                        {ad.priority !== null && ad.priority > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Priority: {ad.priority}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{ad.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          Pages: {(ad.targetPages || []).map(p => {
                            const option = TARGET_PAGE_OPTIONS.find(o => o.value === p);
                            return option?.label || p;
                          }).join(", ")}
                        </span>
                        {ad.startDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            From: {format(new Date(ad.startDate), "MMM d, yyyy")}
                          </span>
                        )}
                        {ad.endDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Until: {format(new Date(ad.endDate), "MMM d, yyyy")}
                          </span>
                        )}
                        {ad.linkUrl && (
                          <span className="flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            {ad.linkText || "Link"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Switch
                        checked={ad.isActive ?? false}
                        onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: ad.id, isActive: checked })}
                        data-testid={`switch-ad-active-${ad.id}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(ad)}
                        data-testid={`button-edit-ad-${ad.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirmId(ad.id)}
                        data-testid={`button-delete-ad-${ad.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditingAd(null); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-ad-dialog-title">
              {editingAd ? "Edit Ad" : "Create New Ad"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title {form.watch("type") === "banner" && <span className="text-muted-foreground font-normal">(optional)</span>}</FormLabel>
                    <FormControl>
                      <Input placeholder="Ad title" {...field} data-testid="input-ad-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content {form.watch("type") === "banner" && <span className="text-muted-foreground font-normal">(optional)</span>}</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ad content / message..." className="min-h-[80px] resize-none" {...field} data-testid="input-ad-content" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <label className="text-sm font-medium mb-2 block">Artwork / Media</label>
                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden border bg-muted">
                    <img
                      src={imagePreview}
                      alt="Ad media preview"
                      className="w-full max-h-48 object-contain"
                      data-testid="img-ad-preview"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                      data-testid="button-remove-ad-image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors cursor-pointer bg-muted/30"
                    data-testid="label-upload-ad-image"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload artwork or media</span>
                    <span className="text-xs text-muted-foreground/60">JPG, PNG, WEBP, GIF, SVG — max 5MB</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.gif,.svg"
                      onChange={handleImageSelect}
                      className="hidden"
                      data-testid="input-ad-image"
                    />
                  </label>
                )}
              </div>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-ad-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="banner">Banner</SelectItem>
                        <SelectItem value="popup">Popup</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={() => (
                  <FormItem>
                    <FormLabel>Position on Page</FormLabel>
                    <div className="space-y-2">
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
                                    field.onChange(
                                      checked
                                        ? [...current, opt.value]
                                        : current.filter((v: string) => v !== opt.value)
                                    );
                                  }}
                                  data-testid={`checkbox-position-${opt.value}`}
                                />
                              </FormControl>
                              <FormLabel className="font-normal !mt-0">{opt.label}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("type") === "banner" && (
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="bannerWidth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banner Width (px)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={50}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 250)}
                            data-testid="input-banner-width"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bannerHeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banner Height (px)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={20}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 92)}
                            data-testid="input-banner-height"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {form.watch("type") === "popup" && (
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="popupWidth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Popup Width (px)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={100}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 400)}
                            data-testid="input-popup-width"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="popupHeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Popup Height (px)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={100}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 500)}
                            data-testid="input-popup-height"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              <FormField
                control={form.control}
                name="targetPages"
                render={() => (
                  <FormItem>
                    <FormLabel>Target Pages</FormLabel>
                    <div className="space-y-2">
                      {TARGET_PAGE_OPTIONS.map((page) => (
                        <FormField
                          key={page.value}
                          control={form.control}
                          name="targetPages"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(page.value)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked) {
                                      field.onChange([...current, page.value]);
                                    } else {
                                      field.onChange(current.filter((v: string) => v !== page.value));
                                    }
                                  }}
                                  data-testid={`checkbox-target-${page.value}`}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-sm cursor-pointer">{page.label}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="linkUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} value={field.value || ""} data-testid="input-ad-link-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="linkText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Text</FormLabel>
                      <FormControl>
                        <Input placeholder="Learn More" {...field} value={field.value || ""} data-testid="input-ad-link-text" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bgColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Background Color</FormLabel>
                      <FormControl>
                        <Input type="color" {...field} value={field.value || "#3b82f6"} data-testid="input-ad-bg-color" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="textColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text Color</FormLabel>
                      <FormControl>
                        <Input type="color" {...field} value={field.value || "#ffffff"} data-testid="input-ad-text-color" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority (higher = shown first)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-ad-priority"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} value={field.value || ""} data-testid="input-ad-start-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} value={field.value || ""} data-testid="input-ad-end-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-ad-is-active"
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Active</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit-ad"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingAd
                    ? "Update Ad"
                    : "Create Ad"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Ad</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this ad? This action cannot be undone.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} data-testid="button-cancel-delete">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId !== null && deleteMutation.mutate(deleteConfirmId)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
