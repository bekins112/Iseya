import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronDown, HelpCircle, Search } from "lucide-react";
import { SiInstagram, SiLinkedin, SiX, SiFacebook } from "react-icons/si";
import { useState } from "react";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";
import { Input } from "@/components/ui/input";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "General",
    question: "What is Iṣéyá?",
    answer: "Iṣéyá is a job marketplace platform connecting casual workers with employers in Nigeria. Whether you're looking for part-time work, daily jobs, or seeking reliable workers for your business, Iṣéyá makes the connection easy and secure."
  },
  {
    category: "General",
    question: "Is Iṣéyá free to use?",
    answer: "For job seekers, Iṣéyá is completely free to use. You can browse jobs, apply, and track your applications at no cost. Employers can post up to 3 jobs for free on our basic plan, with premium plans available for unlimited job postings."
  },
  {
    category: "General",
    question: "What age do I need to be to use Iṣéyá?",
    answer: "You must be at least 16 years old to create an account and use Iṣéyá. This is to ensure compliance with labor laws and protect young workers."
  },
  {
    category: "Job Seekers",
    question: "How do I apply for a job?",
    answer: "Once you've created an account and completed your profile, you can browse available jobs and click the 'Apply' button on any job that interests you. Employers will be notified of your application and can review your profile."
  },
  {
    category: "Job Seekers",
    question: "How will I know if my application was accepted?",
    answer: "You can track all your applications in your dashboard. When an employer reviews your application, you'll see the status update to 'Under Review', 'Accepted', or 'Rejected'. You may also receive notifications for important updates."
  },
  {
    category: "Job Seekers",
    question: "What types of jobs are available on Iṣéyá?",
    answer: "Iṣéyá focuses on casual and part-time work including domestic help, event staffing, delivery services, manual labor, hospitality, retail, and more. Jobs range from one-day gigs to ongoing part-time positions."
  },
  {
    category: "Employers",
    question: "How do I post a job?",
    answer: "After creating an employer account, click 'Post a Job' on your dashboard. Fill in the job details including title, description, location, pay rate, and requirements. Your job will be visible to job seekers once submitted."
  },
  {
    category: "Employers",
    question: "What's included in the premium subscription?",
    answer: "Premium subscribers get unlimited job postings, priority listing in search results, a verified badge for credibility, and access to advanced applicant filtering. The premium plan costs ₦5,000 per month."
  },
  {
    category: "Employers",
    question: "How do I pay workers?",
    answer: "Payment is arranged directly between employers and workers. Iṣéyá facilitates the connection but does not handle payments between parties. We recommend agreeing on payment terms before work begins."
  },
  {
    category: "Account & Security",
    question: "How do I reset my password?",
    answer: "Since Iṣéyá uses secure login through Replit Auth, password management is handled through your authentication provider (Google, GitHub, etc.). Visit your provider's settings to manage your password."
  },
  {
    category: "Account & Security",
    question: "Is my personal information safe?",
    answer: "Yes, we take data security seriously. Your personal information is encrypted and stored securely. We never share your data with third parties without your consent. Read our Privacy Policy for more details."
  },
  {
    category: "Account & Security",
    question: "How do I delete my account?",
    answer: "To delete your account, please contact our support team through the Contact page. We'll process your request and remove your data in accordance with our privacy policy."
  }
];

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = Array.from(new Set(faqs.map(f => f.category)));
  
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Link href="/faqs" className="text-sm font-medium text-primary">
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

      <footer className="border-t py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={iseyaLogo} alt="Iṣéyá" className="h-6 w-auto" />
              <span className="text-sm text-muted-foreground">© 2026 Iṣéyá. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-2">
              <a href="https://instagram.com/iseya_ng" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Instagram"><SiInstagram className="w-3.5 h-3.5" /></a>
              <a href="https://linkedin.com/company/iseya" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="LinkedIn"><SiLinkedin className="w-3.5 h-3.5" /></a>
              <a href="https://x.com/iseya_ng" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="X (Twitter)"><SiX className="w-3.5 h-3.5" /></a>
              <a href="https://facebook.com/iseyang" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Facebook"><SiFacebook className="w-3.5 h-3.5" /></a>
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
          </div>
        </div>
      </footer>
    </div>
  );
}
