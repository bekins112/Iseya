import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateUser } from "@/hooks/use-casual";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Briefcase, Search, Building2, UserCheck } from "lucide-react";

export default function Onboarding() {
  const { user } = useAuth();
  const updateUser = useUpdateUser();
  const [, setLocation] = useLocation();
  const [age, setAge] = useState<string>("");
  const [ageError, setAgeError] = useState("");

  const intendedRole = localStorage.getItem("intended_role") as "applicant" | "employer" | null;
  const role = intendedRole || user?.role || "applicant";
  const isEmployer = role === "employer";

  useEffect(() => {
    if (user?.role && user?.age) {
      localStorage.removeItem("intended_role");
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const handleContinue = () => {
    setAgeError("");

    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum)) {
      setAgeError("Please enter your age");
      return;
    }
    if (ageNum < 16) {
      setAgeError("You must be at least 16 years old to use this platform");
      return;
    }
    if (ageNum > 100) {
      setAgeError("Please enter a valid age");
      return;
    }

    updateUser.mutate(
      { id: user!.id, role, age: ageNum },
      {
        onSuccess: () => {
          localStorage.removeItem("intended_role");
          setLocation("/dashboard");
        }
      }
    );
  };

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
                {isEmployer ? "Setting up your employer dashboard..." : "Finding opportunities for you..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="max-w-lg w-full shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {isEmployer ? (
              <Building2 className="w-8 h-8 text-primary" />
            ) : (
              <Search className="w-8 h-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-display">
            {isEmployer ? "Welcome, Employer!" : "Welcome, Job Seeker!"}
          </CardTitle>
          <CardDescription>
            {isEmployer
              ? "Almost there! Just one more step to start posting jobs."
              : "Almost there! Just one more step to start finding work."}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Briefcase className="w-5 h-5 text-primary flex-shrink-0" />
              <span>{isEmployer ? "Post job listings and manage applicants" : "Browse and apply for jobs"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <UserCheck className="w-5 h-5 text-primary flex-shrink-0" />
              <span>{isEmployer ? "Access verified workers" : "Apply with one click"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Search className="w-5 h-5 text-primary flex-shrink-0" />
              <span>{isEmployer ? "Browse applicant profiles" : "Track your applications"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">How old are you?</Label>
            <Input
              id="age"
              type="number"
              placeholder="Enter your age (must be 16+)"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={16}
              max={100}
              data-testid="input-onboarding-age"
            />
            {ageError && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{ageError}</AlertDescription>
              </Alert>
            )}
            <p className="text-xs text-muted-foreground">
              You must be at least 16 years old to use this platform
            </p>
          </div>

          <Button
            onClick={handleContinue}
            className="w-full font-bold"
            disabled={updateUser.isPending}
            data-testid="button-onboarding-continue"
          >
            {isEmployer ? "Start Hiring" : "Start Finding Jobs"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
