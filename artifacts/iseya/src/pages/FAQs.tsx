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
import { usePageContent } from "@/lib/page-content/use-page-content";
import { faqsDefaults } from "@/lib/page-content/faqs";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQs() {
  usePageTitle("FAQs");
  const c = usePageContent("page_faqs", faqsDefaults);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = c.faqs.items as FAQItem[];

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
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{c.hero.title}</h1>
          <p className="text-xl text-muted-foreground">
            {c.hero.subtitle}
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
              placeholder={c.search.placeholder}
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
            <p className="text-muted-foreground">{c.empty.message}</p>
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
              <h2 className="text-2xl font-display font-bold mb-4">{c.contact.heading}</h2>
              <p className="text-muted-foreground mb-6">
                {c.contact.body}
              </p>
              <Link href="/contact">
                <Button size="lg" data-testid="button-contact-support">
                  {c.contact.button}
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
