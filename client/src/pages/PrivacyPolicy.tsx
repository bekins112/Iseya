import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Shield, Eye, Users, Lock, UserCheck, Clock, Baby, Globe, RefreshCw, Mail } from "lucide-react";
import { SiInstagram, SiLinkedin, SiX, SiFacebook } from "react-icons/si";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";

export default function PrivacyPolicy() {
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
      icon: <Eye className="w-6 h-6" />,
      title: "1. Information We Collect",
      content: "We collect information you provide directly when registering on the Platform, including your full name, email address, phone number, location, date of birth, and professional details such as skills, qualifications, and work experience. For employers, we collect business name, industry, and company details. We also collect information automatically, including device information, IP address, browser type, usage patterns, and cookies. If you use our verification service, we collect identification documents and selfie photographs for identity confirmation purposes."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "2. How We Use Your Information",
      content: "We use your information to: (a) create and manage your account; (b) facilitate connections between job seekers and employers; (c) process subscription payments and verification requests; (d) communicate with you about your account, applications, and Platform updates; (e) improve and personalise your experience on the Platform; (f) ensure Platform security and prevent fraud; (g) comply with legal obligations under Nigerian law, including the Nigeria Data Protection Regulation (NDPR); (h) send you relevant job notifications and recommendations based on your profile and preferences."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "3. Data Sharing & Disclosure",
      content: "We may share your information with: (a) employers when you apply for a job listing (your profile, CV, and application details); (b) payment processors (Paystack and Flutterwave) to facilitate transactions; (c) service providers who assist us in operating the Platform, subject to confidentiality obligations; (d) law enforcement or regulatory authorities when required by Nigerian law or to protect our legal rights. We do not sell your personal information to third parties. Employers who receive your application data are required to use it solely for recruitment purposes."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "4. Data Security",
      content: "We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction, in accordance with the Nigeria Data Protection Regulation (NDPR). These measures include encryption of sensitive data, secure server infrastructure, access controls, and regular security assessments. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your account credentials."
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "5. Your Rights",
      content: "Under the Nigeria Data Protection Regulation (NDPR) and applicable law, you have the right to: (a) access the personal data we hold about you; (b) request correction of inaccurate or incomplete data; (c) request deletion of your personal data, subject to legal retention requirements; (d) object to or restrict the processing of your data in certain circumstances; (e) withdraw consent for data processing where consent was the basis; (f) receive your data in a portable format; (g) lodge a complaint with the National Information Technology Development Agency (NITDA). To exercise these rights, contact us at privacy@iseya.com."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "6. Data Retention",
      content: "We retain your personal data for as long as your account is active or as needed to provide services to you. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law or for legitimate business purposes such as resolving disputes or enforcing our agreements. Verification documents are retained for the duration of the verification validity period and securely deleted thereafter. Payment transaction records are retained as required by Nigerian financial regulations."
    },
    {
      icon: <Baby className="w-6 h-6" />,
      title: "7. Children's Privacy",
      content: "The Iṣéyá Platform is intended for users aged 18 years and above. We do not knowingly collect personal information from individuals under 18. If we become aware that we have collected data from a person under 18, we will take immediate steps to delete such information from our systems. If you believe a minor has provided us with personal data, please contact us immediately so we can take appropriate action."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "8. Third-Party Services",
      content: "The Platform may contain links to third-party websites and integrates with third-party services including payment processors (Paystack and Flutterwave). These third parties have their own privacy policies, and we are not responsible for their practices. We encourage you to review the privacy policies of any third-party services you interact with through the Platform. Our use of third-party services is governed by our agreements with those providers and applicable data protection laws."
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "9. Changes to This Policy",
      content: "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify registered users of significant changes via email or through a prominent notice on the Platform. The updated policy will be effective from the date of posting. Your continued use of the Platform after changes are posted constitutes your acceptance of the revised Privacy Policy. We encourage you to review this policy periodically."
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "10. Contact Us",
      content: "If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Data Protection Officer at privacy@iseya.com. You may also reach us through the contact form on our Platform or write to Renowned Technology Limited at our registered office address. We are committed to resolving any privacy-related concerns in a timely manner and in compliance with the Nigeria Data Protection Regulation (NDPR)."
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
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4" data-testid="text-privacy-policy-title">Privacy Policy</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal data in compliance with the Nigeria Data Protection Regulation (NDPR).
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
              <Card className="hover-elevate" data-testid={`card-privacy-section-${i}`}>
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
                By using Iṣéyá, you acknowledge that you have read, understood, and agree to this Privacy Policy.
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
              <span className="text-sm text-muted-foreground">© 2026 Iṣéyá. All rights reserved.</span>
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
            <Link href="/disclaimer" className="text-sm text-muted-foreground hover:text-foreground">
              Disclaimer
            </Link>
            <Link href="/copyright" className="text-sm text-muted-foreground hover:text-foreground">
              Copyright
            </Link>
            <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground">
              Cookie Policy
            </Link>
            <Link href="/privacy" className="text-sm text-primary font-medium">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
