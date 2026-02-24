import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/ui-extension";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  ShieldCheck,
  Upload,
  FileText,
  Camera,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  CreditCard,
  Wallet,
  AlertTriangle,
  Star,
  Zap,
  Users,
  BadgeCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSearch } from "wouter";

const idTypes = [
  { value: "nin", label: "National Identification Number (NIN)" },
  { value: "voters_card", label: "Voter's Card" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "international_passport", label: "International Passport" },
];

const benefits = [
  { icon: BadgeCheck, title: "Verified Badge", description: "Stand out with a verified badge on your profile visible to all employers" },
  { icon: Star, title: "Priority Applications", description: "Your applications are shown first to employers, giving you the best chance" },
  { icon: Users, title: "Background Check", description: "Our team performs a background check, building employer confidence" },
  { icon: Zap, title: "Get Hired Faster", description: "Verified applicants are 3x more likely to receive job offers" },
];

export default function Verification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchString = useSearch();
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [gatewayDialogOpen, setGatewayDialogOpen] = useState(false);
  const idDocRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const params = new URLSearchParams(searchString);
  const verifyReference = params.get("reference");
  const flwTransactionId = params.get("transaction_id");
  const gateway = params.get("gateway");

  const isFlutterwaveCallback = gateway === "flutterwave" && flwTransactionId;
  const isPaystackCallback = verifyReference && !gateway;

  const { data: verificationStatus, isLoading } = useQuery<{
    isVerified: boolean;
    request: {
      id: number;
      status: string;
      idType: string;
      idNumber: string;
      adminNotes: string | null;
      createdAt: string;
    } | null;
  }>({
    queryKey: ["/api/verification/status"],
  });

  const { data: paymentVerifyResult, isLoading: isVerifying } = useQuery({
    queryKey: ["/api/verification/verify", verifyReference, flwTransactionId],
    queryFn: async () => {
      if (isFlutterwaveCallback) {
        const res = await fetch(`/api/verification/verify/flutterwave?transaction_id=${flwTransactionId}`, { credentials: "include" });
        return res.json();
      }
      if (isPaystackCallback) {
        const res = await fetch(`/api/verification/verify/paystack?reference=${verifyReference}`, { credentials: "include" });
        return res.json();
      }
      return null;
    },
    enabled: !!(isFlutterwaveCallback || isPaystackCallback),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("idType", idType);
      formData.append("idNumber", idNumber);
      if (idDocument) formData.append("idDocument", idDocument);
      if (selfie) formData.append("selfie", selfie);

      const res = await fetch("/api/verification/submit", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to submit");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/verification/status"] });
      toast({ title: "Documents submitted!", description: "Now proceed to payment to complete verification." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const payMutation = useMutation({
    mutationFn: async (gateway: "paystack" | "flutterwave") => {
      const endpoint = gateway === "paystack" ? "/api/verification/pay/paystack" : "/api/verification/pay/flutterwave";
      const res = await apiRequest("POST", endpoint);
      return res.json();
    },
    onSuccess: (data) => {
      setGatewayDialogOpen(false);
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    },
    onError: (err: Error) => {
      toast({ title: "Payment Error", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Get Verified" description="Verify your identity to stand out to employers." />
        <div className="h-48 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="space-y-6">
        <PageHeader title="Get Verified" description="Verifying your payment..." />
        <Card>
          <CardContent className="p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Verifying your payment, please wait...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentVerifyResult) {
    queryClient.invalidateQueries({ queryKey: ["/api/verification/status"] });
  }

  const isVerified = verificationStatus?.isVerified;
  const request = verificationStatus?.request;
  const hasSubmitted = !!request;
  const isPending = request?.status === "pending";
  const isUnderReview = request?.status === "under_review";
  const isRejected = request?.status === "rejected";
  const isApproved = request?.status === "approved";

  return (
    <div className="space-y-6">
      <PageHeader title="Get Verified" description="Verify your identity to stand out to employers and get hired faster." />

      {isVerified && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-green-800 dark:text-green-300">You're Verified!</h3>
                <p className="text-sm text-green-700 dark:text-green-400">Your identity has been verified. You enjoy priority listing and a verified badge on your profile.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isUnderReview && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-blue-800 dark:text-blue-300">Under Review</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400">Payment received! Our team is reviewing your documents. This usually takes 1-3 business days.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isRejected && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-red-800 dark:text-red-300">Verification Rejected</h3>
                <p className="text-sm text-red-700 dark:text-red-400">
                  {request?.adminNotes || "Your verification was rejected. You can submit a new request below."}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!isVerified && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {benefits.map((benefit, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{benefit.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{benefit.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!isVerified && !isUnderReview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              {isPending ? "Complete Payment" : "Apply for Verification"}
            </CardTitle>
            <CardDescription>
              {isPending 
                ? "Your documents have been submitted. Pay ₦9,999 to complete verification."
                : "Upload your government-issued ID card and a selfie holding the ID to prove your identity. One-time fee of ₦9,999."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isPending && !isApproved && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">ID Type</Label>
                  <Select value={idType} onValueChange={setIdType}>
                    <SelectTrigger data-testid="select-id-type">
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      {idTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">ID Number</Label>
                  <Input
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="Enter your ID number"
                    data-testid="input-id-number"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      ID Card Photo <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-muted-foreground">Upload a clear, well-lit photo of your government-issued ID card (front side)</p>
                    <input
                      ref={idDocRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      className="hidden"
                      onChange={(e) => setIdDocument(e.target.files?.[0] || null)}
                    />
                    <Button
                      variant="outline"
                      className="w-full h-24 flex flex-col gap-1"
                      onClick={() => idDocRef.current?.click()}
                      data-testid="button-upload-id-doc"
                    >
                      {idDocument ? (
                        <>
                          <FileText className="w-6 h-6 text-green-600" />
                          <span className="text-xs truncate max-w-full font-medium">{idDocument.name}</span>
                          <span className="text-[10px] text-green-600">Uploaded</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-medium">Upload ID Card Photo</span>
                          <span className="text-[10px] text-muted-foreground">JPG, PNG, WebP, or PDF</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Verification Selfie <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-muted-foreground">Take a selfie holding your ID card next to your face to confirm your identity</p>
                    <input
                      ref={selfieRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) => setSelfie(e.target.files?.[0] || null)}
                    />
                    <Button
                      variant="outline"
                      className="w-full h-24 flex flex-col gap-1"
                      onClick={() => selfieRef.current?.click()}
                      data-testid="button-upload-selfie"
                    >
                      {selfie ? (
                        <>
                          <Camera className="w-6 h-6 text-green-600" />
                          <span className="text-xs truncate max-w-full font-medium">{selfie.name}</span>
                          <span className="text-[10px] text-green-600">Uploaded</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-6 h-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-medium">Upload Selfie with ID</span>
                          <span className="text-[10px] text-muted-foreground">JPG, PNG, or WebP</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={() => submitMutation.mutate()}
                  disabled={!idType || !idNumber || !idDocument || !selfie || submitMutation.isPending}
                  data-testid="button-submit-verification"
                >
                  {submitMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Submit Documents
                </Button>
              </>
            )}

            {isPending && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Verification Fee</span>
                    <span className="text-2xl font-bold text-primary">₦9,999</span>
                  </div>
                  <p className="text-xs text-muted-foreground">One-time payment for identity verification and background check</p>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    ID: {idTypes.find(t => t.value === request?.idType)?.label || request?.idType} - {request?.idNumber}
                  </p>
                </div>

                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={() => setGatewayDialogOpen(true)}
                  data-testid="button-pay-verification"
                >
                  <CreditCard className="w-4 h-4" />
                  Pay ₦9,999 to Verify
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={gatewayDialogOpen} onOpenChange={setGatewayDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Payment Method</DialogTitle>
            <DialogDescription>
              Select your preferred payment gateway to pay the ₦9,999 verification fee.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center gap-3 py-6"
              onClick={() => payMutation.mutate("paystack")}
              disabled={payMutation.isPending}
              data-testid="button-pay-paystack"
            >
              <CreditCard className="w-8 h-8 text-primary" />
              <span className="font-semibold">Paystack</span>
              <span className="text-xs text-muted-foreground">Cards, Bank, USSD</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center gap-3 py-6"
              onClick={() => payMutation.mutate("flutterwave")}
              disabled={payMutation.isPending}
              data-testid="button-pay-flutterwave"
            >
              <Wallet className="w-8 h-8 text-primary" />
              <span className="font-semibold">Flutterwave</span>
              <span className="text-xs text-muted-foreground">Cards, Bank, Mobile</span>
            </Button>
          </div>
          {payMutation.isPending && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecting to payment...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
