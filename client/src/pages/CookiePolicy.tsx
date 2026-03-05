import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Cookie, Shield, Settings, Globe, Clock, RefreshCw, Mail, Layers, BarChart3 } from "lucide-react";
import { SiInstagram, SiLinkedin, SiX, SiFacebook } from "react-icons/si";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";

export default function CookiePolicy() {
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

  const sections = [
    {
      icon: <Cookie className="w-6 h-6" />,
      title: "What Are Cookies",
      content: "Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work more efficiently, provide a better browsing experience, and give website owners useful information. Cookies help us remember your preferences, understand how you use our Platform, and improve your overall experience on Iṣéyá."
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "How We Use Cookies",
      content: "Iṣéyá uses cookies to enhance your experience on the Platform. We use cookies to keep you signed in to your account, remember your preferences and settings, understand how you interact with the Platform, improve our services based on usage patterns, and ensure the security of your account. We are committed to using cookies responsibly and transparently."
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: "Types of Cookies",
      content: "We use the following types of cookies on the Platform:\n\nEssential Cookies: These cookies are strictly necessary for the Platform to function. They enable core features such as authentication, session management, and security. Without these cookies, the Platform cannot operate properly. These cookies cannot be disabled.\n\nAnalytics Cookies: These cookies help us understand how users interact with the Platform by collecting anonymous usage data. They allow us to measure traffic, identify popular features, and detect issues. This information helps us continuously improve the Platform.\n\nPreference Cookies: These cookies remember your choices and settings, such as your preferred language, theme (light or dark mode), and other display preferences. They provide a more personalised experience when you return to the Platform."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Third-Party Cookies",
      content: "Some cookies on the Platform are set by third-party services that we integrate with, including payment processors (Paystack and Flutterwave) and analytics tools. These third-party cookies are governed by the respective privacy policies of those services. We do not control these cookies and recommend reviewing the privacy policies of these third-party providers. Third-party cookies may be used for fraud prevention, payment processing, and service analytics."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Managing Cookies",
      content: "You can control and manage cookies in your browser settings. Most browsers allow you to view, delete, and block cookies from websites. Please note that disabling essential cookies may affect the functionality of the Platform and prevent you from using certain features. You can typically find cookie settings in your browser's \"Settings\", \"Privacy\", or \"Security\" section. You can also use the cookie preferences on our Platform to manage which non-essential cookies you accept."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Cookie Duration",
      content: "Cookies used on the Platform have varying lifespans:\n\nSession Cookies: These are temporary cookies that are deleted when you close your browser. They are used to maintain your session while you browse the Platform.\n\nPersistent Cookies: These cookies remain on your device for a set period or until you manually delete them. They are used to remember your preferences and recognise you when you return to the Platform. The duration of persistent cookies varies depending on their purpose, ranging from a few days to up to one year."
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "Updates to This Policy",
      content: "Iṣéyá reserves the right to update this Cookie Policy at any time to reflect changes in our practices, technology, or legal requirements. Any significant changes will be communicated through the Platform. The \"Last updated\" date at the top of this page indicates when this policy was last revised. We encourage you to review this policy periodically to stay informed about how we use cookies."
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Contact Us",
      content: "If you have any questions or concerns about our use of cookies, please do not hesitate to reach out to us. You can contact us through our Contact page, or email us at support@iseya.com. We are committed to addressing your concerns and ensuring your privacy is protected while using the Iṣéyá platform."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src={iseyaLogo} alt="Iṣéyá" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/browse-jobs" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Browse Jobs
            </Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href="/faqs" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              FAQs
            </Link>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </nav>

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
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4" data-testid="text-cookie-policy-title">Cookie Policy</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Learn how Iṣéyá uses cookies to improve your experience on the Platform.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: February 2026
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
              <Card className="hover-elevate" data-testid={`card-cookie-policy-section-${i}`}>
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 shrink-0 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      {section.icon}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold mb-2">{section.title}</h2>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
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
                By continuing to use Iṣéyá, you acknowledge that you have read and understood this Cookie Policy.
                If you have any questions, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <footer className="border-t py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={iseyaLogo} alt="Iṣéyá" className="h-6 w-auto" />
              <span className="text-sm text-muted-foreground">© 2026 Iṣéyá by RenownedTech. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-2">
              <a href="https://instagram.com/iseyaofficial" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Instagram"><SiInstagram className="w-3.5 h-3.5" /></a>
              <a href="https://linkedin.com/company/iseyaofficial" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="LinkedIn"><SiLinkedin className="w-3.5 h-3.5" /></a>
              <a href="https://x.com/iseyaofficial" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="X (Twitter)"><SiX className="w-3.5 h-3.5" /></a>
              <a href="https://facebook.com/iseyaofficial" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Facebook"><SiFacebook className="w-3.5 h-3.5" /></a>
            </div>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <Link href="/browse-jobs" className="text-sm text-muted-foreground hover:text-foreground">
              Browse Jobs
            </Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href="/faqs" className="text-sm text-muted-foreground hover:text-foreground">
              FAQs
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
            <Link href="/cookies" className="text-sm text-primary font-medium">
              Cookie Policy
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/disclaimer" className="text-sm text-muted-foreground hover:text-foreground">
              Disclaimer
            </Link>
            <Link href="/copyright" className="text-sm text-muted-foreground hover:text-foreground">
              Copyright
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}