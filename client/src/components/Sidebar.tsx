import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { cn } from "@/components/ui-extension";
import { 
  Briefcase, 
  LayoutDashboard, 
  PlusCircle, 
  User, 
  LogOut,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isEmployer = user?.role === "employer";

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ...(isEmployer ? [
      { href: "/post-job", label: "Post a Job", icon: PlusCircle },
      { href: "/my-jobs", label: "My Jobs", icon: Briefcase },
    ] : [
      { href: "/jobs", label: "Find Jobs", icon: Briefcase },
      { href: "/my-applications", label: "Applications", icon: FolderOpen },
    ]),
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 border-r bg-background hidden md:flex flex-col z-30">
      <div className="h-16 flex items-center px-6 border-b">
         <div className="bg-primary rounded-lg p-1.5 mr-2">
            <Briefcase className="w-5 h-5 text-white" />
         </div>
         <span className="font-display font-bold text-xl">CasualWorker</span>
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
  );
}
