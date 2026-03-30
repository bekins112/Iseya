import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { cn } from "@/components/ui-extension";
import { 
  Briefcase, 
  LayoutDashboard, 
  PlusCircle, 
  User, 
  LogOut,
  FolderOpen,
  ClipboardList,
  Crown,
  Shield,
  Users,
  Settings,
  BarChart3,
  Ticket,
  Flag,
  ShieldCheck,
  Calendar,
  SlidersHorizontal,
  DollarSign,
  Bell,
  HelpCircle,
  Megaphone,
  Coins,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";
import type { AdminPermissions } from "@shared/schema";

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const isEmployer = user?.role === "employer";
  const isAgent = user?.role === "agent";
  const isAdmin = user?.role === "admin";

  const { data: adminPerms } = useQuery<AdminPermissions>({
    queryKey: ["/api/admin/my-permissions"],
    enabled: isAdmin,
  });

  const hasPerm = (key: keyof AdminPermissions) => {
    if (!adminPerms) return true;
    return adminPerms[key] !== false;
  };

  const verificationExpiry = (user as any)?.verificationExpiry;
  const verificationSubtitle = user?.isVerified && verificationExpiry
    ? `Renews ${new Date(verificationExpiry).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}`
    : undefined;

  const adminLinks: { href: string; label: string; icon: any; perm?: keyof AdminPermissions }[] = [
    { href: "/admin/dashboard", label: "Admin Panel", icon: Shield },
    { href: "/admin/statistics", label: "Statistics", icon: BarChart3, perm: "canViewStats" },
    { href: "/admin/users", label: "Manage Users", icon: Users, perm: "canManageUsers" },
    { href: "/admin/jobs", label: "Manage Jobs", icon: Briefcase, perm: "canManageJobs" },
    { href: "/admin/subscriptions", label: "Subscriptions", icon: Crown, perm: "canManageSubscriptions" },
    { href: "/admin/agent-credits", label: "Agent Credits", icon: Coins, perm: "canManageAgentCredits" },
    { href: "/admin/verifications", label: "Verifications", icon: ShieldCheck, perm: "canManageVerifications" },
    { href: "/admin/transactions", label: "Transactions", icon: DollarSign, perm: "canManageTransactions" },
    { href: "/admin/tickets", label: "Support Tickets", icon: Ticket, perm: "canManageTickets" },
    { href: "/admin/notifications", label: "Notifications", icon: Bell, perm: "canManageNotifications" },
    { href: "/admin/ads", label: "Ads & Popups", icon: Megaphone, perm: "canManageAds" },
    { href: "/admin/sub-admins", label: "Sub-Admins", icon: Settings, perm: "canManageAdmins" },
    { href: "/admin/settings", label: "Platform Settings", icon: SlidersHorizontal, perm: "canManageSettings" },
  ];

  const filteredAdminLinks = adminLinks.filter(link => !link.perm || hasPerm(link.perm));

  const allLinks: { href: string; label: string; icon: any; subtitle?: string }[] = [
    ...(!isAdmin ? [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] : []),
    ...(isAdmin ? filteredAdminLinks : (isEmployer || isAgent) ? [
      { href: "/manage-jobs", label: "Manage Jobs", icon: ClipboardList },
      { href: "/post-job", label: "Post a Job", icon: PlusCircle },
      { href: "/subscription", label: "Subscription", icon: Crown },
    ] : [
      { href: "/jobs", label: "Find Jobs", icon: Briefcase },
      { href: "/my-applications", label: "Applications", icon: FolderOpen },
      { href: "/verification", label: user?.isVerified ? "Verified" : "Get Verified", icon: ShieldCheck, subtitle: verificationSubtitle },
    ]),
    ...(!isAdmin ? [{ href: "/support", label: "Support", icon: HelpCircle }] : []),
    { href: "/profile", label: "Profile", icon: User },
  ];

  const getMobileNav = () => {
    if (isAdmin) {
      return {
        primary: [
          { href: "/admin/dashboard", label: "Panel", icon: Shield },
          { href: "/admin/users", label: "Users", icon: Users },
          { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
        ],
        overflow: filteredAdminLinks.filter(l => 
          !["/admin/dashboard", "/admin/users", "/admin/jobs"].includes(l.href)
        ).concat([{ href: "/profile", label: "Profile", icon: User }]),
      };
    }
    if (isEmployer || isAgent) {
      return {
        primary: [
          { href: "/dashboard", label: "Home", icon: LayoutDashboard },
          { href: "/manage-jobs", label: "Jobs", icon: ClipboardList },
          { href: "/post-job", label: "Post", icon: PlusCircle },
        ],
        overflow: [
          { href: "/subscription", label: "Subscription", icon: Crown },
          { href: "/support", label: "Support", icon: HelpCircle },
          { href: "/profile", label: "Profile", icon: User },
        ],
      };
    }
    return {
      primary: [
        { href: "/dashboard", label: "Home", icon: LayoutDashboard },
        { href: "/jobs", label: "Jobs", icon: Briefcase },
        { href: "/my-applications", label: "Applied", icon: FolderOpen },
      ],
      overflow: [
        { href: "/verification", label: user?.isVerified ? "Verified" : "Get Verified", icon: ShieldCheck },
        { href: "/support", label: "Support", icon: HelpCircle },
        { href: "/profile", label: "Profile", icon: User },
      ],
    };
  };

  const { primary: mobilePrimary, overflow: mobileOverflow } = getMobileNav();
  const isOverflowActive = mobileOverflow.some(l => location === l.href);

  return (
    <>
      {/* Mobile Top Header */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-background/95 backdrop-blur-lg border-b z-50 md:hidden flex items-center justify-between px-4">
        <img src={iseyaLogo} alt="Iseya" className="h-5 w-auto" />
        <NotificationBell />
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t z-50 md:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around h-16 px-2">
          {mobilePrimary.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <button
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 transition-all w-16",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                  data-testid={`mobile-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                  <span className="text-[10px] font-semibold">{link.label}</span>
                </button>
              </Link>
            );
          })}

          <button
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 transition-all w-16",
              (moreOpen || isOverflowActive) ? "text-primary" : "text-muted-foreground"
            )}
            onClick={() => setMoreOpen(!moreOpen)}
            data-testid="mobile-nav-more"
          >
            {moreOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span className="text-[10px] font-semibold">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile "More" Menu Overlay */}
      {moreOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setMoreOpen(false)}
          />
          <div className="fixed bottom-16 left-0 right-0 z-40 md:hidden p-3">
            <div className="bg-card border rounded-2xl shadow-2xl p-3 space-y-1 max-w-sm mx-auto">
              {mobileOverflow.map((link) => {
                const Icon = link.icon;
                const isActive = location === link.href;
                return (
                  <Link key={link.href} href={link.href}>
                    <button
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                        isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                      )}
                      onClick={() => setMoreOpen(false)}
                      data-testid={`mobile-more-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </button>
                  </Link>
                );
              })}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                onClick={() => { logout(); setMoreOpen(false); }}
                data-testid="mobile-more-logout"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r bg-background hidden md:flex flex-col z-30">
      <div className="h-16 flex items-center justify-between px-6 border-b">
         <img src={iseyaLogo} alt="Iseya" className="h-6 w-auto" />
         <NotificationBell />
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {allLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <button className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <Icon className="w-5 h-5" />
                <div className="flex flex-col items-start">
                  <span>{link.label}</span>
                  {link.subtitle && (
                    <span className="text-[10px] font-normal text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {link.subtitle}
                    </span>
                  )}
                </div>
              </button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
            {user?.firstName?.[0] || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>
    </aside>
    </>
  );
}
