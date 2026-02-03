import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateUser } from "@/hooks/use-casual";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Briefcase, Search, Building2, UserCheck } from "lucide-react";

// Schema for onboarding form
const onboardingSchema = insertUserSchema.pick({
  role: true,
}).extend({
  role: z.enum(["applicant", "employer"]),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const { user } = useAuth();
  const updateUser = useUpdateUser();
  const [, setLocation] = useLocation();
  
  // Get intended role from localStorage (set from landing/employer pages)
  const intendedRole = localStorage.getItem("intended_role") as "applicant" | "employer" | null;

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      role: intendedRole || "applicant",
    }
  });

  const onSubmit = (data: OnboardingFormValues) => {
    if (!user) return;
    updateUser.mutate(
      { id: user.id, ...data, age: 18 },
      {
        onSuccess: () => {
          localStorage.removeItem("intended_role");
          setLocation("/dashboard");
        }
      }
    );
  };

  // Show loading while submitting
  if (updateUser.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
        <Card className="max-w-lg w-full shadow-xl border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-2xl font-display text-center">Setting Up Your Account</CardTitle>
            <CardDescription className="text-center">
              Please wait while we prepare your experience...
            </CardDescription>
          </CardHeader>
          <CardContent className="py-10">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground font-medium italic">
                {form.getValues("role") === "employer" ? "Setting up your employer dashboard..." : "Finding opportunities for you..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user came from employer login, show employer-specific confirmation
  if (intendedRole === "employer") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
        <Card className="max-w-lg w-full shadow-xl border-t-4 border-t-primary">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-display">Welcome, Employer!</CardTitle>
            <CardDescription>
              You're signing up as an employer on Iṣéyá. You'll be able to post jobs and hire workers.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="w-5 h-5 text-primary" />
                <span>Post unlimited job listings</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <UserCheck className="w-5 h-5 text-primary" />
                <span>Access verified workers</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Search className="w-5 h-5 text-primary" />
                <span>Browse applicant profiles</span>
              </div>
            </div>
            <Button 
              onClick={() => onSubmit({ role: "employer" })}
              className="w-full"
              data-testid="button-confirm-employer"
            >
              Continue as Employer
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Not an employer?{" "}
              <button 
                onClick={() => {
                  localStorage.removeItem("intended_role");
                  window.location.reload();
                }}
                className="text-primary hover:underline"
              >
                Choose a different role
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user came from job seeker login, show job seeker confirmation
  if (intendedRole === "applicant") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
        <Card className="max-w-lg w-full shadow-xl border-t-4 border-t-primary">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-display">Welcome, Job Seeker!</CardTitle>
            <CardDescription>
              You're signing up to find work on Iṣéyá. You'll be able to browse and apply for jobs.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="w-5 h-5 text-primary" />
                <span>Browse available jobs</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <UserCheck className="w-5 h-5 text-primary" />
                <span>Apply with one click</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Search className="w-5 h-5 text-primary" />
                <span>Track your applications</span>
              </div>
            </div>
            <Button 
              onClick={() => onSubmit({ role: "applicant" })}
              className="w-full"
              data-testid="button-confirm-applicant"
            >
              Continue as Job Seeker
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Want to hire instead?{" "}
              <button 
                onClick={() => {
                  localStorage.removeItem("intended_role");
                  window.location.reload();
                }}
                className="text-primary hover:underline"
              >
                Choose a different role
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="max-w-lg w-full shadow-xl border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-2xl font-display text-center">Select Your Role</CardTitle>
          <CardDescription className="text-center">
            Welcome to Iṣéyá! Choose how you want to use the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-base font-medium">I want to:</FormLabel>
                    <FormControl>
                      <RadioGroup 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        className="flex flex-col gap-4"
                      >
                        <div 
                          className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover-elevate"
                          onClick={() => field.onChange("applicant")}
                          data-testid="role-applicant"
                        >
                          <RadioGroupItem value="applicant" id="applicant" />
                          <div>
                            <Label htmlFor="applicant" className="font-medium cursor-pointer">Find Work</Label>
                            <p className="text-sm text-muted-foreground">I'm looking for casual job opportunities</p>
                          </div>
                        </div>
                        <div 
                          className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover-elevate"
                          onClick={() => field.onChange("employer")}
                          data-testid="role-employer"
                        >
                          <RadioGroupItem value="employer" id="employer" />
                          <div>
                            <Label htmlFor="employer" className="font-medium cursor-pointer">Hire Workers</Label>
                            <p className="text-sm text-muted-foreground">I want to post jobs and find workers</p>
                          </div>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full" 
                data-testid="button-submit-onboarding"
              >
                Continue
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
