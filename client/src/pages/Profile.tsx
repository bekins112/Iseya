import { useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateUser, useUploadProfilePicture, useUploadCompanyLogo } from "@/hooks/use-casual";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PageHeader, StatusBadge } from "@/components/ui-extension";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";
import { Settings, Shield, Crown, Camera, ChevronDown, X, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const JOB_TYPE_OPTIONS = [
  "Full-time",
  "Part-time",
  "Contract",
];

const JOB_CATEGORY_OPTIONS = [
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

const profileSchema = insertUserSchema.pick({
  firstName: true,
  lastName: true,
  role: true,
  location: true,
  bio: true,
  profileImageUrl: true,
  cvUrl: true,
  email: true,
  phone: true,
}).extend({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  role: z.enum(["applicant", "employer"]),
  location: z.string().nullable().optional(),
  bio: z.string().optional(),
  profileImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  cvUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  email: z.string().email("Must be a valid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  preferredJobTypes: z.array(z.string()).optional(),
  preferredCategories: z.array(z.string()).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user } = useAuth();
  const updateUser = useUpdateUser();
  const uploadPicture = useUploadProfilePicture();
  const uploadLogo = useUploadCompanyLogo();
  const pictureInputRef = useRef<HTMLInputElement>(null);

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

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      location: user?.location || "",
      bio: user?.bio || "",
      role: user?.role as "applicant" | "employer" || "applicant",
      email: user?.email || "",
      phone: user?.phone || "",
      profileImageUrl: user?.profileImageUrl || "",
      cvUrl: user?.cvUrl || "",
      preferredJobTypes: (user as any)?.preferredJobTypes || [],
      preferredCategories: (user as any)?.preferredCategories || [],
    }
  });

  const onSubmit = (data: ProfileFormValues) => {
    if (!user) return;
    updateUser.mutate({ id: user.id, ...data });
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
                  <AvatarImage src={(user?.role === "employer" ? user?.companyLogo : user?.profileImageUrl) || undefined} />
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
              <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-xs mb-6">{user?.role}</p>
              <div className="flex justify-center gap-4 py-4 border-t border-border/40">
                <div className="text-center px-4">
                  <div className="text-xl font-bold">12</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Jobs</div>
                </div>
                <div className="border-r border-border/40" />
                <div className="text-center px-4">
                  <div className="text-xl font-bold">4.8</div>
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
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Primary Location</FormLabel>
                        <FormControl>
                          <Input className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" placeholder="e.g. San Francisco, CA" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {user?.role === 'employer' && (
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
                  )}

                  <FormField
                    control={form.control}
                    name="profileImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Profile Picture URL</FormLabel>
                        <FormControl>
                          <Input className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" placeholder="https://example.com/photo.jpg" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {user?.role === 'applicant' && (
                    <FormField
                      control={form.control}
                      name="cvUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">CV / Resume URL (PDF)</FormLabel>
                          <FormControl>
                            <Input className="h-12 rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-all" placeholder="https://example.com/my-cv.pdf" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                                <div className="max-h-[280px] overflow-y-auto p-2 space-y-0.5">
                                  {JOB_CATEGORY_OPTIONS.map((cat) => (
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
        </motion.div>
      </div>
    </div>
  );
}
