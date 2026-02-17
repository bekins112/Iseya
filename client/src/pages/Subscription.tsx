import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/ui-extension";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Briefcase, Users, Star, TrendingUp, Shield, X, Building2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useSearch } from "wouter";

const plans = [
  {
    id: "free",
    name: "Basic",
    price: 0,
    priceFormatted: "₦0",
    period: "forever",
    description: "Explore the platform",
    features: [
      "Create employer profile",
      "Browse applicant listings",
      "Basic support",
    ],
    limitations: [
      "Cannot post jobs",
      "No priority listing",
      "No verified badge",
    ],
    icon: Briefcase,
    popular: false,
    recommended: false,
  },
  {
    id: "standard",
    name: "Standard",
    price: 9999,
    priceFormatted: "₦9,999",
    period: "per month",
    description: "Start hiring talent",
    features: [
      "Post up to 3 jobs",
      "View applicant profiles",
      "Basic applicant filtering",
      "Email support",
      "Standard job visibility",
    ],
    limitations: [
      "Limited to 3 job postings",
      "No priority listing",
      "No verified badge",
    ],
    icon: Zap,
    popular: false,
    recommended: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: 24999,
    priceFormatted: "₦24,999",
    period: "per month",
    description: "Scale your hiring",
    features: [
      "Post up to 10 jobs",
      "Priority job listing",
      "Advanced applicant filtering",
      "Direct messaging",
      "Analytics dashboard",
      "Priority support",
      "Verified employer badge",
    ],
    limitations: [
      "Limited to 10 job postings",
    ],
    icon: Crown,
    popular: true,
    recommended: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 44999,
    priceFormatted: "₦44,999",
    period: "per month",
    description: "Unlimited hiring power",
    features: [
      "Unlimited job postings",
      "Top priority listing",
      "Advanced applicant filtering",
      "Direct messaging",
      "Full analytics dashboard",
      "Dedicated support",
      "Verified employer badge",
      "Featured company profile",
    ],
    limitations: [],
    icon: Building2,
    popular: false,
    recommended: false,
  },
];

const planOrder = ["free", "standard", "premium", "enterprise"];

