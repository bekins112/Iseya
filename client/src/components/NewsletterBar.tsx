import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const STORAGE_KEY = "iseya_newsletter_dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function isDismissed(): boolean {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  const timestamp = Number(raw);
  if (isNaN(timestamp)) return false;
  return Date.now() - timestamp < DISMISS_DURATION_MS;
}

export default function NewsletterBar() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isDismissed()) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setVisible(false);
  }

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await apiRequest("POST", "/api/newsletter/subscribe", { email: email.trim() });
      setSubscribed(true);
      toast({ title: "Subscribed!", description: "You've been added to our newsletter." });
      setTimeout(dismiss, 3000);
    } catch {
      toast({ title: "Error", description: "Failed to subscribe. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-testid="newsletter-bar"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 right-4 z-50 w-80 rounded-md border bg-card p-4 shadow-lg"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium" data-testid="text-newsletter-title">
                {subscribed ? "Thank you!" : "Stay Updated"}
              </span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={dismiss}
              data-testid="button-newsletter-dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {subscribed ? (
            <p className="text-sm text-muted-foreground" data-testid="text-newsletter-success">
              You've been subscribed to our newsletter.
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-3">
                Get the latest job updates delivered to your inbox.
              </p>
              <form onSubmit={handleSubscribe} className="flex items-center gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-newsletter-email"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading}
                  data-testid="button-newsletter-subscribe"
                >
                  {loading ? "..." : "Subscribe"}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
