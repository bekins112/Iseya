import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, FileText, Shield, Scale, Users, AlertTriangle, Globe, Ban, RefreshCw, Gavel } from "lucide-react";
import { SiInstagram, SiLinkedin, SiX, SiFacebook } from "react-icons/si";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { usePageTitle } from "@/hooks/use-page-title";

export default function TermsOfUse() {
  usePageTitle("Terms of Use");
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
      icon: <FileText className="w-6 h-6" />,
      title: "1. Acceptance of Terms",
      content: "By accessing or using the Iṣéyá platform (\"Platform\"), operated by Renowned Technology Limited, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Platform. Your continued use of the Platform constitutes your acceptance of any updates or modifications to these terms."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "2. Eligibility",
      content: "You must be at least 18 years of age to create an account and use the Platform. By registering, you confirm that you meet this age requirement. Iṣéyá reserves the right to request proof of age and to suspend or terminate accounts that violate this requirement."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "3. Account Registration & Security",
      content: "You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during registration. You must not share your account with others or allow unauthorized access. You are responsible for all activities that occur under your account. Notify us immediately if you suspect any unauthorized use of your account."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "4. Platform Use",
      content: "Iṣéyá is a marketplace connecting job seekers (applicants) with employers for casual and short-term work opportunities. The Platform facilitates connections but does not act as an employer, staffing agency, or employment intermediary. Users may register as applicants (job seekers) or employers (job posters). Each role has specific features and limitations as described on the Platform."
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "5. User Conduct",
      content: "Users agree not to: (a) post false, misleading, or fraudulent information; (b) harass, abuse, or discriminate against other users; (c) use the Platform for any illegal purpose; (d) attempt to gain unauthorized access to other accounts or Platform systems; (e) scrape, collect, or harvest user data; (f) post spam or unsolicited advertisements; (g) impersonate any person or entity; (h) interfere with or disrupt the Platform's operation."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "6. Job Listings & Applications",
      content: "Employers are responsible for the accuracy of their job listings, including job descriptions, compensation, location, and requirements. Applicants are responsible for the accuracy of their profiles and application materials. Iṣéyá does not guarantee the legitimacy of any job listing or the qualifications of any applicant. Users should exercise due diligence before entering into any arrangement."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "7. Subscription & Payments",
      content: "Certain features require paid subscriptions. Subscription fees are displayed in Nigerian Naira (NGN) and processed through Paystack or Flutterwave. By subscribing, you authorize recurring charges as applicable. Subscription benefits, pricing, and limits may be updated by the Platform. Refund policies are subject to the terms displayed at the time of purchase."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "8. Verification Services",
      content: "Our optional verification service allows applicants to submit identification documents for review. Verification is valid for a limited period and does not constitute a comprehensive background check. Employers should conduct their own due diligence. Verification fees are non-refundable once the review process begins."
    },
    {
      icon: <Ban className="w-6 h-6" />,
      title: "9. Prohibited Content",
      content: "Users may not post content that is: (a) illegal, harmful, or threatening; (b) defamatory, vulgar, or obscene; (c) discriminatory based on race, gender, religion, nationality, disability, age, or sexual orientation; (d) infringing on intellectual property rights; (e) containing malware or malicious code. Iṣéyá reserves the right to remove any content that violates these terms without notice."
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "10. Limitation of Liability",
      content: "To the maximum extent permitted by Nigerian law, Renowned Technology Limited shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Platform. This includes damages for loss of profits, data, goodwill, or other intangible losses. Our total liability for any claim shall not exceed the amount you paid to us in the 12 months preceding the claim."
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "11. Account Termination",
      content: "Iṣéyá may suspend or terminate your account at any time for violations of these terms, fraudulent activity, or any conduct deemed harmful to the Platform or its users. You may also delete your account at any time through your profile settings. Upon termination, your right to use the Platform ceases immediately, though certain provisions of these terms survive termination."
    },
    {
      icon: <Gavel className="w-6 h-6" />,
      title: "12. Governing Law & Disputes",
      content: "These Terms of Use shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from these terms or your use of the Platform shall be resolved through negotiation in good faith. If negotiation fails, disputes shall be submitted to the exclusive jurisdiction of Nigerian courts."
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "13. Changes to Terms",
      content: "Iṣéyá reserves the right to modify these Terms of Use at any time. Significant changes will be communicated through the Platform or via email to registered users. Your continued use of the Platform after changes are posted constitutes acceptance of the revised terms. We encourage users to review these terms periodically."
    },
  ];

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
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4" data-testid="text-terms-title">Terms of Use</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Please read these terms carefully before using the Iseya platform.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: March 2026
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
                By using Iseya, you acknowledge that you have read, understood, and agree to these Terms of Use.
                If you have any questions, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
