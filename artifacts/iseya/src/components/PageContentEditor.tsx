import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, Save, Plus, Trash2, ArrowUp, ArrowDown, RotateCcw } from "lucide-react";
import type { PageDef, FieldDef } from "@/lib/page-content/types";
import { mergeContent } from "@/lib/page-content/merge";
import BannerEditor from "@/components/BannerEditor";

function emptyItem(field: FieldDef): any {
  if (!field.itemFields) return "";
  if (field.itemDefaults) return { ...field.itemDefaults };
  const obj: Record<string, any> = {};
  for (const f of field.itemFields) obj[f.key] = "";
  return obj;
}

export default function PageContentEditor({ page }: { page: PageDef }) {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/admin/settings"],
  });

  const initial = useMemo(() => {
    let saved: any = {};
    const raw = settings?.[page.key];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") saved = parsed;
      } catch {
        saved = {};
      }
    }
    return mergeContent(page.defaults, saved) as Record<string, any>;
  }, [settings, page]);

  const [content, setContent] = useState<Record<string, any>>(initial);

  useEffect(() => {
    setContent(initial);
  }, [initial]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/page-content", { key: page.key, value: content });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Saved", description: `${page.label} content updated.` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/public"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed", description: err.message || "Could not save", variant: "destructive" });
    },
  });

  const setField = (sectionKey: string, fieldKey: string, value: any) => {
    setContent((prev) => ({
      ...prev,
      [sectionKey]: { ...(prev[sectionKey] || {}), [fieldKey]: value },
    }));
  };

  const getList = (sectionKey: string, fieldKey: string): any[] => {
    const v = content[sectionKey]?.[fieldKey];
    return Array.isArray(v) ? v : [];
  };

  const updateList = (sectionKey: string, fieldKey: string, next: any[]) => {
    setField(sectionKey, fieldKey, next);
  };

  const resetSection = (sectionKey: string) => {
    setContent((prev) => ({ ...prev, [sectionKey]: structuredClone((page.defaults as any)[sectionKey]) }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const renderField = (sectionKey: string, field: FieldDef) => {
    const value = content[sectionKey]?.[field.key] ?? "";

    if (field.type === "list") {
      const list = getList(sectionKey, field.key);
      const isObjectList = !!field.itemFields;
      return (
        <div key={field.key} className="space-y-3">
          <Label className="text-sm font-medium">{field.label}</Label>
          {list.length === 0 && <p className="text-xs text-muted-foreground">No items yet.</p>}
          {list.map((item, idx) => (
            <div key={idx} className="rounded-lg border p-3 space-y-2" data-testid={`list-${sectionKey}-${field.key}-${idx}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{field.itemLabel || "Item"} {idx + 1}</span>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={idx === 0}
                    onClick={() => { const n = [...list]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; updateList(sectionKey, field.key, n); }}>
                    <ArrowUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={idx === list.length - 1}
                    onClick={() => { const n = [...list]; [n[idx + 1], n[idx]] = [n[idx], n[idx + 1]]; updateList(sectionKey, field.key, n); }}>
                    <ArrowDown className="w-3.5 h-3.5" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                    onClick={() => updateList(sectionKey, field.key, list.filter((_, i) => i !== idx))}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              {isObjectList ? (
                <div className="space-y-2">
                  {field.itemFields!.map((sub) => (
                    <div key={sub.key}>
                      <Label className="text-xs">{sub.label}</Label>
                      {sub.type === "textarea" ? (
                        <Textarea
                          value={item?.[sub.key] ?? ""}
                          onChange={(e) => { const n = [...list]; n[idx] = { ...n[idx], [sub.key]: e.target.value }; updateList(sectionKey, field.key, n); }}
                          rows={3}
                        />
                      ) : (
                        <Input
                          value={item?.[sub.key] ?? ""}
                          onChange={(e) => { const n = [...list]; n[idx] = { ...n[idx], [sub.key]: e.target.value }; updateList(sectionKey, field.key, n); }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Input
                  value={item ?? ""}
                  onChange={(e) => { const n = [...list]; n[idx] = e.target.value; updateList(sectionKey, field.key, n); }}
                />
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => updateList(sectionKey, field.key, [...list, emptyItem(field)])}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add {field.itemLabel || "item"}
          </Button>
        </div>
      );
    }

    if (field.type === "textarea") {
      return (
        <div key={field.key}>
          <Label className="text-sm">{field.label}</Label>
          <Textarea value={value} placeholder={field.placeholder} rows={3}
            onChange={(e) => setField(sectionKey, field.key, e.target.value)}
            data-testid={`field-${sectionKey}-${field.key}`} />
        </div>
      );
    }

    return (
      <div key={field.key}>
        <Label className="text-sm">{field.label}</Label>
        <Input value={value} placeholder={field.placeholder}
          onChange={(e) => setField(sectionKey, field.key, e.target.value)}
          data-testid={`field-${sectionKey}-${field.key}`} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {page.sections.map((section) => {
        if (section.kind === "banners") {
          return (
            <Card key={section.key}>
              <CardHeader>
                <CardTitle>{section.label}</CardTitle>
                {section.description && <CardDescription>{section.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <BannerEditor />
              </CardContent>
            </Card>
          );
        }
        return (
          <Card key={section.key}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle>{section.label}</CardTitle>
                  {section.description && <CardDescription>{section.description}</CardDescription>}
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => resetSection(section.key)} title="Reset section to defaults">
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(section.fields || []).map((field) => renderField(section.key, field))}
            </CardContent>
          </Card>
        );
      })}

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="shadow-lg" data-testid="button-save-page-content">
          {saveMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
          ) : (
            <><Save className="w-4 h-4 mr-2" />Save {page.label}</>
          )}
        </Button>
      </div>
    </div>
  );
}
