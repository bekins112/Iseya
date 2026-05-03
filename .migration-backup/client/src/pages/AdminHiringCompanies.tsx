import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui-extension";
import { useToast } from "@/hooks/use-toast";
import { Building2, Plus, Pencil, Trash2, Upload } from "lucide-react";
// PageHeader does not accept icon prop; we render icon inside the actions/title area
import type { HiringCompany } from "@shared/schema";
import { usePageTitle } from "@/hooks/use-page-title";

export default function AdminHiringCompanies() {
  usePageTitle("Hiring Companies");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HiringCompany | null>(null);
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { data: companies = [], isLoading } = useQuery<HiringCompany[]>({
    queryKey: ["/api/admin/hiring-companies"],
  });

  const resetForm = () => {
    setEditing(null);
    setName("");
    setWebsiteUrl("");
    setDisplayOrder("0");
    setIsActive(true);
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (c: HiringCompany) => {
    setEditing(c);
    setName(c.name);
    setWebsiteUrl(c.websiteUrl || "");
    setDisplayOrder(String(c.displayOrder ?? 0));
    setIsActive(c.isActive ?? true);
    setLogoFile(null);
    setLogoPreview(c.logoUrl);
    setDialogOpen(true);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setLogoFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Name is required");
      if (!editing && !logoFile) throw new Error("Logo is required");

      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("websiteUrl", websiteUrl.trim());
      fd.append("displayOrder", displayOrder || "0");
      fd.append("isActive", String(isActive));
      if (logoFile) fd.append("logo", logoFile);

      const url = editing
        ? `/api/admin/hiring-companies/${editing.id}`
        : "/api/admin/hiring-companies";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, { method, body: fd, credentials: "include" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to save");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: editing ? "Company updated" : "Company added",
        description: editing
          ? `${name} has been updated.`
          : `${name} is now showing on the landing page.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hiring-companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hiring-companies"] });
      setDialogOpen(false);
      resetForm();
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) =>
      apiRequest("DELETE", `/api/admin/hiring-companies/${id}`),
    onSuccess: () => {
      toast({ title: "Deleted", description: "Company removed." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hiring-companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hiring-companies"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async (c: HiringCompany) => {
      const fd = new FormData();
      fd.append("isActive", String(!c.isActive));
      const res = await fetch(`/api/admin/hiring-companies/${c.id}`, {
        method: "PATCH",
        body: fd,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hiring-companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hiring-companies"] });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Companies Currently Hiring"
        description="Manage the list of hiring companies shown on the landing page."
        actions={
          <Button onClick={openCreate} data-testid="button-add-hiring-company">
            <Plus className="w-4 h-4 mr-2" /> Add Company
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Hiring Companies ({companies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground text-sm">Loading…</div>
          ) : companies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No companies added yet.</p>
              <p className="text-xs mt-1">
                Click "Add Company" to feature companies hiring on Iṣéyá.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((c) => (
                <div
                  key={c.id}
                  className="border rounded-lg p-4 flex flex-col gap-3 bg-card"
                  data-testid={`card-company-${c.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img
                        src={c.logoUrl}
                        alt={c.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="font-semibold truncate"
                        data-testid={`text-company-name-${c.id}`}
                      >
                        {c.name}
                      </div>
                      {c.websiteUrl && (
                        <a
                          href={c.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline truncate block"
                        >
                          {c.websiteUrl}
                        </a>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={c.isActive ? "default" : "secondary"}>
                          {c.isActive ? "Active" : "Hidden"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Order: {c.displayOrder ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={c.isActive ?? true}
                        onCheckedChange={() => toggleActive.mutate(c)}
                        data-testid={`switch-active-${c.id}`}
                      />
                      <span className="text-xs text-muted-foreground">Show on site</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(c)}
                        data-testid={`button-edit-company-${c.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Delete ${c.name}?`)) deleteMutation.mutate(c.id);
                        }}
                        data-testid={`button-delete-company-${c.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Company" : "Add Hiring Company"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the company information shown on the landing page."
                : "Feature a company that's hiring through Iṣéyá."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dangote Group"
                data-testid="input-company-name"
              />
            </div>

            <div>
              <Label htmlFor="company-website">Website URL (optional)</Label>
              <Input
                id="company-website"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                data-testid="input-company-website"
              />
            </div>

            <div>
              <Label htmlFor="company-logo">Logo {editing ? "(leave blank to keep current)" : "*"}</Label>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-20 h-20 rounded border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <Input
                  id="company-logo"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={onFileChange}
                  data-testid="input-company-logo"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                PNG/JPG/SVG, max 5MB. Square or transparent background looks best.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="company-order">Display Order</Label>
                <Input
                  id="company-order"
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  data-testid="input-company-order"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower numbers show first.
                </p>
              </div>
              <div>
                <Label>Active</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    data-testid="switch-company-active"
                  />
                  <span className="text-sm text-muted-foreground">
                    {isActive ? "Visible" : "Hidden"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              data-testid="button-save-company"
            >
              {saveMutation.isPending ? "Saving…" : editing ? "Save Changes" : "Add Company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
