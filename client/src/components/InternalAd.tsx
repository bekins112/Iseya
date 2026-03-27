import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { InternalAd } from "@shared/schema";

function isDismissed(adId: number): boolean {
  return sessionStorage.getItem(`iseya_ad_dismissed_${adId}`) === "true";
}

function dismissAd(adId: number): void {
  sessionStorage.setItem(`iseya_ad_dismissed_${adId}`, "true");
}

export function AdBanner({ ad }: { ad: InternalAd }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isDismissed(ad.id)) {
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, [ad.id]);

  const handleDismiss = () => {
    setVisible(false);
    dismissAd(ad.id);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
          data-testid={`ad-banner-${ad.id}`}
        >
          <div
            className="relative rounded-xl mb-4 overflow-hidden"
            style={{
              backgroundColor: ad.bgColor || "hsl(var(--primary))",
              color: ad.textColor || "hsl(var(--primary-foreground))",
            }}
          >
            {ad.imageUrl && (
              <img
                src={ad.imageUrl}
                alt={ad.title || ""}
                className="w-full object-contain"
                data-testid={`ad-banner-img-${ad.id}`}
              />
            )}
            {(ad.title || ad.content || ad.linkUrl) && (
              <div className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {ad.title && <p className="text-sm font-semibold" data-testid={`ad-banner-title-${ad.id}`}>{ad.title}</p>}
                  {ad.content && <p className="text-sm opacity-90" data-testid={`ad-banner-content-${ad.id}`}>{ad.content}</p>}
                </div>
                {ad.linkUrl && (
                  <a
                    href={ad.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors shrink-0"
                    data-testid={`ad-banner-link-${ad.id}`}
                  >
                    {ad.linkText || "Learn More"}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
              aria-label="Dismiss"
              data-testid={`ad-banner-dismiss-${ad.id}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AdPopup({ ad }: { ad: InternalAd }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isDismissed(ad.id)) {
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [ad.id]);

  const handleClose = () => {
    setOpen(false);
    dismissAd(ad.id);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); }}>
      <DialogContent
        className="max-w-sm rounded-2xl p-0 overflow-hidden"
        data-testid={`ad-popup-${ad.id}`}
      >
        {ad.imageUrl && (
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-full max-h-48 object-cover"
            data-testid={`ad-popup-img-${ad.id}`}
          />
        )}
        <div
          className="p-6"
          style={{
            backgroundColor: ad.bgColor || undefined,
            color: ad.textColor || undefined,
          }}
        >
          <h3 className="text-lg font-bold mb-2" data-testid={`ad-popup-title-${ad.id}`}>{ad.title}</h3>
          <p className="text-sm leading-relaxed mb-4" data-testid={`ad-popup-content-${ad.id}`}>{ad.content}</p>
          <div className="flex items-center gap-3">
            {ad.linkUrl && (
              <a
                href={ad.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`ad-popup-link-${ad.id}`}
              >
                <Button size="sm" className="gap-1">
                  {ad.linkText || "Learn More"}
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleClose}
              data-testid={`ad-popup-close-${ad.id}`}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
