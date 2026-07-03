import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Check, X, Loader2, CreditCard, Wallet, Sparkles, Briefcase, Rocket,
  Globe, Building2, Star, FileText, Users, CalendarCheck, ShieldCheck, Headphones, TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useSearch } from "wouter";
import { usePageTitle } from "@/hooks/use-page-title";
import { usePageContent } from "@/lib/page-content/use-page-content";
import { jobAidDefaults } from "@/lib/page-content/job-aid";

type JobAidBenefit = { key: string; label: string; included: boolean };
type JobAidPlan = {
  id: string;
  name: string;
  amount: number;
  originalAmount: number;
  discount: number;
  benefits: JobAidBenefit[];
  amountFormatted: string;
  originalAmountFormatted: string;
};

const planIcons: Record<string, typeof Sparkles> = {
  casual: Briefcase,
  smart: Rocket,
  remote: Globe,
  freelance: Sparkles,
  corporate: Building2,
};

const planDescriptions: Record<string, string> = {
  casual: "Everyday job search support",
  smart: "Smarter matching & referrals",
  remote: "For remote-first job seekers",
  freelance: "For freelancers & gig workers",
  corporate: "Full-service career support",
};

const benefitIcons: Record<string, typeof Star> = {
  recommendations: Star,
  referrals: Users,
  cv_refining: FileText,
  interview_booking: CalendarCheck,
  verification: ShieldCheck,
  priority_support: Headphones,
};

const infoBenefits = [
  { icon: Star, title: "Personalized Recommendations", desc: "Jobs matched to your skills, location and availability." },
  { icon: Users, title: "Direct Referrals", desc: "Get referred straight to employers looking for you." },
  { icon: FileText, title: "CV Refining", desc: "Professional polishing to make your CV stand out." },
  { icon: CalendarCheck, title: "Interview Booking", desc: "We help arrange and schedule your interviews." },
  { icon: ShieldCheck, title: "Profile Verification", desc: "Get the trusted verified badge employers look for." },
  { icon: Headphones, title: "Priority Support", desc: "Jump the queue with dedicated Job-Aid support." },
];

