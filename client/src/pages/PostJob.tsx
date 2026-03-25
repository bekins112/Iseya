import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateJob } from "@/hooks/use-casual";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { PageHeader } from "@/components/ui-extension";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { AlertTriangle, ArrowUpCircle, CalendarClock, CreditCard, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { checkEmployerProfile, checkAgentProfile } from "@/lib/profile-utils";
import { nigerianStates } from "@/lib/nigerian-locations";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

const categories = [
  "Waiter / Waitress",
  "Barman / Bartender",
  "Housekeeper / Room Attendant",
  "Kitchen Assistant / Steward",
  "Cook",
  "Porter / Luggage Handler",
  "Spa Therapist / Attendant",
  "Receptionist",
  "Sales Assistant / Attendant",
  "Cashier",
  "Shelf Attendant / Merchandiser",
  "Store Keeper / Inventory Officer",
  "Line Cook / Prep Cook",
  "Barista",
  "Fast Food Attendant",
  "Kitchen Manager",
  "Server",
  "Factory Worker / Casual Labourer",
  "Cleaner / Janitor",
  "Driver (Casual)",
  "Nanny / Caregiver",
  "Security Guard",
  "Tailor / Fashion Designer Assistant",
  "Box Production Worker",
  "Stylist (Fashion)",
  "Stylist (Unisex)",
  "Stylist (Ladies)",
  "Stylist (Barbing)",
  "Stylist (Spa)",
  "Funeral Service Worker",
  "Tour & Travel Guide",
  "Childcare Worker",
  "Personal Care Aide",
  "Recreation & Fitness Worker",
  "Residential Advisor",
  "Repair Technician",
  "Maintenance Man",
  "Office Assistant",
  "Other",
];

const postJobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Please provide a detailed description"),
  category: z.string().min(1, "Category is required"),
  jobType: z.string().min(1, "Job type is required"),
  salaryMin: z.coerce.number().min(0, "Minimum salary must be at least 0"),
  salaryMax: z.coerce.number().min(0, "Maximum salary must be at least 0"),
  wage: z.string().min(1, "Wage information is required"),
  state: z.string().min(1, "State is required"),
  location: z.string().min(1, "Specific address/area is required"),
  gender: z.string().default("Any"),
  ageMin: z.coerce.number().min(18, "Minimum age must be at least 18").nullable().optional(),
  ageMax: z.coerce.number().max(100, "Maximum age cannot exceed 100").nullable().optional(),
  deadline: z.string().min(1, "Application deadline is required"),
  onBehalfOf: z.string().optional(),
});

type JobFormValues = z.infer<typeof postJobSchema>;

