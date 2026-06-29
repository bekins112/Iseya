import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, FileText, Shield, Scale, Users, AlertTriangle, Globe, Ban, RefreshCw, Gavel , Linkedin } from "lucide-react" ;
import { SiInstagram, SiX, SiFacebook } from "react-icons/si";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { usePageTitle } from "@/hooks/use-page-title";
import { usePageContent } from "@/lib/page-content/use-page-content";
import { termsDefaults } from "@/lib/page-content/terms";

export default function TermsOfUse() {
  usePageTitle("Terms of Use");
  const c = usePageContent("page_terms", termsDefaults);
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

  const sectionIcons = [
    <FileText className="w-6 h-6" />,
    <Users className="w-6 h-6" />,
    <Shield className="w-6 h-6" />,
    <Globe className="w-6 h-6" />,
    <Scale className="w-6 h-6" />,
    <FileText className="w-6 h-6" />,
    <Shield className="w-6 h-6" />,
    <Shield className="w-6 h-6" />,
    <Ban className="w-6 h-6" />,
    <AlertTriangle className="w-6 h-6" />,
    <RefreshCw className="w-6 h-6" />,
    <Gavel className="w-6 h-6" />,
    <RefreshCw className="w-6 h-6" />,
  ];

  const sections = c.sections.items.map((section, i) => ({
    icon: sectionIcons[i % sectionIcons.length],
    title: section.title,
    content: section.content,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-24 pb-16 px-4 md:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4" data-testid="text-terms-title">{c.header.title}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {c.header.intro}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {c.header.lastUpdated}
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {sections.map((section, i) => (
            <motion.div key={i} variants={item}>
              <Card className="hover-elevate" data-testid={`card-terms-section-${i}`}>
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 shrink-0 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      {section.icon}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold mb-2">{section.title}</h2>
                      <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                {c.footer.note} <Link href="/contact" className="text-primary hover:underline">{c.footer.contactLabel}</Link>.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
