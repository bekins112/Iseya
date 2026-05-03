import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Cookie, Shield } from "lucide-react";

const STORAGE_KEY = "iseya_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = (type: "all" | "essential") => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ type, date: new Date().toISOString() }));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-testid="banner-cookie-consent"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4"
        >
          <div className="max-w-4xl mx-auto rounded-md border bg-card text-card-foreground p-4 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="w-5 h-5 mt-0.5 shrink-0 text-muted-foreground" />
                <p className="text-sm text-muted-foreground" data-testid="text-cookie-message">
                  We use cookies to enhance your experience on Iṣéyá. By continuing, you agree to our{" "}
                  <Link href="/cookies" className="underline text-foreground font-medium" data-testid="link-cookie-policy">
                    Cookie Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline text-foreground font-medium" data-testid="link-privacy-policy">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAccept("essential")}
                  data-testid="button-essential-only"
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Essential Only
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAccept("all")}
                  data-testid="button-accept-all"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
