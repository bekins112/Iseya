import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateJob } from "@/hooks/use-casual";
import { insertJobSchema } from "@shared/schema";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/ui-extension";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { AlertTriangle, ArrowUpCircle } from "lucide-react";

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

const postJobSchema = insertJobSchema.omit({ employerId: true, isActive: true }).extend({
  category: z.string().min(1, "Category is required"),
  jobType: z.string().min(1, "Job type is required"),
  salaryMin: z.coerce.number().min(0, "Minimum salary must be at least 0"),
  salaryMax: z.coerce.number().min(0, "Maximum salary must be at least 0"),
  wage: z.string().min(1, "Wage information is required"),
  location: z.string().min(1, "Location is required"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Please provide a detailed description"),
  gender: z.string().default("Any"),
  ageMin: z.coerce.number().min(16, "Minimum age must be at least 16").nullable().optional(),
  ageMax: z.coerce.number().max(100, "Maximum age cannot exceed 100").nullable().optional(),
});

type JobFormValues = z.infer<typeof postJobSchema>;

export default function PostJob() {
  const { user } = useAuth();
  const createJob = useCreateJob();
  const [, setLocation] = useLocation();
  const [limitMessage, setLimitMessage] = useState<string | null>(null);

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
      location: "",
      gender: "Any",
      ageMin: null,
      ageMax: null,
    }
  });

  const onSubmit = (data: JobFormValues) => {
    setLimitMessage(null);
    createJob.mutate({
        ...data,
        ageMin: data.ageMin || null,
        ageMax: data.ageMax || null,
        employerId: user!.id,
        isActive: true,
    }, {
      onSuccess: () => setLocation("/dashboard"),
      onError: (error: any) => {
        if (error.code === "JOB_LIMIT_REACHED") {
          setLimitMessage(error.message);
        }
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Post a New Job" description="Find the perfect candidate for your needs." />

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
                              placeholder="Min (16+)"
                              min={16}
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

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Downtown Cafe, Main St." {...field} data-testid="input-job-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                <Button type="submit" disabled={createJob.isPending} data-testid="button-job-submit">
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
