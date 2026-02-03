import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-extension";
import {
  Users,
  Briefcase,
  FileText,
  Building2,
  UserCheck,
  Shield,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

interface Stats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  totalEmployers: number;
  totalApplicants: number;
}

interface AdminPermissions {
  canManageUsers: boolean;
  canManageJobs: boolean;
  canManageApplications: boolean;
  canManageAdmins: boolean;
  canViewStats: boolean;
}

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: permissions } = useQuery<AdminPermissions>({
    queryKey: ["/api/admin/my-permissions"],
  });

  if (user?.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Employers",
      value: stats?.totalEmployers || 0,
      icon: Building2,
      color: "text-purple-600",
    },
    {
      title: "Applicants",
      value: stats?.totalApplicants || 0,
      icon: UserCheck,
      color: "text-green-600",
    },
    {
      title: "Job Postings",
      value: stats?.totalJobs || 0,
      icon: Briefcase,
      color: "text-amber-600",
    },
    {
      title: "Applications",
      value: stats?.totalApplications || 0,
      icon: FileText,
      color: "text-rose-600",
    },
  ];

  const adminLinks = [
    {
      href: "/admin/users",
      label: "Manage Users",
      description: "View and manage all platform users",
      icon: Users,
      permission: permissions?.canManageUsers,
    },
    {
      href: "/admin/jobs",
      label: "Manage Jobs",
      description: "Oversee all job postings",
      icon: Briefcase,
      permission: permissions?.canManageJobs,
    },
    {
      href: "/admin/sub-admins",
      label: "Sub-Admin Management",
      description: "Create and manage sub-admin accounts",
      icon: Shield,
      permission: permissions?.canManageAdmins,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview and administration"
      />

      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-20 mb-2" />
                <div className="h-8 bg-muted rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statCards.map((stat) => (
            <Card
              key={stat.title}
              data-testid={`stat-card-${stat.title.toLowerCase().replace(/\s/g, "-")}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-sm text-muted-foreground">
                    {stat.title}
                  </span>
                </div>
                <p className="text-2xl font-bold">
                  {stat.value.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {adminLinks.map(
          (link) =>
            link.permission !== false && (
              <Link key={link.href} href={link.href}>
                <Card
                  className="hover-elevate cursor-pointer h-full"
                  data-testid={`link-${link.href.split("/").pop()}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <link.icon className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">{link.label}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ),
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {permissions?.canManageUsers && (
            <Link href="/admin/users">
              <Button variant="outline" data-testid="button-view-users">
                <Users className="w-4 h-4 mr-2" />
                View All Users
              </Button>
            </Link>
          )}
          {permissions?.canManageJobs && (
            <Link href="/admin/jobs">
              <Button variant="outline" data-testid="button-view-jobs">
                <Briefcase className="w-4 h-4 mr-2" />
                View All Jobs
              </Button>
            </Link>
          )}
          {permissions?.canManageAdmins && (
            <Link href="/admin/sub-admins">
              <Button variant="outline" data-testid="button-manage-admins">
                <Shield className="w-4 h-4 mr-2" />
                Manage Admins
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
