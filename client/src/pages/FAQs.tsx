import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Link } from "wouter";
import { ChevronDown, HelpCircle, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { usePageTitle } from "@/hooks/use-page-title";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "General",
    question: "What is Iṣéyá?",
    answer: "Iṣéyá is a job marketplace platform by Renowned Technology Limited, connecting workers with employers in Nigeria. Whether you're looking for casual gigs, part-time roles, remote work, freelance projects, or full-time positions, Iṣéyá makes the connection easy and secure."
  },
  {
    category: "General",
    question: "Is Iṣéyá free to use?",
    answer: "For job seekers, Iṣéyá is completely free — browse jobs, apply, and track your applications at no cost. Employers can post jobs on the free plan with limited slots, and can upgrade to Standard, Premium, or Enterprise plans for more job postings, interview credits, and advanced features. Pricing is set by the admin and may include promotional discounts."
  },
  {
    category: "General",
    question: "What age do I need to be to use Iṣéyá?",
    answer: "You must be at least 18 years old to create an account and use Iṣéyá. This is to ensure compliance with Nigerian labor laws and protect young workers."
  },
  {
    category: "General",
    question: "What types of jobs are available on Iṣéyá?",
    answer: "Iṣéyá covers a wide range of job types: Full-time, Part-time, Contract, Remote, and Freelance. Jobs are organized into sectors like Hospitality & Food Service, Technology & IT, Healthcare & Medicine, Construction & Labour, Domestic & Household, Marketing & Creative, Administration & Finance, and many more — all sorted alphabetically for easy browsing."
  },
  {
    category: "General",
    question: "What currency does Iṣéyá use?",
    answer: "All salaries, subscription fees, and transactions on Iṣéyá are in Nigerian Naira (₦ / NGN)."
  },
  {
    category: "Job Seekers",
    question: "How do I apply for a job?",
    answer: "Once you've created an account and completed your profile, browse available jobs and click 'Apply' on any listing. Employers will be notified of your application and can review your profile, CV, and work history."
  },
  {
    category: "Job Seekers",
    question: "How will I know if my application was accepted?",
    answer: "Track all your applications in your dashboard. When an employer reviews your application, the status updates to 'Shortlisted', 'Interview', 'Offered', or 'Rejected'. You'll also receive in-app notifications and email updates for important changes."
  },
  {
    category: "Job Seekers",
    question: "What is applicant verification?",
    answer: "Verification lets you prove your identity by uploading a government-issued ID (NIN, Voter's Card, Driver's License, or International Passport) and a selfie holding the ID. After paying the verification fee, our team reviews your documents. Verified applicants get a badge on their profile, priority listing, and are 3x more likely to get hired. Verification is valid for 30 days."
  },
  {
    category: "Job Seekers",
    question: "Can I set my preferred job types and categories?",
    answer: "Yes! In your profile settings, you can select your preferred job types (Full-time, Part-time, Contract, Remote, Freelance) and preferred job categories. We'll send you alerts when matching jobs are posted."
  },
  {
    category: "Job Seekers",
    question: "What does the Rating on my profile mean?",
    answer: "Your profile rating is based on assessments from the Iṣéyá team after completed interviews. It reflects your performance and reliability as rated by our admin team, helping employers make informed hiring decisions."
  },
  {
    category: "Job Seekers",
    question: "Can I submit a counter-offer to an employer?",
    answer: "Yes. When an employer sends you a job offer, you can accept it, decline it, or submit a counter-offer with your preferred salary. The employer can then accept or decline your counter-offer."
  },
  {
    category: "Employers",
    question: "How do I post a job?",
    answer: "After creating an employer account, click 'Post a Job' on your dashboard. Fill in the job details including title, category (from organized sectors), job type (Full-time, Part-time, Contract, Remote, or Freelance), location (state, LGA, city/town, and specific address), salary range, and requirements. Your job goes live instantly."
  },
  {
    category: "Employers",
    question: "What subscription plans are available?",
    answer: "Iṣéyá offers four tiers: Basic (Free) for getting started with limited job postings; Standard for growing businesses with more job slots and applicant management; Premium (most popular) with priority listing, verified badge, interview credits, and Facebook auto-posting; and Enterprise for large-scale recruitment with unlimited postings and dedicated support. Pricing and job limits are configured by the platform and may include discounts."
  },
  {
    category: "Employers",
    question: "How do I pay for subscriptions?",
    answer: "Subscriptions can be paid via Paystack or Flutterwave — both support cards, bank transfers, USSD, and mobile money. All payments are in Nigerian Naira (₦)."
  },
  {
    category: "Employers",
    question: "What are Iṣéyá Recommendations?",
    answer: "Available on Premium and Enterprise plans, Iṣéyá Recommendations are admin-scored applicant assessments. Our team interviews applicants and provides ratings and notes to help you make better hiring decisions."
  },
  {
    category: "Employers",
    question: "How do I pay workers?",
    answer: "Payment is arranged directly between employers and workers. Iṣéyá facilitates the connection but does not handle payments between parties. We recommend agreeing on payment terms before work begins."
  },
  {
    category: "Agents",
    question: "What is an Agent account?",
    answer: "Agents can post jobs on behalf of multiple employers. This is ideal for recruitment agencies, HR consultants, or staffing firms. Agents can manage job postings using credits or subscription-based access."
  },
  {
    category: "Account & Security",
    question: "How do I create an account?",
    answer: "You can register with your email address and password, or sign in with Google. During registration, you'll select your role (applicant, employer, or agent) and complete a short onboarding process to set up your profile."
  },
  {
    category: "Account & Security",
    question: "How do I reset my password?",
    answer: "Click 'Forgot Password' on the login page and enter your email address. You'll receive a password reset link via email. Follow the link to set a new password. The reset link expires after a limited time for security."
  },
  {
    category: "Account & Security",
    question: "Is my personal information safe?",
    answer: "Yes, we take data security seriously. Passwords are hashed with bcrypt, sessions are stored securely in PostgreSQL, and login forms are protected with CAPTCHA. We comply with the Nigeria Data Protection Regulation (NDPR). Read our Privacy Policy for full details."
  },
  {
    category: "Account & Security",
    question: "How do I delete my account?",
    answer: "To delete your account, submit a support ticket through the Contact page or from your dashboard. Our team will process your request and remove your data in accordance with our privacy policy."
  },
  {
    category: "Support",
    question: "How do I contact support?",
    answer: "You can submit a support ticket from your dashboard or use the Contact page. Our team responds to tickets with a conversation thread so you can track your issue. You can also reach us via email at support@iseya.ng."
  },
  {
    category: "Support",
    question: "Can I report a job or user?",
    answer: "Yes. If you encounter a suspicious job listing or user, you can report them directly from the platform. Our admin team reviews all reports and takes appropriate action."
  },
];

