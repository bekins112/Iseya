import { useRef } from "react";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PageHeader, StatusBadge } from "@/components/ui-extension";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Settings, Shield, Crown, Camera } from "lucide-react";

const profileSchema = insertUserSchema.pick({
  firstName: true,
  lastName: true,
  role: true,
  location: true,
  bio: true,
  profileImageUrl: true,
  cvUrl: true,
}).extend({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  role: z.enum(["applicant", "employer"]),
  location: z.string().nullable().optional(),
  bio: z.string().optional(),
  profileImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  cvUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
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
      profileImageUrl: user?.profileImageUrl || "",
      cvUrl: user?.cvUrl || "",
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
