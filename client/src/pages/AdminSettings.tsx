import { useEffect, useState } from "react";
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
import { Settings, Save, Loader2, CreditCard, ShieldCheck, Percent, DollarSign, Briefcase, CalendarCheck, UserPlus, Phone, Mail, MapPin, Globe, Key, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { usePageTitle } from "@/hooks/use-page-title";

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString()}`;
}

function calcDiscounted(price: string, discount: string) {
  const p = Number(price) || 0;
  const d = Number(discount) || 0;
  return Math.round(p * (1 - d / 100));
}

function SectionSaveButton({ isPending, label }: { isPending: boolean; label?: string }) {
  return (
    <div className="flex justify-end pt-2">
      <Button type="submit" disabled={isPending} data-testid={`button-save-${label || "section"}`}>
        {isPending ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
        ) : (
          <><Save className="w-4 h-4 mr-2" />Save {label || "Settings"}</>
        )}
      </Button>
    </div>
  );
}

function useSectionSave(sectionName: string) {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const res = await apiRequest("PATCH", "/api/admin/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/public"] });
      toast({ title: `${sectionName} saved`, description: `${sectionName} have been updated successfully.` });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

const subscriptionSchema = z.object({
  subscription_standard_price: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0, "Must be a valid amount"),
  subscription_premium_price: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0, "Must be a valid amount"),
  subscription_enterprise_price: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0, "Must be a valid amount"),
  subscription_standard_discount: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, "Must be 0-100"),
  subscription_premium_discount: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, "Must be 0-100"),
  subscription_enterprise_discount: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, "Must be 0-100"),
  job_limit_free: z.string().refine(v => !isNaN(Number(v)) && Number.isInteger(Number(v)), "Must be a whole number"),
  job_limit_standard: z.string().refine(v => !isNaN(Number(v)) && Number.isInteger(Number(v)), "Must be a whole number"),
  job_limit_premium: z.string().refine(v => !isNaN(Number(v)) && Number.isInteger(Number(v)), "Must be a whole number"),
  job_limit_enterprise: z.string().refine(v => !isNaN(Number(v)) && Number.isInteger(Number(v)), "Must be a whole number (-1 = unlimited)"),
  interview_credits_free: z.string().refine(v => !isNaN(Number(v)) && Number.isInteger(Number(v)) && Number(v) >= 0, "Must be 0 or more"),
  interview_credits_standard: z.string().refine(v => !isNaN(Number(v)) && Number.isInteger(Number(v)) && Number(v) >= 0, "Must be 0 or more"),
  interview_credits_premium: z.string().refine(v => !isNaN(Number(v)) && Number.isInteger(Number(v)) && Number(v) >= 0, "Must be 0 or more"),
  interview_credits_enterprise: z.string().refine(v => !isNaN(Number(v)) && Number.isInteger(Number(v)) && Number(v) >= 0, "Must be 0 or more"),
  verification_fee: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0, "Must be a valid amount"),
  verification_discount: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, "Must be 0-100"),
  agent_job_post_fee: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0, "Must be a valid amount"),
  agent_job_post_discount: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, "Must be 0-100"),
});

const contactSchema = z.object({
  app_phone: z.string().optional().default(""),
  app_email: z.string().optional().default(""),
  app_address: z.string().optional().default(""),
});

const socialSchema = z.object({
  app_facebook: z.string().optional().default(""),
  app_twitter: z.string().optional().default(""),
  app_instagram: z.string().optional().default(""),
  app_linkedin: z.string().optional().default(""),
  app_tiktok: z.string().optional().default(""),
});

const paymentSchema = z.object({
  paystack_public_key: z.string().optional().default(""),
  paystack_secret_key: z.string().optional().default(""),
  flutterwave_public_key: z.string().optional().default(""),
  flutterwave_secret_key: z.string().optional().default(""),
});

const youtubeSchema = z.object({
  youtube_landing: z.string().optional().default(""),
  youtube_employers: z.string().optional().default(""),
  youtube_agents: z.string().optional().default(""),
  youtube_applicants: z.string().optional().default(""),
});

export default function AdminSettings() {
  usePageTitle("Admin Settings");
  const { user } = useAuth();

  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/admin/settings"],
    enabled: !!user && user.role === "admin",
  });

  const subSave = useSectionSave("Subscription & Pricing");
  const contactSave = useSectionSave("Contact Info");
  const socialSave = useSectionSave("Social Links");
  const paymentSave = useSectionSave("Payment Keys");
  const youtubeSave = useSectionSave("YouTube Links");

  const subForm = useForm({ resolver: zodResolver(subscriptionSchema), defaultValues: {
    subscription_standard_price: "9999", subscription_premium_price: "24999", subscription_enterprise_price: "44999",
    subscription_standard_discount: "0", subscription_premium_discount: "0", subscription_enterprise_discount: "0",
    verification_fee: "9999", verification_discount: "0",
    job_limit_free: "1", job_limit_standard: "5", job_limit_premium: "10", job_limit_enterprise: "-1",
    interview_credits_free: "0", interview_credits_standard: "0", interview_credits_premium: "3", interview_credits_enterprise: "5",
    agent_job_post_fee: "5000", agent_job_post_discount: "0",
  }});

  const contactForm = useForm({ resolver: zodResolver(contactSchema), defaultValues: { app_phone: "", app_email: "", app_address: "" }});
  const socialForm = useForm({ resolver: zodResolver(socialSchema), defaultValues: { app_facebook: "", app_twitter: "", app_instagram: "", app_linkedin: "", app_tiktok: "" }});
  const paymentForm = useForm({ resolver: zodResolver(paymentSchema), defaultValues: { paystack_public_key: "", paystack_secret_key: "", flutterwave_public_key: "", flutterwave_secret_key: "" }});
  const youtubeForm = useForm({ resolver: zodResolver(youtubeSchema), defaultValues: { youtube_landing: "", youtube_employers: "", youtube_agents: "", youtube_applicants: "" }});

  useEffect(() => {
    if (settings) {
      subForm.reset({
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
      });
      contactForm.reset({ app_phone: settings.app_phone || "", app_email: settings.app_email || "", app_address: settings.app_address || "" });
      socialForm.reset({ app_facebook: settings.app_facebook || "", app_twitter: settings.app_twitter || "", app_instagram: settings.app_instagram || "", app_linkedin: settings.app_linkedin || "", app_tiktok: settings.app_tiktok || "" });
      paymentForm.reset({ paystack_public_key: settings.paystack_public_key || "", paystack_secret_key: settings.paystack_secret_key || "", flutterwave_public_key: settings.flutterwave_public_key || "", flutterwave_secret_key: settings.flutterwave_secret_key || "" });
      youtubeForm.reset({ youtube_landing: settings.youtube_landing || "", youtube_employers: settings.youtube_employers || "", youtube_agents: settings.youtube_agents || "", youtube_applicants: settings.youtube_applicants || "" });
    }
  }, [settings]);

  const watchSub = subForm.watch();

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
        description="Configure pricing, contact info, social links, payment keys, and video content"
      />

      {/* SUBSCRIPTION & PRICING */}
      <Form {...subForm}>
        <form onSubmit={subForm.handleSubmit((data) => subSave.mutate(data))} className="space-y-8">
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
                    <FormField control={subForm.control} name="job_limit_free" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />Job Posting Limit</FormLabel>
                        <FormControl><Input type="number" step="1" {...field} data-testid="input-job-limit-free" /></FormControl>
                        <FormDescription>Max active jobs (-1 = unlimited)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={subForm.control} name="interview_credits_free" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1"><CalendarCheck className="w-3.5 h-3.5" />Interview Credits</FormLabel>
                        <FormControl><Input type="number" min="0" step="1" {...field} data-testid="input-interview-credits-free" /></FormControl>
                        <FormDescription>Per billing period</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {(["standard", "premium", "enterprise"] as const).map((tier) => {
                  const isPremium = tier === "premium";
                  const labels: Record<string, string> = { standard: "Standard", premium: "Premium", enterprise: "Enterprise" };
                  return (
                    <div key={tier} className={`border rounded-lg p-6 space-y-4 ${isPremium ? "border-primary/30 bg-primary/5" : ""}`}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg" data-testid={`text-${tier}-plan-label`}>{labels[tier]} Plan</h3>
                        <Badge variant={isPremium ? "default" : "outline"} data-testid={`text-${tier}-final-price`}>
                          Final: {formatNaira(calcDiscounted(watchSub[`subscription_${tier}_price` as keyof typeof watchSub], watchSub[`subscription_${tier}_discount` as keyof typeof watchSub]))}/month
                        </Badge>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField control={subForm.control} name={`subscription_${tier}_price` as any} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />Price (₦)</FormLabel>
                            <FormControl><Input type="number" min="0" step="1" {...field} data-testid={`input-${tier}-price`} /></FormControl>
                            <FormDescription>Base monthly price</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={subForm.control} name={`subscription_${tier}_discount` as any} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1"><Percent className="w-3.5 h-3.5" />Discount (%)</FormLabel>
                            <FormControl><Input type="number" min="0" max="100" step="1" {...field} data-testid={`input-${tier}-discount`} /></FormControl>
                            <FormDescription>Promotional discount</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={subForm.control} name={`job_limit_${tier}` as any} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />Job Posting Limit</FormLabel>
                            <FormControl><Input type="number" step="1" {...field} data-testid={`input-job-limit-${tier}`} /></FormControl>
                            <FormDescription>Max active jobs (-1 = unlimited)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={subForm.control} name={`interview_credits_${tier}` as any} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1"><CalendarCheck className="w-3.5 h-3.5" />Interview Credits</FormLabel>
                            <FormControl><Input type="number" min="0" step="1" {...field} data-testid={`input-interview-credits-${tier}`} /></FormControl>
                            <FormDescription>Per billing period</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="text-verification-settings-title">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Verification Fee
              </CardTitle>
              <CardDescription>Set the verification fee for applicants.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg" data-testid="text-verification-fee-label">Applicant Verification</h3>
                  <Badge variant="outline" data-testid="text-verification-final-price">
                    Final: {formatNaira(calcDiscounted(watchSub.verification_fee, watchSub.verification_discount))}/month
                  </Badge>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField control={subForm.control} name="verification_fee" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />Fee (₦)</FormLabel>
                      <FormControl><Input type="number" min="0" step="1" {...field} data-testid="input-verification-fee" /></FormControl>
                      <FormDescription>Monthly verification fee</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={subForm.control} name="verification_discount" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><Percent className="w-3.5 h-3.5" />Discount (%)</FormLabel>
                      <FormControl><Input type="number" min="0" max="100" step="1" {...field} data-testid="input-verification-discount" /></FormControl>
                      <FormDescription>Promotional discount</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
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
              <CardDescription>Set the fee agents pay per job post when using pay-per-post credits.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg" data-testid="text-agent-fee-label">Per-Post Credit Fee</h3>
                  <Badge variant="outline" data-testid="text-agent-fee-preview">
                    Final: {formatNaira(calcDiscounted(watchSub.agent_job_post_fee, watchSub.agent_job_post_discount))}/post
                  </Badge>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField control={subForm.control} name="agent_job_post_fee" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />Fee per Post (₦)</FormLabel>
                      <FormControl><Input type="number" min="0" step="100" {...field} data-testid="input-agent-job-post-fee" /></FormControl>
                      <FormDescription>Base price per agent job post credit</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={subForm.control} name="agent_job_post_discount" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><Percent className="w-3.5 h-3.5" />Discount (%)</FormLabel>
                      <FormControl><Input type="number" min="0" max="100" step="1" {...field} data-testid="input-agent-job-post-discount" /></FormControl>
                      <FormDescription>Promotional discount on per-post fee</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            </CardContent>
          </Card>

          <SectionSaveButton isPending={subSave.isPending} label="Pricing" />
        </form>
      </Form>

      {/* CONTACT INFO */}
      <Form {...contactForm}>
        <form onSubmit={contactForm.handleSubmit((data) => contactSave.mutate(data))}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="text-app-info-title">
                <Phone className="w-5 h-5 text-primary" />
                App Contact Information
              </CardTitle>
              <CardDescription>Set the contact details displayed on the website footer and contact page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField control={contactForm.control} name="app_phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />Phone Number</FormLabel>
                    <FormControl><Input placeholder="e.g. +234 800 123 4567" {...field} data-testid="input-app-phone" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={contactForm.control} name="app_email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />Email Address</FormLabel>
                    <FormControl><Input placeholder="e.g. support@iseya.ng" {...field} data-testid="input-app-email" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={contactForm.control} name="app_address" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Office Address</FormLabel>
                  <FormControl><Input placeholder="e.g. 15 Admiralty Way, Lekki, Lagos, Nigeria" {...field} data-testid="input-app-address" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <SectionSaveButton isPending={contactSave.isPending} label="Contact Info" />
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* SOCIAL MEDIA */}
      <Form {...socialForm}>
        <form onSubmit={socialForm.handleSubmit((data) => socialSave.mutate(data))}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="text-social-links-title">
                <Globe className="w-5 h-5 text-primary" />
                Social Media Links
              </CardTitle>
              <CardDescription>Set the social media profile URLs. Leave blank to hide a social link.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField control={socialForm.control} name="app_facebook" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook</FormLabel>
                    <FormControl><Input placeholder="https://facebook.com/yourpage" {...field} data-testid="input-app-facebook" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={socialForm.control} name="app_twitter" render={({ field }) => (
                  <FormItem>
                    <FormLabel>X (Twitter)</FormLabel>
                    <FormControl><Input placeholder="https://x.com/yourhandle" {...field} data-testid="input-app-twitter" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={socialForm.control} name="app_instagram" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl><Input placeholder="https://instagram.com/yourhandle" {...field} data-testid="input-app-instagram" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={socialForm.control} name="app_linkedin" render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl><Input placeholder="https://linkedin.com/company/yourcompany" {...field} data-testid="input-app-linkedin" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={socialForm.control} name="app_tiktok" render={({ field }) => (
                  <FormItem>
                    <FormLabel>TikTok</FormLabel>
                    <FormControl><Input placeholder="https://tiktok.com/@yourhandle" {...field} data-testid="input-app-tiktok" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <SectionSaveButton isPending={socialSave.isPending} label="Social Links" />
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* YOUTUBE LINKS */}
      <Form {...youtubeForm}>
        <form onSubmit={youtubeForm.handleSubmit((data) => youtubeSave.mutate(data))}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="text-youtube-links-title">
                <Youtube className="w-5 h-5 text-red-600" />
                YouTube Video Links
              </CardTitle>
              <CardDescription>Set the YouTube embed URLs for each page. Use the full embed URL (e.g. https://www.youtube.com/embed/VIDEO_ID).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={youtubeForm.control} name="youtube_landing" render={({ field }) => (
                <FormItem>
                  <FormLabel>Landing Page Video</FormLabel>
                  <FormControl><Input placeholder="https://www.youtube.com/embed/VIDEO_ID" {...field} data-testid="input-youtube-landing" /></FormControl>
                  <FormDescription>Displayed in the "How It Works" section on the landing page</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={youtubeForm.control} name="youtube_employers" render={({ field }) => (
                <FormItem>
                  <FormLabel>For Employers Page Video</FormLabel>
                  <FormControl><Input placeholder="https://www.youtube.com/embed/VIDEO_ID" {...field} data-testid="input-youtube-employers" /></FormControl>
                  <FormDescription>Displayed on the Employers landing page</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={youtubeForm.control} name="youtube_agents" render={({ field }) => (
                <FormItem>
                  <FormLabel>For Agents Page Video</FormLabel>
                  <FormControl><Input placeholder="https://www.youtube.com/embed/VIDEO_ID" {...field} data-testid="input-youtube-agents" /></FormControl>
                  <FormDescription>Displayed on the Agents landing page</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={youtubeForm.control} name="youtube_applicants" render={({ field }) => (
                <FormItem>
                  <FormLabel>For Applicants Page Video</FormLabel>
                  <FormControl><Input placeholder="https://www.youtube.com/embed/VIDEO_ID" {...field} data-testid="input-youtube-applicants" /></FormControl>
                  <FormDescription>Displayed on the Applicants landing page</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <SectionSaveButton isPending={youtubeSave.isPending} label="YouTube Links" />
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* PAYMENT GATEWAY KEYS */}
      <Form {...paymentForm}>
        <form onSubmit={paymentForm.handleSubmit((data) => paymentSave.mutate(data))}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="text-payment-gateway-title">
                <Key className="w-5 h-5 text-primary" />
                Payment Gateway Keys
              </CardTitle>
              <CardDescription>Configure your Paystack and Flutterwave API keys for payment processing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg" data-testid="text-paystack-label">Paystack</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField control={paymentForm.control} name="paystack_public_key" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Public Key</FormLabel>
                      <FormControl><Input placeholder="pk_live_..." {...field} data-testid="input-paystack-public-key" /></FormControl>
                      <FormDescription>Paystack public/publishable key</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={paymentForm.control} name="paystack_secret_key" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secret Key</FormLabel>
                      <FormControl><Input type="password" placeholder="sk_live_..." {...field} data-testid="input-paystack-secret-key" /></FormControl>
                      <FormDescription>Paystack secret key (keep private)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
              <div className="border rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg" data-testid="text-flutterwave-label">Flutterwave</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField control={paymentForm.control} name="flutterwave_public_key" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Public Key</FormLabel>
                      <FormControl><Input placeholder="FLWPUBK-..." {...field} data-testid="input-flutterwave-public-key" /></FormControl>
                      <FormDescription>Flutterwave public key</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={paymentForm.control} name="flutterwave_secret_key" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secret Key</FormLabel>
                      <FormControl><Input type="password" placeholder="FLWSECK-..." {...field} data-testid="input-flutterwave-secret-key" /></FormControl>
                      <FormDescription>Flutterwave secret key (keep private)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
              <SectionSaveButton isPending={paymentSave.isPending} label="Payment Keys" />
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
