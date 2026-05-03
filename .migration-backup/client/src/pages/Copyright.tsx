import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Copyright as CopyrightIcon, Shield, FileText, AlertCircle, Globe, Scale, BookOpen } from "lucide-react";
import { SiInstagram, SiLinkedin, SiX, SiFacebook } from "react-icons/si";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { usePageTitle } from "@/hooks/use-page-title";

export default function CopyrightPage() {
  usePageTitle("Copyright");
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
      icon: <CopyrightIcon className="w-6 h-6" />,
      title: "Copyright Ownership",
      content: "Iṣéyá is a product of Renowned Technology Limited. All content on the Iṣéyá platform, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, is the property of Renowned Technology Limited (trading as Iṣéyá) or its content suppliers and is protected by Nigerian copyright laws and international copyright treaties. The compilation of all content on this platform is the exclusive property of Renowned Technology Limited."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Trademarks",
      content: "The Iṣéyá name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of Renowned Technology Limited. You must not use such marks without the prior written permission of Renowned Technology Limited. All other names, logos, product and service names, designs, and slogans on this platform are the trademarks of their respective owners."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Permitted Use",
      content: "You may access and use the Iṣéyá platform for your personal, non-commercial use only. You may download or print a single copy of any portion of the content to which you have properly gained access, solely for your personal, non-commercial use, provided that you keep all copyright, trademark, and other proprietary notices intact."
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "Prohibited Use",
      content: "You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on the platform without prior written consent. You must not use any content from the platform for commercial purposes, including but not limited to reselling, redistributing, or creating competing services. Systematic retrieval of data or content through automated means (scraping, data mining, robots) is strictly prohibited."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "User-Generated Content",
      content: "Users retain ownership of content they submit to the platform, including job postings, applications, profile information, and messages. By submitting content, you grant Iṣéyá a non-exclusive, worldwide, royalty-free, perpetual licence to use, reproduce, modify, adapt, publish, and display such content in connection with the operation of the platform. You represent and warrant that you own or control all rights to the content you post."
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "Copyright Infringement",
      content: "If you believe that any content on the Iṣéyá platform infringes upon your copyright, please contact us with the following information: a description of the copyrighted work you claim has been infringed, the location of the infringing material on the platform, your contact information, a statement that you have a good faith belief that the use is not authorised, and a statement that the information in your notice is accurate. We will investigate and take appropriate action."
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Third-Party Content",
      content: "The platform may contain links to third-party websites, services, or content that are not owned or controlled by Iṣéyá. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. The inclusion of any link does not imply endorsement by Iṣéyá."
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "Enforcement & Remedies",
      content: "Iṣéyá reserves the right to take legal action against any unauthorised use of its copyrighted materials or trademarks. Violations of this copyright policy may result in account termination, legal proceedings, and claims for damages. We reserve the right to remove any content that infringes on intellectual property rights without prior notice."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Governing Law",
      content: "This copyright notice shall be governed by and construed in accordance with the Copyright Act of Nigeria and applicable international copyright conventions, including the Berne Convention for the Protection of Literary and Artistic Works. Any disputes shall be subject to the exclusive jurisdiction of the courts of the Federal Republic of Nigeria."
    }
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
              <CopyrightIcon className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4" data-testid="text-copyright-title">Copyright Notice</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Information about intellectual property rights and usage terms for the Iṣéyá platform.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: February 2026
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-center">
              <p className="text-lg font-semibold mb-1">
                © 2026 Iṣéyá by RenownedTech. All Rights Reserved.
              </p>
              <p className="text-sm text-muted-foreground">
                Unauthorised reproduction or distribution of any content on this platform is strictly prohibited.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {sections.map((section, i) => (
            <motion.div key={i} variants={item}>
              <Card className="hover-elevate" data-testid={`card-copyright-section-${i}`}>
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
                For copyright-related enquiries or to report infringement, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
