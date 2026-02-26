import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, AlertTriangle, Shield, Scale, FileText, Info } from "lucide-react";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";

export default function Disclaimer() {
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
      icon: <Info className="w-6 h-6" />,
      title: "General Information",
      content: "The information provided on Iṣéyá (the \"Platform\") is for general informational purposes only. While we strive to keep all information accurate and up-to-date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information, products, services, or related graphics contained on the Platform."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "No Employment Guarantee",
      content: "Iṣéyá serves as a marketplace connecting job seekers (applicants) with employers. We do not guarantee employment, job placement, or any specific outcome from using the Platform. The hiring decision rests solely with the employer, and acceptance of a job offer is at the applicant's discretion. Iṣéyá is not an employer and does not enter into employment relationships with users."
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "User Responsibility",
      content: "Users are solely responsible for the accuracy of the information they provide on the Platform, including but not limited to personal details, qualifications, job descriptions, salary offers, and company information. Iṣéyá does not verify the accuracy of user-submitted content unless explicitly stated (such as through our optional verification service). Users agree to conduct their own due diligence before entering into any arrangement with another user."
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "Limitation of Liability",
      content: "To the fullest extent permitted by Nigerian law, Iṣéyá, its owners, directors, employees, and agents shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of or relating to the use of, or inability to use, the Platform. This includes but is not limited to damages for loss of profits, goodwill, data, or other intangible losses, even if Iṣéyá has been advised of the possibility of such damages."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Third-Party Services",
      content: "The Platform integrates with third-party payment processors (Paystack and Flutterwave) for subscription and verification payments. Iṣéyá is not responsible for the actions, policies, or practices of these third-party services. Users are encouraged to review the terms and privacy policies of these services independently. Any transactions processed through these services are subject to their respective terms of service."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Verification Service",
      content: "Our applicant verification service is provided as an optional feature to enhance trust on the Platform. While we make reasonable efforts to review submitted documents, verification does not constitute a comprehensive background check or endorsement of any individual. Employers should exercise their own judgement and conduct additional checks as they deem necessary before hiring."
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "Age Restriction",
      content: "The Platform is intended for users aged 16 years and above. By using Iṣéyá, you confirm that you meet this age requirement. Users under 16 are not permitted to create accounts or use the Platform's services. Iṣéyá reserves the right to terminate accounts found to be in violation of this policy."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Intellectual Property",
      content: "All content, trademarks, logos, and intellectual property displayed on the Platform are the property of Iṣéyá or their respective owners. Users may not reproduce, distribute, modify, or create derivative works from any content on the Platform without prior written consent from the owner."
    },
    {
      icon: <Info className="w-6 h-6" />,
      title: "Changes to This Disclaimer",
      content: "Iṣéyá reserves the right to update or modify this disclaimer at any time without prior notice. Continued use of the Platform after any changes constitutes acceptance of the revised disclaimer. Users are encouraged to review this page periodically for updates."
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "Governing Law",
      content: "This disclaimer shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from or in connection with the use of the Platform shall be subject to the exclusive jurisdiction of Nigerian courts."
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
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4" data-testid="text-disclaimer-title">Disclaimer</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Please read this disclaimer carefully before using the Iṣéyá platform.
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
              <Card className="hover-elevate" data-testid={`card-disclaimer-section-${i}`}>
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
                By using Iṣéyá, you acknowledge that you have read, understood, and agree to this disclaimer.
                If you have any questions, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
              </p>
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
            <Link href="/disclaimer" className="text-sm text-primary font-medium">
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
