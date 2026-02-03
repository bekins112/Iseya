import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-extension";
import { Users, Briefcase, FileText, Building2, UserCheck, Crown, TrendingUp, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Badge } from "@/components/ui/badge";

interface Stats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  totalEmployers: number;
  totalApplicants: number;
  premiumEmployers: number;
  activeJobs: number;
  pendingApplications: number;
}

interface DetailedStats {
  usersByRole: { role: string; count: number }[];
  jobsByCategory: { category: string; count: number }[];
  applicationsByStatus: { status: string; count: number }[];
  subscriptionStats: { status: string; count: number }[];
  recentActivity: { date: string; users: number; jobs: number; applications: number }[];
}

export default function AdminStatistics() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: detailedStats, isLoading: detailedLoading } = useQuery<DetailedStats>({
    queryKey: ["/api/admin/stats/detailed"],
  });

  if (user?.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  const statCards = [
    { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900" },
    { title: "Employers", value: stats?.totalEmployers || 0, icon: Building2, color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900" },
    { title: "Applicants", value: stats?.totalApplicants || 0, icon: UserCheck, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900" },
    { title: "Job Postings", value: stats?.totalJobs || 0, icon: Briefcase, color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900" },
    { title: "Active Jobs", value: stats?.activeJobs || 0, icon: TrendingUp, color: "text-teal-600", bgColor: "bg-teal-100 dark:bg-teal-900" },
    { title: "Applications", value: stats?.totalApplications || 0, icon: FileText, color: "text-rose-600", bgColor: "bg-rose-100 dark:bg-rose-900" },
    { title: "Pending Apps", value: stats?.pendingApplications || 0, icon: CheckCircle, color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900" },
    { title: "Premium Users", value: stats?.premiumEmployers || 0, icon: Crown, color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-900" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "reviewed": case "accepted": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "interviewing": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-amber-500", "bg-purple-500",
      "bg-rose-500", "bg-teal-500", "bg-orange-500", "bg-indigo-500"
    ];
    return colors[index % colors.length];
  };

  const isLoading = statsLoading || detailedLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Statistics"
        description="Comprehensive analytics and insights"
      />

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-20 mb-2" />
                <div className="h-8 bg-muted rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <Card key={stat.title} data-testid={`stat-${stat.title.toLowerCase().replace(/\s/g, '-')}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Users by Role
                </CardTitle>
              </CardHeader>
              <CardContent>
                {detailedStats?.usersByRole && detailedStats.usersByRole.length > 0 ? (
                  <div className="space-y-3">
                    {detailedStats.usersByRole.map((item) => {
                      const total = detailedStats.usersByRole.reduce((acc, r) => acc + r.count, 0);
                      const percentage = total > 0 ? (item.count / total) * 100 : 0;
                      return (
                        <div key={item.role} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize font-medium">{item.role}</span>
                            <span className="text-muted-foreground">{item.count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No user data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Jobs by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                {detailedStats?.jobsByCategory && detailedStats.jobsByCategory.length > 0 ? (
                  <div className="space-y-3">
                    {detailedStats.jobsByCategory.slice(0, 8).map((item, index) => {
                      const total = detailedStats.jobsByCategory.reduce((acc, j) => acc + j.count, 0);
                      const percentage = total > 0 ? (item.count / total) * 100 : 0;
                      return (
                        <div key={item.category} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize font-medium">{item.category}</span>
                            <span className="text-muted-foreground">{item.count}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${getCategoryColor(index)}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No job data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Applications by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {detailedStats?.applicationsByStatus && detailedStats.applicationsByStatus.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {detailedStats.applicationsByStatus.map((item) => (
                      <Badge key={item.status} className={`${getStatusColor(item.status)} text-sm py-1 px-3`}>
                        <span className="capitalize">{item.status}</span>
                        <span className="ml-2 font-bold">{item.count}</span>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No application data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Subscription Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {detailedStats?.subscriptionStats && detailedStats.subscriptionStats.length > 0 ? (
                  <div className="space-y-3">
                    {detailedStats.subscriptionStats.map((item) => {
                      const total = detailedStats.subscriptionStats.reduce((acc, s) => acc + s.count, 0);
                      const percentage = total > 0 ? (item.count / total) * 100 : 0;
                      const isPremium = item.status === "premium";
                      return (
                        <div key={item.status} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize font-medium flex items-center gap-1">
                              {isPremium && <Crown className="w-3 h-3 text-amber-500" />}
                              {item.status}
                            </span>
                            <span className="text-muted-foreground">{item.count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${isPremium ? 'bg-amber-500' : 'bg-muted-foreground'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No subscription data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
