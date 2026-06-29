import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { ImageIcon, Loader2, Save, Trash2, ArrowUp, ArrowDown, Images } from "lucide-react";

const MAX_BANNERS = 5;

interface BannerItem {
  image: string | null;
  file: File | null;
  preview: string;
  title: string;
  subtitle: string;
}

interface BannersResponse {
  enabled: boolean;
  banners: Array<{ image: string; title: string; subtitle: string }>;
}

export default function BannerEditor() {
  const { toast } = useToast();

  const [enabled, setEnabled] = useState(false);
  const [items, setItems] = useState<BannerItem[]>([]);

  const { data, isLoading } = useQuery<BannersResponse>({
    queryKey: ["/api/admin/banners"],
  });

  useEffect(() => {
    if (data) {
      setEnabled(data.enabled);
      setItems(
        data.banners.map((b) => ({
          image: b.image,
          file: null,
          preview: b.image,
          title: b.title,
          subtitle: b.subtitle,
        }))
      );
    }
  }, [data]);

  useEffect(() => {
    return () => {
      setItems((current) => {
        for (const it of current) {
          if (it.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview);
        }
        return current;
      });
    };
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("enabled", enabled ? "true" : "false");
      const meta = items.map((it) => ({
        image: it.file ? "__new__" : it.image,
        title: it.title,
        subtitle: it.subtitle,
      }));
      formData.append("banners", JSON.stringify(meta));
      for (const it of items) {
        if (it.file) formData.append("images", it.file);
      }
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save banners");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Banners Saved", description: "Your landing page banners have been updated." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/public"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed", description: err.message || "Could not save banners", variant: "destructive" });
    },
  });

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_BANNERS - items.length;
    if (remaining <= 0) {
      toast({ title: "Limit reached", description: `You can add up to ${MAX_BANNERS} banners.`, variant: "destructive" });
      return;
    }
    const accepted: BannerItem[] = [];
    let oversized = 0;
    for (const file of Array.from(files).slice(0, remaining)) {
      if (file.size > 5 * 1024 * 1024) {
        oversized++;
        continue;
      }
      accepted.push({ image: null, file, preview: URL.createObjectURL(file), title: "", subtitle: "" });
    }
    if (oversized > 0) {
      toast({ title: "Some files too large", description: `${oversized} file(s) exceeded 5MB and were skipped`, variant: "destructive" });
    }
    if (Array.from(files).length > remaining) {
      toast({ title: "Limit reached", description: `Only ${remaining} more banner(s) could be added (max ${MAX_BANNERS}).`, variant: "destructive" });
    }
    if (accepted.length > 0) setItems((prev) => [...prev, ...accepted]);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => {
      const target = prev[idx];
      if (target?.file && target.preview.startsWith("blob:")) URL.revokeObjectURL(target.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const move = (idx: number, dir: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const updateField = (idx: number, field: "title" | "subtitle", value: string) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Images className="w-5 h-5" />
            Custom Banners
          </CardTitle>
          <CardDescription>
            When turned off, the landing page shows the default banners.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label className="text-base">Use custom banners</Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                {enabled ? "Custom banners are shown on the landing page." : "Default banners are shown on the landing page."}
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} data-testid="switch-banners-enabled" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Banner Images ({items.length}/{MAX_BANNERS})</CardTitle>
          <CardDescription>The order below is the order banners slide on the landing page. Title and subtitle are optional overlays.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">No banners added yet. Upload an image to get started.</p>
          )}

          {items.map((it, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-4 rounded-lg border p-4" data-testid={`banner-item-${idx}`}>
              <div className="relative w-full sm:w-48 flex-shrink-0">
                <img src={it.preview} alt={`Banner ${idx + 1}`} className="w-full h-28 object-cover rounded-md border" />
                <span className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">#{idx + 1}</span>
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <Label className="text-xs">Title (optional)</Label>
                  <Input
                    value={it.title}
                    onChange={(e) => updateField(idx, "title", e.target.value)}
                    placeholder="e.g. Find Your Perfect Job"
                    data-testid={`input-banner-title-${idx}`}
                  />
                </div>
                <div>
                  <Label className="text-xs">Subtitle (optional)</Label>
                  <Input
                    value={it.subtitle}
                    onChange={(e) => updateField(idx, "subtitle", e.target.value)}
                    placeholder="e.g. Opportunities across Nigeria"
                    data-testid={`input-banner-subtitle-${idx}`}
                  />
                </div>
              </div>
              <div className="flex sm:flex-col gap-2 justify-end">
                <Button type="button" variant="outline" size="icon" disabled={idx === 0} onClick={() => move(idx, -1)} data-testid={`button-banner-up-${idx}`}>
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button type="button" variant="outline" size="icon" disabled={idx === items.length - 1} onClick={() => move(idx, 1)} data-testid={`button-banner-down-${idx}`}>
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button type="button" variant="destructive" size="icon" onClick={() => removeItem(idx)} data-testid={`button-banner-remove-${idx}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {items.length < MAX_BANNERS && (
            <label
              className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/30 transition-colors text-sm text-muted-foreground"
              data-testid="label-add-banner"
            >
              <ImageIcon className="h-5 w-5" />
              <span>Click to upload banner images (JPG, PNG, WEBP, GIF — max 5MB each, up to {MAX_BANNERS})</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                data-testid="input-add-banner"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} data-testid="button-save-banners">
          {saveMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
          ) : (
            <><Save className="w-4 h-4 mr-2" />Save Banners</>
          )}
        </Button>
      </div>
    </div>
  );
}
