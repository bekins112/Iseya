import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateUser } from "@/hooks/use-casual";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Briefcase, Search, Building2, UserCheck, MapPin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const businessCategories = [
  "Restaurant & Food Service",
  "Hospitality & Hotels",
  "Retail & Sales",
  "Construction & Labour",
  "Cleaning & Maintenance",
  "Logistics & Delivery",
  "Agriculture & Farming",
  "Event Management",
  "Domestic & Household",
  "Manufacturing",
  "Security Services",
  "Healthcare & Wellness",
  "Education & Tutoring",
  "Transportation",
  "Other",
];

export default function Onboarding() {
  const { user } = useAuth();
  const updateUser = useUpdateUser();
  const [, setLocation] = useLocation();
  const [age, setAge] = useState<string>("");
  const [companyName, setCompanyName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyCity, setCompanyCity] = useState("");
  const [companyState, setCompanyState] = useState("");
  const [isRegisteredCompany, setIsRegisteredCompany] = useState(false);
  const [ageError, setAgeError] = useState("");
  const [formError, setFormError] = useState("");

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
    setFormError("");

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

    if (isEmployer) {
      if (!companyName.trim()) {
        setFormError("Please enter your company or business name");
        return;
      }
      if (!businessCategory) {
        setFormError("Please select a business category");
        return;
      }
    }

    const updateData: Record<string, any> = { id: user!.id, role, age: ageNum };
    if (isEmployer) {
      updateData.companyName = companyName.trim();
      updateData.businessCategory = businessCategory;
      if (companyAddress.trim()) updateData.companyAddress = companyAddress.trim();
      if (companyCity.trim()) updateData.companyCity = companyCity.trim();
      if (companyState) updateData.companyState = companyState;
      updateData.isRegisteredCompany = isRegisteredCompany;
    }

    updateUser.mutate(updateData as any, {
      onSuccess: () => {
        localStorage.removeItem("intended_role");
        setLocation("/dashboard");
      },
    });
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
              ? "Tell us about your business to get started."
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

          {isEmployer && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company / Business Name</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="e.g. Lagos Catering Services"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  data-testid="input-onboarding-company"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessCategory">Business Category</Label>
                <Select value={businessCategory} onValueChange={setBusinessCategory}>
                  <SelectTrigger data-testid="select-onboarding-category">
                    <SelectValue placeholder="Select your business category" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessCategories.map((cat) => (
                      <SelectItem key={cat} value={cat} data-testid={`option-category-${cat.toLowerCase().replace(/\s+/g, "-")}`}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress">Company Address <span className="text-xs text-muted-foreground">(optional)</span></Label>
                <Input
                  id="companyAddress"
                  type="text"
                  placeholder="e.g. 12 Broad Street"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  data-testid="input-onboarding-address"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="companyCity">City <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input
                    id="companyCity"
                    type="text"
                    placeholder="e.g. Lagos"
                    value={companyCity}
                    onChange={(e) => setCompanyCity(e.target.value)}
                    data-testid="input-onboarding-city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyState">State <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Select value={companyState} onValueChange={setCompanyState}>
                    <SelectTrigger data-testid="select-onboarding-state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {nigerianStates.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="isRegistered"
                  checked={isRegisteredCompany}
                  onCheckedChange={(v) => setIsRegisteredCompany(!!v)}
                  data-testid="checkbox-onboarding-registered"
                />
                <Label htmlFor="isRegistered" className="text-sm cursor-pointer">
                  This company is officially registered (CAC)
                </Label>
              </div>
            </>
          )}

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

          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

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
