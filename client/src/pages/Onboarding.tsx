import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateUser } from "@/hooks/use-casual";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Briefcase, Search, Building2, UserCheck, Users } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { nigerianStates } from "@/lib/nigerian-locations";
import { usePageTitle } from "@/hooks/use-page-title";

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
  usePageTitle("Get Started");
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
  const [companyRegNo, setCompanyRegNo] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [agentState, setAgentState] = useState("");
  const [ageError, setAgeError] = useState("");
  const [formError, setFormError] = useState("");

  const intendedRole = localStorage.getItem("intended_role") as "applicant" | "employer" | "agent" | null;
  const role = intendedRole || user?.role || "applicant";
  const isEmployer = role === "employer";
  const isAgent = role === "agent";

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
    if (ageNum < 18) {
      setAgeError("You must be at least 18 years old to use this platform");
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

    if (isAgent) {
      if (!agencyName.trim()) {
        setFormError("Please enter your agency or business name");
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
      if (isRegisteredCompany && companyRegNo.trim()) updateData.companyRegNo = companyRegNo.trim();
    }

    if (isAgent) {
      updateData.agencyName = agencyName.trim();
      if (agentState) updateData.state = agentState;
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
                {isEmployer ? "Setting up your employer dashboard..." : isAgent ? "Setting up your agent dashboard..." : "Finding opportunities for you..."}
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
            ) : isAgent ? (
              <Users className="w-8 h-8 text-primary" />
            ) : (
              <Search className="w-8 h-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-display">
            {isEmployer ? "Welcome, Employer!" : isAgent ? "Welcome, Agent!" : "Welcome, Job Seeker!"}
          </CardTitle>
          <CardDescription>
            {isEmployer
              ? "Tell us about your business to get started."
              : isAgent
              ? "Tell us about your agency to start posting jobs for clients."
              : "Almost there! Just one more step to start finding work."}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Briefcase className="w-5 h-5 text-primary flex-shrink-0" />
              <span>
                {isEmployer ? "Post job listings and manage applicants"
                  : isAgent ? "Post jobs on behalf of your employer clients"
                  : "Browse and apply for jobs"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <UserCheck className="w-5 h-5 text-primary flex-shrink-0" />
              <span>
                {isEmployer ? "Access verified workers"
                  : isAgent ? "Earn money by connecting employers with workers"
                  : "Apply with one click"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Search className="w-5 h-5 text-primary flex-shrink-0" />
              <span>
                {isEmployer ? "Browse applicant profiles"
                  : isAgent ? "Subscribe or pay per job post — your choice"
                  : "Track your applications"}
              </span>
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
              {isRegisteredCompany && (
                <div className="space-y-2">
                  <Label htmlFor="companyRegNo">CAC Registration Number</Label>
                  <Input
                    id="companyRegNo"
                    type="text"
                    placeholder="e.g. RC-123456"
                    value={companyRegNo}
                    onChange={(e) => setCompanyRegNo(e.target.value)}
                    data-testid="input-onboarding-regno"
                  />
                </div>
              )}
            </>
          )}

          {isAgent && (
            <>
              <div className="space-y-2">
                <Label htmlFor="agencyName">Agency / Business Name</Label>
                <Input
                  id="agencyName"
                  type="text"
                  placeholder="e.g. Swift Recruit Agency"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  data-testid="input-onboarding-agency"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agentState">Your State <span className="text-xs text-muted-foreground">(optional)</span></Label>
                <Select value={agentState} onValueChange={setAgentState}>
                  <SelectTrigger data-testid="select-onboarding-agent-state">
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {nigerianStates.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="age">How old are you?</Label>
            <Input
              id="age"
              type="number"
              placeholder="Enter your age (must be 18+)"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={18}
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
              You must be at least 18 years old to use this platform
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
            {isEmployer ? "Start Hiring" : isAgent ? "Start as Agent" : "Start Finding Jobs"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
