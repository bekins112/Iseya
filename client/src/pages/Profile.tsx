import { useAuth } from "@/hooks/use-auth";
import { useUpdateUser } from "@/hooks/use-casual";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PageHeader, StatusBadge } from "@/components/ui-extension";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileSchema = insertUserSchema.pick({
  firstName: true,
  lastName: true,
  location: true,
  bio: true,
}).extend({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user } = useAuth();
  const updateUser = useUpdateUser();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      location: user?.location || "",
      bio: user?.bio || "",
    }
  });

  const onSubmit = (data: ProfileFormValues) => {
    if (!user) return;
    updateUser.mutate({ id: user.id, ...data });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader title="My Profile" description="Manage your personal information and subscription." />

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h3>
              <p className="text-muted-foreground capitalize">{user?.role}</p>
              <div className="mt-4 flex justify-center">
                 <StatusBadge status={user?.subscriptionStatus || 'free'} />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground border-none">
            <CardHeader>
              <CardTitle className="text-lg">Upgrade to Premium</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-primary-foreground/90 text-sm">
                Get verified status, priority support, and unlimited job postings.
              </p>
              <Button variant="secondary" className="w-full font-semibold text-primary">Upgrade Now</Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Edit Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea className="min-h-[120px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateUser.isPending}>
                      {updateUser.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
