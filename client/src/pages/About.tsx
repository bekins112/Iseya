import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Users, Target, Heart, Shield, Briefcase, CheckCircle2 } from "lucide-react";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";

export default function About() {
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
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2">
              <img src={iseyaLogo} alt="Iṣéyá" className="h-8 w-auto" />
            </a>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/about">
              <a className="text-sm font-medium text-primary">About</a>
            </Link>
            <Link href="/faqs">
              <a className="text-sm font-medium text-muted-foreground hover:text-foreground">FAQs</a>
            </Link>
            <Link href="/contact">
              <a className="text-sm font-medium text-muted-foreground hover:text-foreground">Contact</a>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">About Iṣéyá</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connecting Nigerian workers with opportunities, one job at a time.
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
                  <h2 className="text-3xl font-display font-bold mb-4">Our Mission</h2>
                  <p className="text-muted-foreground mb-4">
                    Iṣéyá (meaning "work" in Yoruba) was founded with a simple mission: to bridge the gap between 
                    casual workers seeking opportunities and employers looking for reliable help.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    In Nigeria, millions of hardworking individuals are ready and willing to work, but often lack 
                    access to opportunities. We're changing that by creating a platform where talent meets 
                    opportunity, regardless of formal qualifications.
                  </p>
                  <p className="text-muted-foreground">
                    Whether you're looking for your next casual job or searching for workers to help with 
                    your business, Iṣéyá is here to make the connection seamless and trustworthy.
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
          <h2 className="text-3xl font-display font-bold text-center mb-8">Our Values</h2>
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
              <h2 className="text-2xl font-display font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of Nigerians who have found work or hired through Iṣéyá.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button size="lg" className="gap-2" data-testid="button-find-work">
                    <CheckCircle2 className="w-5 h-5" />
                    Find Work
                  </Button>
                </Link>
                <Link href="/employer">
                  <Button size="lg" variant="outline" className="gap-2" data-testid="button-hire-workers">
                    <Users className="w-5 h-5" />
                    Hire Workers
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <footer className="border-t py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={iseyaLogo} alt="Iṣéyá" className="h-6 w-auto" />
            <span className="text-sm text-muted-foreground">© 2026 Iṣéyá. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/about">
              <a className="text-sm text-muted-foreground hover:text-foreground">About</a>
            </Link>
            <Link href="/faqs">
              <a className="text-sm text-muted-foreground hover:text-foreground">FAQs</a>
            </Link>
            <Link href="/contact">
              <a className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