export default function FAQs() {
  usePageTitle("FAQs");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = Array.from(new Set(faqs.map(f => f.category)));
  
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-24 pb-16 px-4 md:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions about Iṣéyá
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-faqs"
            />
          </div>
        </motion.div>

        {categories.map((category, categoryIndex) => {
          const categoryFaqs = filteredFaqs.filter(f => f.category === category);
          if (categoryFaqs.length === 0) return null;

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (categoryIndex + 1) }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold mb-4 text-primary">{category}</h2>
              <div className="space-y-3">
                {categoryFaqs.map((faq, index) => {
                  const globalIndex = faqs.indexOf(faq);
                  const isOpen = openIndex === globalIndex;

                  return (
                    <Card 
                      key={index} 
                      className={`cursor-pointer transition-all ${isOpen ? 'border-primary/50 shadow-lg' : 'hover-elevate'}`}
                      onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                      data-testid={`faq-item-${globalIndex}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="font-medium">{faq.question}</h3>
                          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </div>
                        {isOpen && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 text-muted-foreground text-sm"
                          >
                            {faq.answer}
                          </motion.p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          );
        })}

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No FAQs found matching your search.</p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-display font-bold mb-4">Still have questions?</h2>
              <p className="text-muted-foreground mb-6">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <Link href="/contact">
                <Button size="lg" data-testid="button-contact-support">
                  Contact Support
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
