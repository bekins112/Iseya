import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { SiInstagram, SiLinkedin, SiX, SiFacebook, SiTiktok, SiWhatsapp } from "react-icons/si";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";

export default function Footer() {
  const { isAuthenticated } = useAuth();
  const { data: appSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings/public"],
  });

  return (
    <footer className="py-12 border-t bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src={iseyaLogo} alt="Iseya" className="h-8 w-auto" />
            </div>
            <p className="text-muted-foreground text-sm max-w-md" data-testid="text-footer-about">
              {appSettings?.footer_about_description || "Connecting Nigerian workers with opportunities. Find casual jobs or hire reliable workers through our trusted platform."}
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/browse-jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Browse Jobs</Link></li>
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link href="/faqs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQs</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Discover</h4>
            <ul className="space-y-2">
              <li><Link href="/for-employers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">For Employers</Link></li>
              <li><Link href="/for-applicants" className="text-sm text-muted-foreground hover:text-foreground transition-colors">For Job Seekers</Link></li>
              <li><Link href="/for-agents" className="text-sm text-muted-foreground hover:text-foreground transition-colors">For Agents</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Get Started</h4>
            <ul className="space-y-2">
              {isAuthenticated ? (
                <>
                  <li><Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link></li>
                  <li><Link href="/browse-jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Find Work</Link></li>
                </>
              ) : (
                <>
                  <li><Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Create Account</Link></li>
                  <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link></li>
                  <li><Link href="/browse-jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Find Work</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2026 Iṣéyá by RenownedTech. All rights reserved.</p>
            <div className="flex items-center gap-3" data-testid="social-links-footer">
              {(appSettings?.app_instagram || "https://instagram.com/iseyaofficial") && (
                <a href={appSettings?.app_instagram || "https://instagram.com/iseyaofficial"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Instagram">
                  <SiInstagram className="w-4 h-4" />
                </a>
              )}
              {(appSettings?.app_linkedin || "https://linkedin.com/company/iseyaofficial") && (
                <a href={appSettings?.app_linkedin || "https://linkedin.com/company/iseyaofficial"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="LinkedIn">
                  <SiLinkedin className="w-4 h-4" />
                </a>
              )}
              {(appSettings?.app_twitter || "https://x.com/iseyaofficial") && (
                <a href={appSettings?.app_twitter || "https://x.com/iseyaofficial"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="X (Twitter)">
                  <SiX className="w-4 h-4" />
                </a>
              )}
              {(appSettings?.app_facebook || "https://facebook.com/iseyaofficial") && (
                <a href={appSettings?.app_facebook || "https://facebook.com/iseyaofficial"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Facebook">
                  <SiFacebook className="w-4 h-4" />
                </a>
              )}
              {appSettings?.app_tiktok && (
                <a href={appSettings.app_tiktok} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="TikTok">
                  <SiTiktok className="w-4 h-4" />
                </a>
              )}
              {(appSettings?.app_whatsapp || "https://whatsapp.com/channel/0029VbBPaUfBVJl4r39xRu1y") && (
                <a href={appSettings?.app_whatsapp || "https://whatsapp.com/channel/0029VbBPaUfBVJl4r39xRu1y"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="WhatsApp Channel" data-testid="link-footer-whatsapp">
                  <SiWhatsapp className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-terms">Terms of Use</Link>
            <Link href="/disclaimer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Disclaimer</Link>
            <Link href="/copyright" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Copyright</Link>
            <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
