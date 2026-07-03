import { useMemo, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, Redirect } from "wouter";
import { motion } from "framer-motion";
import {
  Sparkles,
  Upload,
  FileText,
  Loader2,
  Lock,
  Copy,
  Check,
  Download,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import { PageHeader } from "@/components/ui-extension";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

type JobAidBenefit = { key: string; label: string; included: boolean; limit: number | null };
type JobAidPlan = { id: string; name: string; benefits: JobAidBenefit[] };
type JobAidStatus = { currentPlan: string | null; status: "active" | "none"; jobAidEndDate: string | null };

type RefineResult = { improvedCv: string; suggestions: string[] };

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = [".pdf", ".doc", ".docx", ".txt"];

export default function CvRefine() {
  usePageTitle("AI CV Refiner");
  const { user } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<RefineResult | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: status, isLoading: statusLoading } = useQuery<JobAidStatus>({
    queryKey: ["/api/jobaid/status"],
  });
  const { data: plans } = useQuery<JobAidPlan[]>({
    queryKey: ["/api/jobaid/plans"],
  });

  const eligible = useMemo(() => {
    const active = status?.status === "active" && !!status.currentPlan;
    if (!active) return false;
    const plan = plans?.find((p) => p.id === status?.currentPlan);
    const benefit = plan?.benefits.find((b) => b.key === "cv_refining");
    return !!benefit?.included;
  }, [status, plans]);

  const refineMutation = useMutation({
    mutationFn: async (f: File) => {
      const formData = new FormData();
      formData.append("cv", f);
      const res = await fetch("/api/jobaid/cv-refine", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to refine CV");
      }
      return (await res.json()) as RefineResult;
    },
    onSuccess: (data) => {
      setResult(data);
      toast({ title: "Your CV is ready", description: "Review the improved version and suggestions below." });
    },
    onError: (err: Error) => {
      toast({ title: "Could not refine CV", description: err.message, variant: "destructive" });
    },
  });

  const pickFile = (f: File | null) => {
    if (!f) return;
    const ext = "." + (f.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED.includes(ext)) {
      toast({ title: "Unsupported file", description: "Please upload a PDF, DOC, DOCX or TXT file.", variant: "destructive" });
      return;
    }
    if (f.size > MAX_BYTES) {
      toast({ title: "File too large", description: "Please upload a file under 5MB.", variant: "destructive" });
      return;
    }
    setFile(f);
    setResult(null);
  };

  const copyCv = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.improvedCv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Please select and copy the text manually.", variant: "destructive" });
    }
  };

  const downloadCv = () => {
    if (!result) return;
    const blob = new Blob([result.improvedCv], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "refined-cv.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (user && user.role !== "applicant") {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="space-y-8 pb-10">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <PageHeader
          title="AI CV Refiner"
          description="Upload your CV and let our AI polish it — you'll get an improved version plus tailored suggestions."
        />
      </motion.div>

      {!statusLoading && !eligible ? (
        <Card className="relative overflow-hidden border-border/40 shadow-md" data-testid="card-cvrefine-locked">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
          <CardContent className="relative">
            <div className="flex flex-col items-center text-center py-10 gap-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <div className="max-w-md">
                <p className="font-semibold text-base">The AI CV Refiner is a Job-Aid benefit</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Subscribe to a Job-Aid plan that includes professional CV refining to use this tool.
                </p>
              </div>
              <Link href="/job-aid">
                <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20" data-testid="button-cvrefine-upgrade">
                  <Sparkles className="w-4 h-4" /> View Job-Aid Plans
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="border-border/40 shadow-md" data-testid="card-cvrefine-upload">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display font-bold flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Upload your CV
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Supported formats: PDF, DOC, DOCX or TXT (max 5MB). We don't store your uploaded file.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    pickFile(e.dataTransfer.files?.[0] || null);
                  }}
                  data-testid="dropzone-cvrefine"
                  className="w-full border-2 border-dashed border-border/50 rounded-xl p-8 flex flex-col items-center justify-center gap-2 text-center hover:border-primary/50 hover:bg-muted/30 transition-colors"
                >
                  <FileText className="w-8 h-8 text-muted-foreground" />
                  {file ? (
                    <span className="text-sm font-medium" data-testid="text-cvrefine-filename">{file.name}</span>
                  ) : (
                    <>
                      <span className="text-sm font-medium">Click to choose a file or drag it here</span>
                      <span className="text-xs text-muted-foreground">PDF, DOC, DOCX, TXT</span>
                    </>
                  )}
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  data-testid="input-cvrefine-file"
                  onChange={(e) => pickFile(e.target.files?.[0] || null)}
                />

                <div className="flex items-center gap-3 flex-wrap">
                  <Button
                    onClick={() => file && refineMutation.mutate(file)}
                    disabled={!file || refineMutation.isPending}
                    className="gap-2 rounded-xl"
                    data-testid="button-cvrefine-submit"
                  >
                    {refineMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Refining…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Refine my CV
                      </>
                    )}
                  </Button>
                  {file && !refineMutation.isPending && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setFile(null);
                        setResult(null);
                        if (inputRef.current) inputRef.current.value = "";
                      }}
                      data-testid="button-cvrefine-clear"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {refineMutation.isPending && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-6" data-testid="loading-cvrefine">
              <Loader2 className="w-4 h-4 animate-spin" />
              Our AI is polishing your CV. This can take up to a minute…
            </div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-6 lg:grid-cols-3"
            >
              <Card className="border-border/40 shadow-md lg:col-span-2" data-testid="card-cvrefine-result">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="text-lg font-display font-bold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Your improved CV
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={copyCv} className="gap-1.5" data-testid="button-cvrefine-copy">
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={downloadCv} className="gap-1.5" data-testid="button-cvrefine-download">
                        <Download className="w-3.5 h-3.5" /> Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed bg-muted/30 rounded-xl p-4 border border-border/30" data-testid="text-cvrefine-result">
                    {result.improvedCv}
                  </pre>
                </CardContent>
              </Card>

              <Card className="border-border/40 shadow-md h-fit" data-testid="card-cvrefine-suggestions">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-display font-bold flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.suggestions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No additional suggestions.</p>
                  ) : (
                    <ul className="space-y-3">
                      {result.suggestions.map((s, i) => (
                        <li key={i} className="flex gap-2 text-sm" data-testid={`suggestion-${i}`}>
                          <Badge className="h-5 w-5 p-0 flex items-center justify-center rounded-full flex-shrink-0 bg-primary/10 text-primary border-none">
                            {i + 1}
                          </Badge>
                          <span className="text-muted-foreground">{s}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button
                    variant="ghost"
                    className="mt-4 gap-2 w-full"
                    onClick={() => {
                      setResult(null);
                      setFile(null);
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                    data-testid="button-cvrefine-again"
                  >
                    <RotateCcw className="w-4 h-4" /> Refine another CV
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
