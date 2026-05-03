import { useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateUser, useUploadProfilePicture, useUploadCompanyLogo, useUploadCV, useJobHistory, useCreateJobHistory, useUpdateJobHistory, useDeleteJobHistory } from "@/hooks/use-casual";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PageHeader, StatusBadge } from "@/components/ui-extension";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";
import { calculateAge, getMaxDobFor18, getMinDobDate } from "@/lib/age-utils";
import { Settings, Shield, Crown, Camera, ChevronDown, X, Briefcase, Building2, FileText, Upload, PlusCircle, Pencil, Trash2, Check, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { nigerianStates } from "@/lib/nigerian-locations";
import { jobSectors, allJobCategories, businessCategories } from "@/lib/job-categories";
import { usePageTitle } from "@/hooks/use-page-title";

const JOB_TYPE_OPTIONS = [
  "Full-time",
  "Part-time",
  "Contract",
  "Remote",
  "Freelance",
];

const profileSchema = insertUserSchema.pick({
  firstName: true,
  lastName: true,
  role: true,
  location: true,
  bio: true,
  email: true,
  phone: true,
}).extend({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  role: z.enum(["applicant", "employer", "agent"]),
  location: z.string().nullable().optional(),
  bio: z.string().optional(),
  email: z.string().email("Must be a valid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  preferredJobTypes: z.array(z.string()).optional(),
  preferredCategories: z.array(z.string()).optional(),
  companyName: z.string().optional().or(z.literal("")),
  businessCategory: z.string().optional().or(z.literal("")),
  companyAddress: z.string().optional().or(z.literal("")),
  companyCity: z.string().optional().or(z.literal("")),
  companyState: z.string().optional().or(z.literal("")),
  isRegisteredCompany: z.boolean().optional(),
  companyRegNo: z.string().optional().or(z.literal("")),
  agencyName: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  expectedSalaryMin: z.coerce.number().optional().or(z.literal("")),
  expectedSalaryMax: z.coerce.number().optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  usePageTitle("My Profile");
  const { user } = useAuth();
  const updateUser = useUpdateUser();
  const uploadPicture = useUploadProfilePicture();
  const uploadLogo = useUploadCompanyLogo();
  const uploadCV = useUploadCV();
  const { data: jobHistoryData, isLoading: historyLoading } = useJobHistory();
  const createHistory = useCreateJobHistory();
  const updateHistory = useUpdateJobHistory();
  const deleteHistory = useDeleteJobHistory();
  const pictureInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const { data: profileStats } = useQuery<{ jobCount: number; avgRating: number | null }>({
    queryKey: ["/api/profile/stats"],
    enabled: !!user,
  });

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to change password");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Password changed successfully" });
      setShowChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: Error) => {
      toast({ title: err.message, variant: "destructive" });
    },
  });

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "New passwords do not match", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const [showAddHistory, setShowAddHistory] = useState(false);
  const [editingHistoryId, setEditingHistoryId] = useState<number | null>(null);
  const [historyTitle, setHistoryTitle] = useState("");
  const [historyCompany, setHistoryCompany] = useState("");
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");
  const [historyIsCurrent, setHistoryIsCurrent] = useState(false);
  const [historyDescription, setHistoryDescription] = useState("");

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (user?.role === "employer") {
        uploadLogo.mutate(file);
      } else {
        uploadPicture.mutate(file);
      }
    }
  };

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadCV.mutate(file);
  };

  const resetHistoryForm = () => {
    setHistoryTitle("");
    setHistoryCompany("");
    setHistoryStartDate("");
    setHistoryEndDate("");
    setHistoryIsCurrent(false);
    setHistoryDescription("");
    setEditingHistoryId(null);
    setShowAddHistory(false);
  };

  const startEditHistory = (entry: any) => {
    setEditingHistoryId(entry.id);
    setHistoryTitle(entry.jobTitle);
    setHistoryCompany(entry.company);
    setHistoryStartDate(entry.startDate || "");
    setHistoryEndDate(entry.endDate || "");
    setHistoryIsCurrent(entry.isCurrent || false);
    setHistoryDescription(entry.description || "");
    setShowAddHistory(false);
  };

  const handleSaveHistory = () => {
    if (!historyTitle.trim() || !historyCompany.trim()) return;
    const data = {
      jobTitle: historyTitle.trim(),
      company: historyCompany.trim(),
      startDate: historyStartDate || undefined,
      endDate: historyIsCurrent ? undefined : (historyEndDate || undefined),
      isCurrent: historyIsCurrent,
      description: historyDescription.trim() || undefined,
    };
    if (editingHistoryId) {
      updateHistory.mutate({ id: editingHistoryId, ...data }, { onSuccess: resetHistoryForm });
    } else {
      createHistory.mutate(data, { onSuccess: resetHistoryForm });
    }
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      location: user?.location || "",
      bio: user?.bio || "",
      role: user?.role as "applicant" | "employer" | "agent" || "applicant",
      email: user?.email || "",
      phone: user?.phone || "",
      preferredJobTypes: (user as any)?.preferredJobTypes || [],
      preferredCategories: (user as any)?.preferredCategories || [],
      companyName: user?.companyName || "",
      businessCategory: user?.businessCategory || "",
      companyAddress: (user as any)?.companyAddress || "",
      companyCity: (user as any)?.companyCity || "",
      companyState: (user as any)?.companyState || "",
      isRegisteredCompany: (user as any)?.isRegisteredCompany || false,
      companyRegNo: (user as any)?.companyRegNo || "",
      agencyName: (user as any)?.agencyName || "",
      gender: user?.gender || "",
      dateOfBirth: user?.dateOfBirth || "",
      state: (user as any)?.state || "",
      city: (user as any)?.city || "",
      expectedSalaryMin: user?.expectedSalaryMin || "",
      expectedSalaryMax: user?.expectedSalaryMax || "",
    }
  });

  const onSubmit = (data: ProfileFormValues) => {
    if (!user) return;
    const submitData: Record<string, any> = { id: user.id, ...data };
    if (data.dateOfBirth) {
      submitData.age = calculateAge(data.dateOfBirth);
    }
    updateUser.mutate(submitData);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PageHeader title="Account Settings" description="Customize your presence on Iṣéyá." />
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-10">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 space-y-8"
        >
          <Card className="rounded-3xl border-border/40 overflow-hidden shadow-xl shadow-black/5 bg-card/50 backdrop-blur-sm">
            <div className="h-32 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 animate-gradient" />
            <CardContent className="pt-0 text-center relative">
              <div className="relative inline-block -mt-16 mb-6">
                <Avatar className="w-32 h-32 border-8 border-background shadow-2xl">
                  <AvatarImage src={(user?.role === "employer" ? (user?.companyLogo || user?.profileImageUrl) : user?.profileImageUrl) || undefined} />
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute bottom-2 right-2 rounded-full w-10 h-10 shadow-lg shadow-primary/30 border-2 border-background"
                  onClick={() => pictureInputRef.current?.click()}
                  data-testid="button-upload-avatar"
                >
                  <Camera className="w-5 h-5" />
                </Button>
                <input
                  ref={pictureInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={handlePictureUpload}
                  data-testid="input-avatar-upload"
                />
              </div>
              <h3 className="text-2xl font-display font-bold">{user?.firstName} {user?.lastName}</h3>
              <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-xs mb-6 flex items-center justify-center gap-2">
                {user?.role === 'agent' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-700 border border-teal-500/30 dark:text-teal-400">Agent</span>}
                {user?.role !== 'agent' && user?.role}
                {user?.role === 'agent' && (user as any)?.agencyName && <span className="text-muted-foreground/60">• {(user as any).agencyName}</span>}
              </p>
              <div className="flex justify-center gap-4 py-4 border-t border-border/40">
                <div className="text-center px-4">
                  <div className="text-xl font-bold" data-testid="text-profile-job-count">{profileStats?.jobCount ?? 0}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">
                    {user?.role === "applicant" ? "Applications" : "Jobs"}
                  </div>
                </div>
                <div className="border-r border-border/40" />
                <div className="text-center px-4">
                  <div className="text-xl font-bold" data-testid="text-profile-rating">{profileStats?.avgRating ?? "—"}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Rating</div>
                </div>
              </div>
              <div className="pt-6 pb-2">
                 <StatusBadge status={user?.subscriptionStatus || 'free'} />
              </div>
            </CardContent>
          </Card>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="group"
          >
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none rounded-3xl overflow-hidden relative shadow-2xl shadow-primary/20">
              <Crown className="absolute right-[-20px] top-[-20px] w-40 h-40 opacity-10 group-hover:rotate-12 transition-transform duration-500" />
              <CardHeader>
                <CardTitle className="text-2xl font-display flex items-center gap-3">
                  <Shield className="w-6 h-6" />
                  Premium
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <p className="text-primary-foreground/90 font-medium text-lg leading-relaxed">
                  Get verified status, priority job alerts, and stand out to employers.
                </p>
                <Button variant="secondary" className="w-full h-12 rounded-2xl font-bold text-primary shadow-xl shadow-black/10">
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-8"
        >
          <Card className="rounded-3xl border-border/40 shadow-xl shadow-black/5 overflow-hidden">
            <CardHeader className="bg-muted/30 pb-8 border-b border-border/40">
              <CardTitle className="text-2xl font-display flex items-center gap-3">
                <Settings className="w-6 h-6 text-primary" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">First Name</FormLabel>
                          <FormControl>
                            <Input className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Last Name</FormLabel>
                          <FormControl>
                            <Input className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">User Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl">
                            <SelectItem value="applicant">Applicant</SelectItem>
                            <SelectItem value="employer">Employer</SelectItem>
                            <SelectItem value="agent">Agent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            State <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" data-testid="select-profile-state">
                                <SelectValue placeholder="Select your state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl max-h-[200px]">
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
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">City / Town</FormLabel>
                          <FormControl>
                            <Input className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" placeholder="e.g. Ikeja, Lekki" {...field} value={field.value || ""} data-testid="input-profile-city" />
                          </FormControl>
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
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Address / Area</FormLabel>
                        <FormControl>
                          <Input className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" placeholder="e.g. 15 Admiralty Way, Lekki Phase 1" {...field} value={field.value || ""} data-testid="input-profile-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {user?.role === 'applicant' && (
                    <>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Gender</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" data-testid="select-gender">
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-2xl">
                                  <SelectItem value="Male">Male</SelectItem>
                                  <SelectItem value="Female">Female</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Date of Birth</FormLabel>
                              <FormControl>
                                <Input type="date" max={getMaxDobFor18()} min={getMinDobDate()} className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" {...field} value={field.value || ""} data-testid="input-dob" />
                              </FormControl>
                              {field.value && (
                                <p className="text-xs text-muted-foreground">Age: {calculateAge(field.value)} years old</p>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number</FormLabel>
                              <FormControl>
                                <Input type="tel" className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" placeholder="e.g. 08012345678" {...field} value={field.value || ""} data-testid="input-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</FormLabel>
                              <FormControl>
                                <Input className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" placeholder="e.g. john@example.com" {...field} value={field.value || ""} data-testid="input-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="expectedSalaryMin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Expected Salary Min (₦)</FormLabel>
                              <FormControl>
                                <Input type="number" className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" placeholder="e.g. 5000" {...field} value={field.value || ""} data-testid="input-salary-min" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="expectedSalaryMax"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Expected Salary Max (₦)</FormLabel>
                              <FormControl>
                                <Input type="number" className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" placeholder="e.g. 50000" {...field} value={field.value || ""} data-testid="input-salary-max" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  {user?.role === 'employer' && (
                    <>
                      <div className="pt-4 pb-2 border-t border-border/40">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          Company Details
                        </h3>
                      </div>

                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Company / Business Name</FormLabel>
                            <FormControl>
                              <Input className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" placeholder="e.g. Lagos Catering Services" {...field} value={field.value || ""} data-testid="input-company-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="businessCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Business Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" data-testid="select-business-category">
                                  <SelectValue placeholder="Select your business category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-2xl">
                                {businessCategories.map((cat) => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Company Email</FormLabel>
                              <FormControl>
                                <Input className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" placeholder="e.g. info@company.com" {...field} value={field.value || ""} data-testid="input-company-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Company Phone</FormLabel>
                              <FormControl>
                                <Input className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" placeholder="e.g. +234 801 234 5678" {...field} value={field.value || ""} data-testid="input-company-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="companyAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Company Address</FormLabel>
                            <FormControl>
                              <Input className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" placeholder="e.g. 12 Broad Street" {...field} value={field.value || ""} data-testid="input-company-address" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="companyCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">City</FormLabel>
                              <FormControl>
                                <Input className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" placeholder="e.g. Lagos" {...field} value={field.value || ""} data-testid="input-company-city" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="companyState"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">State</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" data-testid="select-company-state">
                                    <SelectValue placeholder="Select state" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-2xl max-h-[200px]">
                                  {nigerianStates.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="isRegisteredCompany"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value || false}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-registered-company"
                              />
                            </FormControl>
                            <FormLabel className="text-sm cursor-pointer">This company is officially registered (CAC)</FormLabel>
                          </FormItem>
                        )}
                      />

                      {form.watch("isRegisteredCompany") && (
                        <FormField
                          control={form.control}
                          name="companyRegNo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">CAC Registration Number</FormLabel>
                              <FormControl>
                                <Input className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" placeholder="e.g. RC-123456" {...field} value={field.value || ""} data-testid="input-company-regno" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </>
                  )}

                  {user?.role === 'agent' && (
                    <>
                      <div className="pt-4 pb-2 border-t border-border/40">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-teal-500" />
                          Agent Profile
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">Manage your agency details for posting jobs on behalf of employers.</p>
                      </div>

                      <FormField
                        control={form.control}
                        name="agencyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Agency / Business Name <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" placeholder="e.g. Swift Recruit Agency" {...field} value={field.value || ""} data-testid="input-agency-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" placeholder="e.g. 08012345678" {...field} value={field.value || ""} data-testid="input-agent-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Contact Email</FormLabel>
                              <FormControl>
                                <Input className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" placeholder="e.g. agency@example.com" {...field} value={field.value || ""} data-testid="input-agent-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">State <span className="text-destructive">*</span></FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" data-testid="select-agent-state">
                                    <SelectValue placeholder="Select your state" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-2xl max-h-[200px]">
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
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">City / Town</FormLabel>
                              <FormControl>
                                <Input className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" placeholder="e.g. Ikeja" {...field} value={field.value || ""} data-testid="input-agent-city" />
                              </FormControl>
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
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Office Address / Area</FormLabel>
                            <FormControl>
                              <Input className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" placeholder="e.g. 12 Allen Avenue, Ikeja" {...field} value={field.value || ""} data-testid="input-agent-location" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">About Your Agency</FormLabel>
                            <FormControl>
                              <Textarea className="rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all min-h-[100px]" placeholder="Describe your agency, services offered, and areas of specialization..." {...field} value={field.value || ""} data-testid="input-agent-bio" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase className="w-4 h-4 text-teal-600" />
                          <p className="text-sm font-semibold text-teal-700 dark:text-teal-400">Posting Credits</p>
                        </div>
                        <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">{(user as any)?.agentPostCredits || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Buy credits or subscribe to a plan from the Post a Job page to post on behalf of your clients.
                        </p>
                      </div>
                    </>
                  )}

                  {user?.role === 'applicant' && (
                    <FormField
                      control={form.control}
                      name="preferredJobTypes"
                      render={({ field }) => {
                        const selected: string[] = field.value || [];
                        const toggleType = (type: string) => {
                          const updated = selected.includes(type)
                            ? selected.filter((t) => t !== type)
                            : [...selected, type];
                          field.onChange(updated);
                        };
                        return (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5" />
                                Preferred Job Types
                              </span>
                            </FormLabel>
                            <p className="text-xs text-muted-foreground -mt-1">Select the types of jobs you're interested in. We'll send you alerts when matching jobs are posted.</p>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className="w-full h-12 rounded-2xl border-border/60 bg-muted/20 hover:bg-muted/30 justify-between font-normal"
                                    data-testid="button-preferred-job-types"
                                  >
                                    {selected.length === 0 ? (
                                      <span className="text-muted-foreground">Select job types...</span>
                                    ) : (
                                      <span className="flex flex-wrap gap-1 overflow-hidden">
                                        {selected.map((type) => (
                                          <Badge key={type} variant="secondary" className="text-xs px-2 py-0.5">
                                            {type}
                                          </Badge>
                                        ))}
                                      </span>
                                    )}
                                    <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
                                <div className="space-y-1">
                                  {JOB_TYPE_OPTIONS.map((type) => (
                                    <label
                                      key={type}
                                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 cursor-pointer transition-colors"
                                      data-testid={`checkbox-job-type-${type.toLowerCase().replace(/\s+/g, "-")}`}
                                    >
                                      <Checkbox
                                        checked={selected.includes(type)}
                                        onCheckedChange={() => toggleType(type)}
                                      />
                                      <span className="text-sm font-medium">{type}</span>
                                    </label>
                                  ))}
                                </div>
                                {selected.length > 0 && (
                                  <div className="border-t mt-2 pt-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full text-xs text-muted-foreground"
                                      onClick={() => field.onChange([])}
                                      data-testid="button-clear-job-types"
                                    >
                                      <X className="w-3 h-3 mr-1" />
                                      Clear all
                                    </Button>
                                  </div>
                                )}
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  )}

                  {user?.role === 'applicant' && (
                    <FormField
                      control={form.control}
                      name="preferredCategories"
                      render={({ field }) => {
                        const selected: string[] = field.value || [];
                        const toggleCat = (cat: string) => {
                          const updated = selected.includes(cat)
                            ? selected.filter((c) => c !== cat)
                            : [...selected, cat];
                          field.onChange(updated);
                        };
                        return (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5" />
                                Preferred Job Categories
                              </span>
                            </FormLabel>
                            <p className="text-xs text-muted-foreground -mt-1">Select the job categories you're interested in for job alert notifications.</p>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className="w-full min-h-[48px] h-auto rounded-2xl border-border/60 bg-muted/20 hover:bg-muted/30 justify-between font-normal py-2"
                                    data-testid="button-preferred-categories"
                                  >
                                    {selected.length === 0 ? (
                                      <span className="text-muted-foreground">Select job categories...</span>
                                    ) : (
                                      <span className="flex flex-wrap gap-1 overflow-hidden">
                                        {selected.slice(0, 3).map((cat) => (
                                          <Badge key={cat} variant="secondary" className="text-xs px-2 py-0.5">
                                            {cat}
                                          </Badge>
                                        ))}
                                        {selected.length > 3 && (
                                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                                            +{selected.length - 3} more
                                          </Badge>
                                        )}
                                      </span>
                                    )}
                                    <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                <div className="max-h-[280px] overflow-y-auto p-2 space-y-1">
                                  {jobSectors.map((sector) => (
                                    <div key={sector.name}>
                                      <p className="px-3 py-1.5 text-xs font-bold text-primary uppercase tracking-wide">{sector.name}</p>
                                      {sector.subcategories.map((cat) => (
                                        <label
                                          key={cat}
                                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted/60 cursor-pointer transition-colors"
                                          data-testid={`checkbox-category-${cat.toLowerCase().replace(/[\s\/&()]+/g, "-")}`}
                                        >
                                          <Checkbox
                                            checked={selected.includes(cat)}
                                            onCheckedChange={() => toggleCat(cat)}
                                          />
                                          <span className="text-sm">{cat}</span>
                                        </label>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                                {selected.length > 0 && (
                                  <div className="border-t px-2 py-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full text-xs text-muted-foreground"
                                      onClick={() => field.onChange([])}
                                      data-testid="button-clear-categories"
                                    >
                                      <X className="w-3 h-3 mr-1" />
                                      Clear all ({selected.length} selected)
                                    </Button>
                                  </div>
                                )}
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">About You</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="min-h-[160px] rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all text-lg leading-relaxed resize-none" 
                            placeholder="Tell potential employers about your experience and skills..."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      disabled={updateUser.isPending}
                      className="h-14 px-10 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      {updateUser.isPending ? "Saving changes..." : "Save Profile"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {user?.role === 'applicant' && (
            <Card className="rounded-3xl border-border/40 shadow-xl shadow-black/5 overflow-hidden mt-10">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4 bg-muted/30 border-b border-border/40">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  CV / Resume
                </CardTitle>
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => cvInputRef.current?.click()} disabled={uploadCV.isPending} data-testid="button-upload-cv">
                  <Upload className="w-4 h-4 mr-1" />
                  {uploadCV.isPending ? "Uploading..." : "Upload CV"}
                </Button>
                <input
                  ref={cvInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleCVUpload}
                  data-testid="input-cv-file"
                />
              </CardHeader>
              <CardContent className="p-6">
                {user?.cvUrl ? (
                  <a href={user.cvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium" data-testid="link-view-cv">
                    <FileText className="w-4 h-4" />
                    View uploaded CV
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">No CV uploaded yet. Upload a PDF or DOC file (max 5MB).</p>
                )}
              </CardContent>
            </Card>
          )}

          {user?.role === 'applicant' && (
            <Card className="rounded-3xl border-border/40 shadow-xl shadow-black/5 overflow-hidden mt-10">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4 bg-muted/30 border-b border-border/40">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Job History
                </CardTitle>
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => { resetHistoryForm(); setShowAddHistory(true); }} data-testid="button-add-history">
                  <PlusCircle className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {(showAddHistory || editingHistoryId !== null) && (
                  <div className="p-4 bg-muted/30 rounded-2xl border border-border/40 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Job Title *</Label>
                        <Input value={historyTitle} onChange={(e) => setHistoryTitle(e.target.value)} placeholder="e.g. Delivery Rider" className="h-10 rounded-xl" data-testid="input-history-title" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Company *</Label>
                        <Input value={historyCompany} onChange={(e) => setHistoryCompany(e.target.value)} placeholder="e.g. Jumia" className="h-10 rounded-xl" data-testid="input-history-company" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Start Date</Label>
                        <Input type="month" value={historyStartDate} onChange={(e) => setHistoryStartDate(e.target.value)} className="h-10 rounded-xl" data-testid="input-history-start-date" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">End Date</Label>
                        <Input type="month" value={historyEndDate} onChange={(e) => setHistoryEndDate(e.target.value)} disabled={historyIsCurrent} placeholder={historyIsCurrent ? "Present" : ""} className="h-10 rounded-xl" data-testid="input-history-end-date" />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer" data-testid="label-is-current">
                      <input
                        type="checkbox"
                        checked={historyIsCurrent}
                        onChange={(e) => { setHistoryIsCurrent(e.target.checked); if (e.target.checked) setHistoryEndDate(""); }}
                        className="rounded border-border"
                        data-testid="checkbox-is-current"
                      />
                      <span className="text-xs text-muted-foreground">I currently work here</span>
                    </label>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</Label>
                      <Input value={historyDescription} onChange={(e) => setHistoryDescription(e.target.value)} placeholder="Brief description of your role" className="h-10 rounded-xl" data-testid="input-history-description" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="rounded-xl" onClick={handleSaveHistory} disabled={createHistory.isPending || updateHistory.isPending} data-testid="button-save-history">
                        <Check className="w-4 h-4 mr-1" />
                        {createHistory.isPending || updateHistory.isPending ? "Saving..." : editingHistoryId ? "Update Entry" : "Add Entry"}
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-xl" onClick={resetHistoryForm} data-testid="button-cancel-history">
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {historyLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="h-16 bg-muted/40 rounded-xl animate-pulse" />)}
                  </div>
                ) : jobHistoryData && jobHistoryData.length > 0 ? (
                  <div className="space-y-3">
                    {jobHistoryData.map((entry: any) => (
                      <div key={entry.id} className="flex items-start gap-3 p-3 bg-muted/20 rounded-xl border border-border/30" data-testid={`history-entry-${entry.id}`}>
                        <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" data-testid={`text-history-title-${entry.id}`}>{entry.jobTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.company}
                            {entry.startDate && (
                              <span className="ml-1">
                                ({entry.startDate}{" - "}{entry.isCurrent ? <span className="text-primary font-medium">Present</span> : (entry.endDate || "N/A")})
                              </span>
                            )}
                          </p>
                          {entry.isCurrent && (
                            <span className="inline-block mt-1 text-xs text-primary font-medium" data-testid={`badge-current-${entry.id}`}>Currently working here</span>
                          )}
                          {entry.description && <p className="text-xs text-muted-foreground mt-1">{entry.description}</p>}
                        </div>
                        <div className="flex flex-shrink-0 gap-1">
                          <Button size="icon" variant="ghost" onClick={() => startEditHistory(entry)} data-testid={`button-edit-history-${entry.id}`}>
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteHistory.mutate(entry.id)} disabled={deleteHistory.isPending} data-testid={`button-delete-history-${entry.id}`}>
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No job history added yet.</p>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="rounded-3xl border-border/40 shadow-xl shadow-black/5 overflow-hidden mt-10">
            <CardHeader className="bg-muted/30 border-b border-border/40">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!showChangePassword ? (
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setShowChangePassword(true)}
                  data-testid="button-toggle-change-password"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current Password</Label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current password"
                        className="h-10 rounded-xl"
                        data-testid="input-current-password"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">New Password</Label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password (min 6 chars)"
                        className="h-10 rounded-xl"
                        data-testid="input-new-password"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Confirm New Password</Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="h-10 rounded-xl"
                        data-testid="input-confirm-password"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="rounded-xl"
                      onClick={handleChangePassword}
                      disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
                      data-testid="button-save-password"
                    >
                      {changePasswordMutation.isPending ? "Changing..." : "Update Password"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-xl"
                      onClick={() => {
                        setShowChangePassword(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      data-testid="button-cancel-password"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
