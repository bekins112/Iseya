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
import { AlertCircle } from "lucide-react";

// Schema for onboarding form
const onboardingSchema = insertUserSchema.pick({
  role: true,
  age: true,
  location: true,
  bio: true
}).extend({
  age: z.coerce.number().min(16, "You must be at least 16 years old to use this platform."),
  role: z.enum(["applicant", "employer"]),
  location: z.string().min(2, "Location is required"),
  bio: z.string().min(10, "Tell us a bit about yourself (min 10 chars)")
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
      role: "applicant",
      location: "",
      bio: "",
      age: undefined,
    }
  });

  const onSubmit = (data: OnboardingFormValues) => {
    if (!user) return;
    updateUser.mutate(
      { id: user.id, ...data },
      {
        onSuccess: () => {
          setLocation("/dashboard");
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="max-w-lg w-full shadow-xl border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-2xl font-display text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-center">
            Welcome to CasualWorker! Let's get you set up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>I am here to...</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <RadioGroupItem value="applicant" id="applicant" className="peer sr-only" />
                          <Label
                            htmlFor="applicant"
                            className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                          >
                            <span className="text-lg font-bold mb-1">Find Work</span>
                            <span className="text-xs text-muted-foreground text-center">I'm looking for casual jobs</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="employer" id="employer" className="peer sr-only" />
                          <Label
                            htmlFor="employer"
                            className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                          >
                            <span className="text-lg font-bold mb-1">Hire Talent</span>
                            <span className="text-xs text-muted-foreground text-center">I need to hire help</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="18" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Area" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("age") && form.watch("age") < 16 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Age Restriction</AlertTitle>
                  <AlertDescription>
                    You must be at least 16 years old to use this platform.
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={form.watch("role") === "applicant" 
                          ? "Tell employers about your skills and experience..." 
                          : "Tell applicants about your business..."} 
                        className="resize-none min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold"
                disabled={updateUser.isPending || (form.watch("age") || 0) < 16}
              >
                {updateUser.isPending ? "Setting up..." : "Complete Setup"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
