import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Link } from "wouter";
import { ArrowLeft, Users, Target, Heart, Shield, Briefcase, CheckCircle2 , Linkedin } from "lucide-react" ;
import { SiInstagram, SiX, SiFacebook } from "react-icons/si";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";
import { usePageTitle } from "@/hooks/use-page-title";
import { usePageContent } from "@/lib/page-content/use-page-content";
import { aboutDefaults } from "@/lib/page-content/about";

export default function About() {
  usePageTitle("About Us");
  const c = usePageContent("page_about", aboutDefaults);
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const values = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community First",
      description: "We believe in building strong connections between workers and employers in local communities."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Opportunity for All",
      description: "Everyone deserves access to fair work opportunities, regardless of formal qualifications."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Trust & Respect",
      description: "We foster an environment of mutual respect between job seekers and employers."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Safety & Security",
      description: "Your safety and data security are our top priorities at every step."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{c.hero.title}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {c.hero.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <Card className="border-none shadow-xl bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-display font-bold mb-4">{c.mission.heading}</h2>
                  <p className="text-muted-foreground mb-4">
                    {c.mission.paragraph1Start}<strong>{c.mission.companyName}</strong>{c.mission.paragraph1End}
                  </p>
                  <p className="text-muted-foreground mb-4">
                    {c.mission.paragraph2}
                  </p>
                  <p className="text-muted-foreground">
                    {c.mission.paragraph3}
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="w-64 h-64 bg-primary/10 rounded-full flex items-center justify-center">
                    <Briefcase className="w-24 h-24 text-primary" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mb-16"
        >
          <h2 className="text-3xl font-display font-bold text-center mb-8">{c.values.heading}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div key={i} variants={item}>
                <Card className="h-full hover-elevate">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                      {value.icon}
                    </div>
                    <h3 className="font-bold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-8">
              <h2 className="text-2xl font-display font-bold mb-4">{c.cta.heading}</h2>
              <p className="text-muted-foreground mb-6">
                {c.cta.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button size="lg" className="gap-2" data-testid="button-find-work">
                    <CheckCircle2 className="w-5 h-5" />
                    {c.cta.buttonFindWork}
                  </Button>
                </Link>
                <Link href="/employer">
                  <Button size="lg" variant="outline" className="gap-2" data-testid="button-hire-workers">
                    <Users className="w-5 h-5" />
                    {c.cta.buttonHireWorkers}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
