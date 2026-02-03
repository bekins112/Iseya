import { useAuth } from "@/hooks/use-auth";
import { useUpdateUser } from "@/hooks/use-casual";
import { PageHeader } from "@/components/ui-extension";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Briefcase, Users, Star, TrendingUp, Shield } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "₦0",
    period: "forever",
    description: "Get started with basic features",
    features: [
      "Post up to 3 jobs",
      "View applicant profiles",
      "Basic support",
      "Standard job visibility",
    ],
    limitations: [
      "Limited job postings",
      "No priority support",
      "Standard listing position",
    ],
    icon: Briefcase,
    popular: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: "₦5,000",
    period: "per month",
    description: "Unlock all features for serious hiring",
    features: [
      "Unlimited job postings",
      "Priority job listing",
      "Advanced applicant filtering",
      "Direct messaging with applicants",
      "Analytics dashboard",
      "Priority support",
      "Verified employer badge",
      "Featured company profile",
    ],
    limitations: [],
    icon: Crown,
    popular: true,
  },
];

export default function Subscription() {
  const { user } = useAuth();
  const updateUser = useUpdateUser();
  const currentPlan = user?.subscriptionStatus || "free";

  const handleUpgrade = (planId: string) => {
    if (!user || user.role !== "employer") return;
    if (planId === "premium") {
      updateUser.mutate({ 
        id: user.id, 
        subscriptionStatus: "premium" 
      });
    }
  };

  const handleDowngrade = () => {
    if (!user || user.role !== "employer") return;
    updateUser.mutate({ 
      id: user.id, 
      subscriptionStatus: "free" 
    });
  };

  if (user && user.role !== "employer") {
    return (
      <div className="text-center py-20">
        <Crown className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2 className="text-2xl font-bold mb-2">Employer Only</h2>
        <p className="text-muted-foreground">Subscription plans are only available for employers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader 
        title="Subscription Plans" 
        description="Choose the right plan for your hiring needs"
      />

      {/* Current Plan Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {currentPlan === "premium" ? (
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary-foreground" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Your current plan</p>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {currentPlan === "premium" ? "Premium" : "Free"}
                  {currentPlan === "premium" && (
                    <Badge className="bg-primary">Active</Badge>
                  )}
                </h3>
              </div>
            </div>
            {currentPlan === "premium" && (
              <Button 
                variant="outline" 
                onClick={handleDowngrade}
                disabled={updateUser.isPending}
                data-testid="button-downgrade"
              >
                Downgrade to Free
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan, idx) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan === plan.id;
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`relative overflow-hidden h-full flex flex-col ${
                plan.popular ? 'border-primary shadow-xl shadow-primary/10' : ''
              }`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                    plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">/{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-6">
                  {isCurrentPlan ? (
                    <Button 
                      className="w-full" 
                      variant="outline" 
                      disabled
                      data-testid={`button-current-${plan.id}`}
                    >
                      Current Plan
                    </Button>
                  ) : plan.id === "premium" ? (
                    <Button 
                      className="w-full" 
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={updateUser.isPending}
                      data-testid="button-upgrade-premium"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {updateUser.isPending ? "Processing..." : "Upgrade to Premium"}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      disabled
                      data-testid={`button-select-${plan.id}`}
                    >
                      Free Forever
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Features Comparison */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Premium Benefits
          </CardTitle>
          <CardDescription>
            Why employers choose Premium
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: TrendingUp, title: "Priority Listing", desc: "Your jobs appear at the top of search results" },
              { icon: Users, title: "Unlimited Hiring", desc: "Post as many jobs as you need without limits" },
              { icon: Shield, title: "Verified Badge", desc: "Build trust with a verified employer badge" },
              { icon: Zap, title: "Instant Support", desc: "Get priority support when you need help" },
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Note */}
      <Card className="max-w-4xl mx-auto bg-muted/50">
        <CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Payment processing coming soon. Currently, subscription upgrades are for demonstration purposes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