export default function JobAid() {
  usePageTitle("Job-Aid Plans");
  const c = usePageContent("page_jobaid", jobAidDefaults);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const [gatewayDialogOpen, setGatewayDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const { data: plans, isLoading: plansLoading } = useQuery<JobAidPlan[]>({
    queryKey: ["/api/jobaid/plans"],
  });

  const currentJobAid = (user as any)?.jobAidStatus && (user as any).jobAidStatus !== "none"
    ? (user as any).jobAidPlan
    : null;

  const params = new URLSearchParams(searchString);
  const verifyReference = params.get("reference");
  const flwTransactionId = params.get("transaction_id");
  const flwStatus = params.get("status");
  const gateway = params.get("gateway");

  const isFlutterwaveCallback = gateway === "flutterwave" && !!flwTransactionId;
  const isPaystackCallback = !!verifyReference && !gateway;

  const { data: verifyResult, isLoading: isVerifying } = useQuery({
    queryKey: ["/api/jobaid/verify", verifyReference, flwTransactionId],
    queryFn: async () => {
      if (isFlutterwaveCallback) {
        if (flwStatus !== "successful") {
          return { verified: false, message: "Payment was not successful" };
        }
        const res = await fetch(`/api/jobaid/flutterwave/verify?transaction_id=${flwTransactionId}`, {
          credentials: "include",
        });
        return res.json();
      }
      const res = await fetch(`/api/jobaid/verify?reference=${verifyReference}`, {
        credentials: "include",
      });
      return res.json();
    },
    enabled: !!(isPaystackCallback || isFlutterwaveCallback) && !!user,
  });

  if ((isPaystackCallback || isFlutterwaveCallback) && verifyResult?.verified) {
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    queryClient.invalidateQueries({ queryKey: ["/api/jobaid/status"] });
    toast({
      title: "Job-Aid Activated",
      description: `Your ${verifyResult.plan || "Job-Aid"} plan is now active!`,
    });
    setLocation("/job-aid");
    return null;
  }

  const initPaystack = useMutation({
    mutationFn: async (planId: string) => {
      const res = await apiRequest("POST", "/api/jobaid/initialize", { plan: planId });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    },
    onError: (err: any) => {
      toast({
        title: "Payment Error",
        description: err.message || "Could not initialize payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const initFlutterwave = useMutation({
    mutationFn: async (planId: string) => {
      const res = await apiRequest("POST", "/api/jobaid/flutterwave/initialize", { plan: planId });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.payment_link) {
        window.location.href = data.payment_link;
      }
    },
    onError: (err: any) => {
      toast({
        title: "Payment Error",
        description: err.message || "Could not initialize payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const isPaying = initPaystack.isPending || initFlutterwave.isPending;

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      setLocation("/login");
      return;
    }
    if (user.role !== "applicant") {
      toast({
        title: "Applicants Only",
        description: "Job-Aid plans are only available for job seekers.",
        variant: "destructive",
      });
      return;
    }
    setSelectedPlanId(planId);
    setGatewayDialogOpen(true);
  };

  const handleGatewayChoice = (gw: "paystack" | "flutterwave") => {
    if (!selectedPlanId) return;
    setGatewayDialogOpen(false);
    if (gw === "paystack") {
      initPaystack.mutate(selectedPlanId);
    } else {
      initFlutterwave.mutate(selectedPlanId);
    }
  };

  if ((isPaystackCallback || isFlutterwaveCallback) && isVerifying) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-20 space-y-4">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
            <h2 className="text-xl font-bold">Verifying your payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your Job-Aid plan.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if ((isPaystackCallback || isFlutterwaveCallback) && verifyResult && !verifyResult.verified) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-20 space-y-4">
            <X className="w-12 h-12 mx-auto text-destructive" />
            <h2 className="text-xl font-bold">Payment Failed</h2>
            <p className="text-muted-foreground">{verifyResult.message || "Your payment could not be verified."}</p>
            <Button onClick={() => setLocation("/job-aid")} data-testid="button-retry-jobaid">
              Try Again
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <section className="pt-28 pb-16 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 px-3 py-1 text-sm" data-testid="badge-jobaid-hero">
            <Sparkles className="w-3 h-3 mr-1.5" /> {c.hero.badge}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            {c.hero.title} <span className="text-primary">{c.hero.highlight}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {c.hero.subtitle}
          </p>
        </div>
      </section>

      <section className="pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {plansLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {(plans || []).map((plan, idx) => {
                const Icon = planIcons[plan.id] || Briefcase;
                const isCurrent = currentJobAid === plan.id;
                const popular = plan.id === "remote";
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                  >
                    <Card className={`relative h-full flex flex-col ${popular ? "border-primary shadow-xl shadow-primary/10" : ""}`}>
                      {popular && (
                        <div className="absolute top-0 right-0">
                          <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                            POPULAR
                          </div>
                        </div>
                      )}
                      <CardHeader className="text-center pb-4">
                        <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 ${popular ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          <Icon className="w-7 h-7" />
                        </div>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <CardDescription className="text-xs">{planDescriptions[plan.id] || ""}</CardDescription>
                        <div className="pt-3">
                          {plan.discount > 0 && plan.originalAmount > plan.amount ? (
                            <div className="space-y-1">
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-base line-through text-muted-foreground">{plan.originalAmountFormatted}</span>
                                <Badge variant="destructive" className="text-xs" data-testid={`badge-jobaid-discount-${plan.id}`}>-{plan.discount}%</Badge>
                              </div>
                              <span className="text-3xl font-bold">{plan.amountFormatted}</span>
                            </div>
                          ) : (
                            <span className="text-3xl font-bold">{plan.amountFormatted}</span>
                          )}
                          <span className="text-muted-foreground text-sm ml-1 block">/month</span>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <ul className="space-y-2.5">
                          {plan.benefits.map((b) => {
                            const BIcon = benefitIcons[b.key] || Check;
                            return (
                              <li key={b.key} className={`flex items-start gap-2 ${b.included ? "" : "opacity-40"}`}>
                                {b.included ? (
                                  <BIcon className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                ) : (
                                  <X className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                )}
                                <span className="text-sm">{b.label}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </CardContent>
                      <CardFooter className="pt-4">
                        {isCurrent ? (
                          <Button className="w-full" variant="outline" disabled data-testid={`button-jobaid-current-${plan.id}`}>
                            Current Plan
                          </Button>
                        ) : (
                          <Button
                            className="w-full"
                            variant={popular ? "default" : "outline"}
                            onClick={() => handleSelectPlan(plan.id)}
                            disabled={isPaying}
                            data-testid={`button-jobaid-select-${plan.id}`}
                          >
                            {isPaying ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
                              </>
                            ) : (
                              <>Get {plan.name}</>
                            )}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold mb-3 flex items-center justify-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              {c.info.heading}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{c.info.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {infoBenefits.map((b, i) => (
              <div key={i} className="flex items-start gap-4 bg-card p-5 rounded-xl border">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <b.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold">{b.title}</h4>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto bg-muted/50 rounded-xl py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Payments are securely processed by Paystack or Flutterwave. All prices are in Nigerian Naira (₦).
          </p>
        </div>
      </section>

      <Footer />

      <Dialog open={gatewayDialogOpen} onOpenChange={setGatewayDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Payment Method</DialogTitle>
            <DialogDescription>
              Select your preferred payment gateway to activate your Job-Aid plan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center gap-3 py-6"
              onClick={() => handleGatewayChoice("paystack")}
              disabled={isPaying}
              data-testid="button-jobaid-pay-paystack"
            >
              <CreditCard className="w-8 h-8 text-primary" />
              <span className="font-semibold">Paystack</span>
              <span className="text-xs text-muted-foreground">Cards, Bank, USSD</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center gap-3 py-6"
              onClick={() => handleGatewayChoice("flutterwave")}
              disabled={isPaying}
              data-testid="button-jobaid-pay-flutterwave"
            >
              <Wallet className="w-8 h-8 text-primary" />
              <span className="font-semibold">Flutterwave</span>
              <span className="text-xs text-muted-foreground">Cards, Bank, Mobile</span>
            </Button>
          </div>
          {isPaying && (
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
