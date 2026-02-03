import { useState, useEffect } from "react";
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
import { AlertCircle } from "lucide-react";

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
  const [step, setStep] = useState(1);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      role: (localStorage.getItem("intended_role") as "applicant" | "employer") || "applicant",
    }
  });

  useEffect(() => {
    const intendedRole = localStorage.getItem("intended_role");
    if (intendedRole && user) {
      // Always update if we have an intended role from landing
      updateUser.mutate(
        { id: user.id, role: intendedRole as "applicant" | "employer", age: 18 },
        {
          onSuccess: () => {
            localStorage.removeItem("intended_role");
            setLocation("/dashboard");
          }
        }
      );
    }
  }, [user?.id, setLocation, updateUser]);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="max-w-lg w-full shadow-xl border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-2xl font-display text-center">Select Your Role</CardTitle>
          <CardDescription className="text-center">
            Welcome to Iṣéyá! Choose how you want to use the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-10">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground font-medium italic">Setting up your experience...</p>
          </div>
          <div className="hidden">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value}>
                          <RadioGroupItem value="applicant" />
                          <RadioGroupItem value="employer" />
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" id="submit-onboarding">Submit</Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
