import { useAuth } from "@/hooks/use-auth";
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
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isEmployer = user?.role === "employer";
  const isAdmin = user?.role === "admin";

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ...(isAdmin ? [
      { href: "/admin/dashboard", label: "Admin Panel", icon: Shield },
      { href: "/admin/users", label: "Manage Users", icon: Users },
      { href: "/admin/jobs", label: "Manage Jobs", icon: Briefcase },
      { href: "/admin/sub-admins", label: "Sub-Admins", icon: Settings },
    ] : isEmployer ? [
      { href: "/manage-jobs", label: "Manage Jobs", icon: ClipboardList },
      { href: "/post-job", label: "Post a Job", icon: PlusCircle },
      { href: "/subscription", label: "Subscription", icon: Crown },
    ] : [
      { href: "/jobs", label: "Find Jobs", icon: Briefcase },
      { href: "/my-applications", label: "Applications", icon: FolderOpen },
    ]),
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-50 md:hidden flex items-center justify-around h-16 px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <button className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all",
                isActive ? "text-primary scale-110" : "text-muted-foreground"
              )}>
                <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{link.label.split(' ')[0]}</span>
              </button>
            </Link>
          );
        })}
      </nav>

      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r bg-background hidden md:flex flex-col z-30">
      <div className="h-16 flex items-center px-6 border-b">
         <img src={iseyaLogo} alt="Iṣéyá" className="h-6 w-auto" />
      </div>

      <nav className="flex-1 p-4 space-y-1">
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
                {link.label}
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
