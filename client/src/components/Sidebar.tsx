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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";
import type { AdminPermissions } from "@shared/schema";

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

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
    { href: "/admin/transactions", label: "Transactions", icon: DollarSign, perm: "canManageTransactions" },
    { href: "/admin/tickets", label: "Support Tickets", icon: Ticket, perm: "canManageTickets" },
    { href: "/admin/reports", label: "Reports", icon: Flag, perm: "canManageReports" },
    { href: "/admin/sub-admins", label: "Sub-Admins", icon: Settings, perm: "canManageAdmins" },
    { href: "/admin/verifications", label: "Verifications", icon: ShieldCheck, perm: "canManageVerifications" },
    { href: "/admin/notifications", label: "Notifications", icon: Bell, perm: "canManageNotifications" },
    { href: "/admin/ads", label: "Ads & Popups", icon: Megaphone, perm: "canManageAds" },
    { href: "/admin/agent-credits", label: "Agent Credits", icon: Coins, perm: "canManageAgentCredits" },
    { href: "/admin/settings", label: "Platform Settings", icon: SlidersHorizontal, perm: "canManageSettings" },
  ];

  const filteredAdminLinks = adminLinks.filter(link => !link.perm || hasPerm(link.perm));

  const links: { href: string; label: string; icon: any; subtitle?: string }[] = [
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

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-50 md:hidden h-16 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center h-full px-2 overflow-x-auto scrollbar-hide gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <button className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-all min-w-[56px] px-1",
                  isActive ? "text-primary scale-110" : "text-muted-foreground"
                )} data-testid={`mobile-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                  <span className="text-[9px] font-bold uppercase tracking-tighter whitespace-nowrap">{link.label.split(' ')[0]}</span>
                </button>
              </Link>
            );
          })}
          <button
            className="flex flex-col items-center justify-center gap-1 transition-all text-red-500 min-w-[56px] px-1"
            onClick={() => logout()}
            data-testid="mobile-nav-logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Logout</span>
          </button>
        </div>
      </nav>

      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r bg-background hidden md:flex flex-col z-30">
      <div className="h-16 flex items-center justify-between px-6 border-b">
         <img src={iseyaLogo} alt="Iṣéyá" className="h-6 w-auto" />
         <NotificationBell />
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
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