export default function PostJob() {
  const { user } = useAuth();
  const createJob = useCreateJob();
  const [, setLocation] = useLocation();
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [buyingCredits, setBuyingCredits] = useState(false);

  const isAgent = user?.role === "agent";
  const isEmployer = user?.role === "employer";

  const profileCheck = user
    ? (isAgent ? checkAgentProfile(user as any) : checkEmployerProfile(user as any))
    : { isComplete: false, missingFields: [] };

  const agentCredits = (user as any)?.agentPostCredits || 0;
  const agentPlan = user?.subscriptionStatus || "free";
  const agentNeedsPayment = isAgent && agentPlan === "free" && agentCredits <= 0;

  const { data: platformSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/platform-settings"],
    enabled: isAgent,
  });
  const postFee = platformSettings?.agent_job_post_fee ? Number(platformSettings.agent_job_post_fee) : 5000;

  const form = useForm<JobFormValues>({
    resolver: zodResolver(postJobSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      jobType: "Full-time",
      salaryMin: 0,
      salaryMax: 0,
      wage: "",
      state: "",
      location: "",
      gender: "Any",
      ageMin: null,
      ageMax: null,
      deadline: "",
      onBehalfOf: "",
    }
  });

  const onSubmit = (data: JobFormValues) => {
    if (!profileCheck.isComplete) return;
    setLimitMessage(null);
    setPaymentRequired(false);
    const { deadline, onBehalfOf, ...rest } = data;
    const payload: any = {
      ...rest,
      ageMin: rest.ageMin || null,
      ageMax: rest.ageMax || null,
      employerId: user!.id,
      isActive: true,
      deadline,
    };
    if (isAgent && onBehalfOf?.trim()) {
      payload.onBehalfOf = onBehalfOf.trim();
    }
    createJob.mutate(payload, {
      onSuccess: () => setLocation("/dashboard"),
      onError: (error: any) => {
        if (error.code === "JOB_LIMIT_REACHED") {
          setLimitMessage(error.message);
        } else if (error.code === "AGENT_PAYMENT_REQUIRED") {
          setPaymentRequired(true);
        }
      }
    });
  };

  const handleBuyCredit = async (gateway: "paystack" | "flutterwave") => {
    setBuyingCredits(true);
    try {
      const res = await apiRequest("POST", `/api/agent/buy-post-credits/${gateway}`, { credits: 1 });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Failed to init credit purchase:", err);
    } finally {
      setBuyingCredits(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Post a New Job"
        description={isAgent ? "Post a job on behalf of an employer client." : "Find the perfect candidate for your needs."}
      />

      {!profileCheck.isComplete && (
        <Card className="mb-6 border-amber-400/50 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                <UserCircle2 className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base mb-1 text-amber-900 dark:text-amber-300">Complete Your Profile First</h3>
                <p className="text-sm text-amber-800 dark:text-amber-400 mb-1">
                  {isAgent
                    ? "You need to complete your agent profile before you can post jobs."
                    : "You need to complete your company profile before you can post jobs."}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-500">
                  Missing: {profileCheck.missingFields.join(", ")}
                </p>
              </div>
              <Link href="/profile">
                <Button data-testid="button-complete-profile-employer" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
                  <UserCircle2 className="w-4 h-4 mr-2" />
                  Complete Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {(agentNeedsPayment || paymentRequired) && (
        <Card className="mb-6 border-primary/50 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base mb-1">Buy a Job Post Credit</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    You have <strong>{agentCredits}</strong> job post credit{agentCredits !== 1 ? "s" : ""} remaining.
                    Each credit costs <strong>₦{postFee.toLocaleString()}</strong>, or you can subscribe to a plan for unlimited posting.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => handleBuyCredit("paystack")}
                  disabled={buyingCredits}
                  data-testid="button-buy-credit-paystack"
                  className="flex-1 min-w-[140px]"
                >
                  {buyingCredits ? "Processing..." : `Pay ₦${postFee.toLocaleString()} (Paystack)`}
                </Button>
                <Button
                  onClick={() => handleBuyCredit("flutterwave")}
                  disabled={buyingCredits}
                  variant="outline"
                  data-testid="button-buy-credit-flutterwave"
                  className="flex-1 min-w-[140px]"
                >
                  {buyingCredits ? "Processing..." : `Pay ₦${postFee.toLocaleString()} (Flutterwave)`}
                </Button>
                <Link href="/subscription" className="flex-1 min-w-[140px]">
                  <Button variant="secondary" className="w-full" data-testid="button-agent-subscribe">
                    <ArrowUpCircle className="w-4 h-4 mr-2" />
                    Subscribe Instead
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isAgent && agentPlan === "free" && agentCredits > 0 && (
        <Card className="mb-6 border-green-400/50 bg-green-50 dark:bg-green-950/20 dark:border-green-700">
          <CardContent className="py-4">
            <p className="text-sm text-green-800 dark:text-green-300">
              You have <strong>{agentCredits}</strong> job post credit{agentCredits !== 1 ? "s" : ""} remaining.
              One credit will be used when you publish this job.
            </p>
          </CardContent>
        </Card>
      )}

      {limitMessage && (
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base mb-1">Job Posting Limit Reached</h3>
                <p className="text-sm text-muted-foreground">{limitMessage}</p>
              </div>
              <Link href="/subscription">
                <Button data-testid="button-upgrade-plan">
                  <ArrowUpCircle className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {isAgent && (
                <FormField
                  control={form.control}
                  name="onBehalfOf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>On Behalf Of (Employer/Client Name)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. ABC Restaurant, Mr. John Doe"
                          {...field}
                          data-testid="input-job-on-behalf-of"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Weekend Waitress Needed" {...field} data-testid="input-job-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-job-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-job-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-job-gender">
                            <SelectValue placeholder="Select gender preference" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Any">Any</SelectItem>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Age Range</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="ageMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Min (18+)"
                              min={18}
                              max={100}
                              data-testid="input-job-age-min"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ageMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Max"
                              min={16}
                              max={100}
                              data-testid="input-job-age-max"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="salaryMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Salary (&#8358;)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-job-salary-min" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Salary (&#8358;)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-job-salary-max" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wage Type (e.g. /hr, /mo)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-job-wage">
                            <SelectValue placeholder="Select wage type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="/hr">Per Hour</SelectItem>
                          <SelectItem value="/day">Per Day</SelectItem>
                          <SelectItem value="/wk">Per Week</SelectItem>
                          <SelectItem value="/mo">Per Month</SelectItem>
                          <SelectItem value="fixed">Fixed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-job-state">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {nigerianStates.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area / Address</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Victoria Island, Lagos" {...field} data-testid="input-job-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => {
                    const selectedDate = field.value ? new Date(field.value + "T00:00:00") : undefined;
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(0, 0, 0, 0);
                    return (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <CalendarClock className="w-4 h-4" />
                          Application Deadline
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="input-job-deadline"
                              >
                                {field.value ? format(selectedDate!, "dd, MMM, yyyy") : "Pick a date"}
                                <CalendarClock className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => {
                                if (date) {
                                  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                                  field.onChange(iso);
                                }
                              }}
                              disabled={(date) => date < tomorrow}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the responsibilities, hours, and requirements..." 
                        className="min-h-[150px]"
                        data-testid="input-job-description"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="ghost" onClick={() => setLocation("/dashboard")} data-testid="button-job-cancel">Cancel</Button>
                <Button type="submit" disabled={createJob.isPending || !profileCheck.isComplete} data-testid="button-job-submit">
                  {createJob.isPending ? "Posting..." : "Publish Job"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
