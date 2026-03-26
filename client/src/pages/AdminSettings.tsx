import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { PageHeader } from "@/components/ui-extension";
import { Settings, Save, Loader2, CreditCard, ShieldCheck, Percent, DollarSign, Briefcase, CalendarCheck, UserPlus, Phone, Mail, MapPin, Globe, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const settingsSchema = z.object({
  subscription_standard_price: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0, "Must be a valid amount"),
  subscription_premium_price: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0, "Must be a valid amount"),
  subscription_enterprise_price: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0, "Must be a valid amount"),
  subscription_standard_discount: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, "Must be 0-100"),
  subscription_premium_discount: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, "Must be 0-100"),
  subscription_enterprise_discount: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, "Must be 0-100"),
  verification_fee: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0, "Must be a valid amount"),
  verification_discount: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, "Must be 0-100"),
  job_limit_free: z.string().refine(v => !isNaN(Number(v)) && Number.isInteger(Number(v)), "Must be a whole number"),
  job_limit_standard: z.string().refine(v => !isNaN(Number(v)) && Number.isInteger(Number(v)), "Must be a whole number"),
  job_limit_premium: z.string().refine(v => !isNaN(Number(v)) && Number.isInteger(Number(v)), "Must be a whole number"),
  job_limit_enterprise: z.string().refine(v => !isNaN(Number(v)) && Number.isInteger(Number(v)), "Must be a whole number (-1 = unlimited)"),
  interview_credits_free: z.string().refine(v => !isNaN(Number(v)) && Number.isInteger(Number(v)) && Number(v) >= 0, "Must be 0 or more"),
  interview_credits_standard: z.string().refine(v => !isNaN(Number(v)) && Number.isInteger(Number(v)) && Number(v) >= 0, "Must be 0 or more"),
  interview_credits_premium: z.string().refine(v => !isNaN(Number(v)) && Number.isInteger(Number(v)) && Number(v) >= 0, "Must be 0 or more"),
  interview_credits_enterprise: z.string().refine(v => !isNaN(Number(v)) && Number.isInteger(Number(v)) && Number(v) >= 0, "Must be 0 or more"),
  agent_job_post_fee: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0, "Must be a valid amount"),
  agent_job_post_discount: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, "Must be 0-100"),
  app_phone: z.string().optional().default(""),
  app_email: z.string().optional().default(""),
  app_address: z.string().optional().default(""),
  app_facebook: z.string().optional().default(""),
  app_twitter: z.string().optional().default(""),
  app_instagram: z.string().optional().default(""),
  app_linkedin: z.string().optional().default(""),
  app_tiktok: z.string().optional().default(""),
  paystack_public_key: z.string().optional().default(""),
  paystack_secret_key: z.string().optional().default(""),
  flutterwave_public_key: z.string().optional().default(""),
  flutterwave_secret_key: z.string().optional().default(""),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString()}`;
}

function calcDiscounted(price: string, discount: string) {
  const p = Number(price) || 0;
  const d = Number(discount) || 0;
  return Math.round(p * (1 - d / 100));
}

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/admin/settings"],
    enabled: !!user && user.role === "admin",
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      subscription_standard_price: "9999",
      subscription_premium_price: "24999",
      subscription_enterprise_price: "44999",
      subscription_standard_discount: "0",
      subscription_premium_discount: "0",
      subscription_enterprise_discount: "0",
      verification_fee: "9999",
      verification_discount: "0",
      job_limit_free: "1",
      job_limit_standard: "5",
      job_limit_premium: "10",
      job_limit_enterprise: "-1",
      interview_credits_free: "0",
      interview_credits_standard: "0",
      interview_credits_premium: "3",
      interview_credits_enterprise: "5",
      agent_job_post_fee: "5000",
      agent_job_post_discount: "0",
      app_phone: "",
      app_email: "",
      app_address: "",
      app_facebook: "",
      app_twitter: "",
      app_instagram: "",
      app_linkedin: "",
      app_tiktok: "",
      paystack_public_key: "",
      paystack_secret_key: "",
      flutterwave_public_key: "",
      flutterwave_secret_key: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        subscription_standard_price: settings.subscription_standard_price || "9999",
        subscription_premium_price: settings.subscription_premium_price || "24999",
        subscription_enterprise_price: settings.subscription_enterprise_price || "44999",
        subscription_standard_discount: settings.subscription_standard_discount || "0",
        subscription_premium_discount: settings.subscription_premium_discount || "0",
        subscription_enterprise_discount: settings.subscription_enterprise_discount || "0",
        verification_fee: settings.verification_fee || "9999",
        verification_discount: settings.verification_discount || "0",
        job_limit_free: settings.job_limit_free || "1",
        job_limit_standard: settings.job_limit_standard || "5",
        job_limit_premium: settings.job_limit_premium || "10",
        job_limit_enterprise: settings.job_limit_enterprise || "-1",
        interview_credits_free: settings.interview_credits_free || "0",
        interview_credits_standard: settings.interview_credits_standard || "0",
        interview_credits_premium: settings.interview_credits_premium || "3",
        interview_credits_enterprise: settings.interview_credits_enterprise || "5",
        agent_job_post_fee: settings.agent_job_post_fee || "5000",
        agent_job_post_discount: settings.agent_job_post_discount || "0",
        app_phone: settings.app_phone || "",
        app_email: settings.app_email || "",
        app_address: settings.app_address || "",
        app_facebook: settings.app_facebook || "",
        app_twitter: settings.app_twitter || "",
        app_instagram: settings.app_instagram || "",
        app_linkedin: settings.app_linkedin || "",
        app_tiktok: settings.app_tiktok || "",
        paystack_public_key: settings.paystack_public_key || "",
        paystack_secret_key: settings.paystack_secret_key || "",
        flutterwave_public_key: settings.flutterwave_public_key || "",
        flutterwave_secret_key: settings.flutterwave_secret_key || "",
      });
    }
  }, [settings, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      const res = await apiRequest("PATCH", "/api/admin/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/public"] });
      toast({ title: "Settings saved", description: "Platform fees and discounts have been updated." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    saveMutation.mutate(data);
  };

  const watchedValues = form.watch();

  if (user?.role !== "admin") {
    return (
      <div className="text-center py-20">
        <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">Only administrators can access platform settings.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Platform Settings" description="Manage subscription fees, verification fees, and discounts" />
        <div className="h-48 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Platform Settings"
        description="Configure subscription fees, verification fees, and promotional discounts"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="text-subscription-settings-title">
                <CreditCard className="w-5 h-5 text-primary" />
                Subscription Plans Pricing
              </CardTitle>
              <CardDescription>
                Set the monthly prices and discounts for each subscription tier. Prices are in Nigerian Naira (₦).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid gap-8">
                <div className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg" data-testid="text-free-plan-label">Basic (Free) Plan</h3>
                    <Badge variant="secondary">Free</Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="job_limit_free"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" />
                            Job Posting Limit
                          </FormLabel>
                          <FormControl>
                            <Input type="number" step="1" {...field} data-testid="input-job-limit-free" />
                          </FormControl>
                          <FormDescription>Max active jobs (-1 = unlimited)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="interview_credits_free"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <CalendarCheck className="w-3.5 h-3.5" />
                            Interview Credits
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="1" {...field} data-testid="input-interview-credits-free" />
                          </FormControl>
                          <FormDescription>Per billing period</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg" data-testid="text-standard-plan-label">Standard Plan</h3>
                    <Badge variant="outline" data-testid="text-standard-final-price">
                      Final: {formatNaira(calcDiscounted(watchedValues.subscription_standard_price, watchedValues.subscription_standard_discount))}/month
                    </Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="subscription_standard_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            Price (₦)
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="1" {...field} data-testid="input-standard-price" />
                          </FormControl>
                          <FormDescription>Base monthly price</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subscription_standard_discount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <Percent className="w-3.5 h-3.5" />
                            Discount (%)
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" step="1" {...field} data-testid="input-standard-discount" />
                          </FormControl>
                          <FormDescription>Promotional discount</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="job_limit_standard"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" />
                            Job Posting Limit
                          </FormLabel>
                          <FormControl>
                            <Input type="number" step="1" {...field} data-testid="input-job-limit-standard" />
                          </FormControl>
                          <FormDescription>Max active jobs (-1 = unlimited)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="interview_credits_standard"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <CalendarCheck className="w-3.5 h-3.5" />
                            Interview Credits
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="1" {...field} data-testid="input-interview-credits-standard" />
                          </FormControl>
                          <FormDescription>Per billing period</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-6 space-y-4 border-primary/30 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg" data-testid="text-premium-plan-label">Premium Plan</h3>
                    <Badge data-testid="text-premium-final-price">
                      Final: {formatNaira(calcDiscounted(watchedValues.subscription_premium_price, watchedValues.subscription_premium_discount))}/month
                    </Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="subscription_premium_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            Price (₦)
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="1" {...field} data-testid="input-premium-price" />
                          </FormControl>
                          <FormDescription>Base monthly price</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subscription_premium_discount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <Percent className="w-3.5 h-3.5" />
                            Discount (%)
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" step="1" {...field} data-testid="input-premium-discount" />
                          </FormControl>
                          <FormDescription>Promotional discount</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="job_limit_premium"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" />
                            Job Posting Limit
                          </FormLabel>
                          <FormControl>
                            <Input type="number" step="1" {...field} data-testid="input-job-limit-premium" />
                          </FormControl>
                          <FormDescription>Max active jobs (-1 = unlimited)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="interview_credits_premium"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <CalendarCheck className="w-3.5 h-3.5" />
                            Interview Credits
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="1" {...field} data-testid="input-interview-credits-premium" />
                          </FormControl>
                          <FormDescription>Per billing period</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg" data-testid="text-enterprise-plan-label">Enterprise Plan</h3>
                    <Badge variant="outline" data-testid="text-enterprise-final-price">
                      Final: {formatNaira(calcDiscounted(watchedValues.subscription_enterprise_price, watchedValues.subscription_enterprise_discount))}/month
                    </Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="subscription_enterprise_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            Price (₦)
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="1" {...field} data-testid="input-enterprise-price" />
                          </FormControl>
                          <FormDescription>Base monthly price</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subscription_enterprise_discount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <Percent className="w-3.5 h-3.5" />
                            Discount (%)
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" step="1" {...field} data-testid="input-enterprise-discount" />
                          </FormControl>
                          <FormDescription>Promotional discount</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="job_limit_enterprise"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" />
                            Job Posting Limit
                          </FormLabel>
                          <FormControl>
                            <Input type="number" step="1" {...field} data-testid="input-job-limit-enterprise" />
                          </FormControl>
                          <FormDescription>Max active jobs (-1 = unlimited)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="interview_credits_enterprise"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <CalendarCheck className="w-3.5 h-3.5" />
                            Interview Credits
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="1" {...field} data-testid="input-interview-credits-enterprise" />
                          </FormControl>
                          <FormDescription>Per billing period</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="text-verification-settings-title">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Verification Fee
              </CardTitle>
              <CardDescription>
                Set the monthly verification fee for applicants. This is the amount applicants pay to get verified on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg" data-testid="text-verification-fee-label">Applicant Verification</h3>
                  <Badge variant="outline" data-testid="text-verification-final-price">
                    Final: {formatNaira(calcDiscounted(watchedValues.verification_fee, watchedValues.verification_discount))}/month
                  </Badge>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="verification_fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          Fee (₦)
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="1" {...field} data-testid="input-verification-fee" />
                        </FormControl>
                        <FormDescription>Monthly verification fee</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="verification_discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Percent className="w-3.5 h-3.5" />
                          Discount (%)
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" step="1" {...field} data-testid="input-verification-discount" />
                        </FormControl>
                        <FormDescription>Promotional discount</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="text-agent-settings-title">
                <UserPlus className="w-5 h-5 text-primary" />
                Agent Pay-Per-Post Fee
              </CardTitle>
              <CardDescription>
                Set the fee agents pay per job post when using pay-per-post credits instead of a subscription plan. Agents buy credits at this rate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg" data-testid="text-agent-fee-label">Per-Post Credit Fee</h3>
                  <Badge variant="outline" data-testid="text-agent-fee-preview">
                    Final: {formatNaira(calcDiscounted(watchedValues.agent_job_post_fee, watchedValues.agent_job_post_discount))}/post
                  </Badge>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="agent_job_post_fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          Fee per Post (₦)
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="100" {...field} data-testid="input-agent-job-post-fee" />
                        </FormControl>
                        <FormDescription>Base price per agent job post credit</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="agent_job_post_discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Percent className="w-3.5 h-3.5" />
                          Discount (%)
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" step="1" {...field} data-testid="input-agent-job-post-discount" />
                        </FormControl>
                        <FormDescription>Promotional discount on per-post fee</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="text-app-info-title">
                <Phone className="w-5 h-5 text-primary" />
                App Contact Information
              </CardTitle>
              <CardDescription>
                Set the contact details displayed on the website footer, contact page, and other public areas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="app_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. +234 800 123 4567" {...field} data-testid="input-app-phone" />
                        </FormControl>
                        <FormDescription>Public contact phone number</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="app_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. support@iseya.ng" {...field} data-testid="input-app-email" />
                        </FormControl>
                        <FormDescription>Public contact email</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="app_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        Office Address
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 15 Admiralty Way, Lekki, Lagos, Nigeria" {...field} data-testid="input-app-address" />
                      </FormControl>
                      <FormDescription>Physical office address</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="text-social-links-title">
                <Globe className="w-5 h-5 text-primary" />
                Social Media Links
              </CardTitle>
              <CardDescription>
                Set the social media profile URLs. Leave blank to hide a social link from the website.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="app_facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                          <Input placeholder="https://facebook.com/yourpage" {...field} data-testid="input-app-facebook" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="app_twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>X (Twitter)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://x.com/yourhandle" {...field} data-testid="input-app-twitter" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="app_instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/yourhandle" {...field} data-testid="input-app-instagram" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="app_linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/company/yourcompany" {...field} data-testid="input-app-linkedin" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="app_tiktok"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TikTok</FormLabel>
                        <FormControl>
                          <Input placeholder="https://tiktok.com/@yourhandle" {...field} data-testid="input-app-tiktok" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="text-payment-gateway-title">
                <Key className="w-5 h-5 text-primary" />
                Payment Gateway Keys
              </CardTitle>
              <CardDescription>
                Configure your Paystack and Flutterwave API keys. These are sensitive credentials used for processing payments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg" data-testid="text-paystack-label">Paystack</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paystack_public_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Public Key</FormLabel>
                        <FormControl>
                          <Input placeholder="pk_live_..." {...field} data-testid="input-paystack-public-key" />
                        </FormControl>
                        <FormDescription>Paystack public/publishable key</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paystack_secret_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secret Key</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="sk_live_..." {...field} data-testid="input-paystack-secret-key" />
                        </FormControl>
                        <FormDescription>Paystack secret key (keep private)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="border rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg" data-testid="text-flutterwave-label">Flutterwave</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="flutterwave_public_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Public Key</FormLabel>
                        <FormControl>
                          <Input placeholder="FLWPUBK-..." {...field} data-testid="input-flutterwave-public-key" />
                        </FormControl>
                        <FormDescription>Flutterwave public key</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="flutterwave_secret_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secret Key</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="FLWSECK-..." {...field} data-testid="input-flutterwave-secret-key" />
                        </FormControl>
                        <FormDescription>Flutterwave secret key (keep private)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={saveMutation.isPending}
              data-testid="button-save-settings"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