export default function Subscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const currentPlan = user?.subscriptionStatus || "free";

  const { data: subscriptionStatus } = useQuery<{
    currentPlan: string;
    planName: string;
    jobLimit: number;
    activeJobCount: number;
    canPostJob: boolean;
    subscriptionEndDate: string | null;
  }>({
    queryKey: ["/api/subscription/status"],
    enabled: !!user && user.role === "employer",
  });

  const verifyReference = new URLSearchParams(searchString).get("reference");

  const { data: verifyResult, isLoading: isVerifying } = useQuery({
    queryKey: ["/api/subscription/verify", verifyReference],
    queryFn: async () => {
      const res = await fetch(`/api/subscription/verify?reference=${verifyReference}`, {
        credentials: "include",
      });
      return res.json();
    },
    enabled: !!verifyReference && !!user,
  });

  if (verifyReference && verifyResult?.verified) {
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
    toast({
      title: "Subscription Activated",
      description: `Your ${verifyResult.plan} plan is now active!`,
    });
    setLocation("/subscription");
    return null;
  }

  const initPayment = useMutation({
    mutationFn: async (planId: string) => {
      const res = await apiRequest("POST", "/api/subscription/initialize", { plan: planId });
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

  if (user && user.role !== "employer") {
    return (
      <div className="text-center py-20">
        <Crown className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2 className="text-2xl font-bold mb-2">Employer Only</h2>
        <p className="text-muted-foreground">Subscription plans are only available for employers.</p>
      </div>
    );
  }

  if (verifyReference && isVerifying) {
    return (
      <div className="text-center py-20 space-y-4">
        <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
        <h2 className="text-xl font-bold">Verifying your payment...</h2>
        <p className="text-muted-foreground">Please wait while we confirm your subscription.</p>
      </div>
    );
  }

  if (verifyReference && verifyResult && !verifyResult.verified) {
    return (
      <div className="text-center py-20 space-y-4">
        <X className="w-12 h-12 mx-auto text-destructive" />
        <h2 className="text-xl font-bold">Payment Failed</h2>
        <p className="text-muted-foreground">{verifyResult.message || "Your payment could not be verified."}</p>
        <Button onClick={() => setLocation("/subscription")} data-testid="button-retry-sub">
          Try Again
        </Button>
      </div>
    );
  }

  const currentPlanIndex = planOrder.indexOf(currentPlan);

  const getPlanAction = (planId: string) => {
    const planIndex = planOrder.indexOf(planId);
    if (planId === currentPlan) return "current";
    if (planId === "free") return "downgrade";
    if (planIndex > currentPlanIndex) return "upgrade";
    return "downgrade";
  };

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Subscription Plans"
        description="Choose the right plan for your hiring needs"
      />

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {currentPlan !== "free" ? (
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary-foreground" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Your current plan</p>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {plans.find(p => p.id === currentPlan)?.name || "Basic"}
                  {currentPlan !== "free" && (
                    <Badge className="bg-primary">Active</Badge>
                  )}
                </h3>
                {subscriptionStatus && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {subscriptionStatus.jobLimit === -1
                      ? "Unlimited job postings"
                      : subscriptionStatus.jobLimit === 0
                      ? "No job postings included"
                      : `${subscriptionStatus.activeJobCount}/${subscriptionStatus.jobLimit} jobs posted`}
                  </p>
                )}
              </div>
            </div>
            {user?.subscriptionEndDate && currentPlan !== "free" && (
              <div className="text-sm text-muted-foreground">
                Renews: {new Date(user.subscriptionEndDate).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, idx) => {
          const Icon = plan.icon;
          const action = getPlanAction(plan.id);

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <Card className={`relative h-full flex flex-col ${
                plan.popular ? "border-primary shadow-xl shadow-primary/10" : ""
              }`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                      MOST POPULAR
                    </div>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 ${
                    plan.popular ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-xs">{plan.description}</CardDescription>
                  <div className="pt-3">
                    <span className="text-3xl font-bold">{plan.priceFormatted}</span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground text-sm ml-1">/{plan.period}</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.limitations.length > 0 && (
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <X className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>

                <CardFooter className="pt-4">
                  {action === "current" ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled
                      data-testid={`button-current-${plan.id}`}
                    >
                      Current Plan
                    </Button>
                  ) : action === "upgrade" ? (
                    <Button
                      className="w-full"
                      onClick={() => initPayment.mutate(plan.id)}
                      disabled={initPayment.isPending}
                      data-testid={`button-upgrade-${plan.id}`}
                    >
                      {initPayment.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Upgrade to {plan.name}
                        </>
                      )}
                    </Button>
                  ) : plan.id === "free" ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled
                      data-testid="button-free-plan"
                    >
                      Free Forever
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => initPayment.mutate(plan.id)}
                      disabled={initPayment.isPending}
                      data-testid={`button-select-${plan.id}`}
                    >
                      {initPayment.isPending ? "Processing..." : `Switch to ${plan.name}`}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Why Upgrade?
          </CardTitle>
          <CardDescription>
            Premium benefits for serious employers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: TrendingUp, title: "Priority Listing", desc: "Your jobs appear at the top of search results" },
              { icon: Users, title: "Hire More", desc: "Post more jobs and reach more candidates" },
              { icon: Shield, title: "Verified Badge", desc: "Build trust with a verified employer badge" },
              { icon: Zap, title: "Dedicated Support", desc: "Get priority support when you need help" },
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-4xl mx-auto bg-muted/50">
        <CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Payments are securely processed by Paystack. All prices are in Nigerian Naira (₦). Subscriptions renew monthly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
