"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Home, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  MessageSquare,
  Clock,
  CheckCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  trend?: number;
  loading?: boolean;
}

const StatsCard = ({ title, value, icon, description, trend, loading }: StatsCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-3xl font-bold text-foreground">{value}</p>
            )}
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
              {trend !== undefined && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  trend > 0 
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }`}>
                  {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
                </span>
              )}
            </div>
          </div>
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface DashboardStatsProps {
  stats?: {
    totalListings: number;
    activeListings: number;
    totalLeads: number;
    totalCommissions: number;
    listingViews: number;
    leadResponseTime: number;
    dealConversion: number;
    aiPipelineProgress: number;
  };
  loading?: boolean;
}

export default function DashboardStats({ stats, loading = false }: DashboardStatsProps) {
  const defaultStats = {
    totalListings: 4,
    activeListings: 3,
    totalLeads: 12,
    totalCommissions: 125000,
    listingViews: 2450,
    leadResponseTime: 2.5,
    dealConversion: 75,
    aiPipelineProgress: 75
  };

  const data = stats || defaultStats;

  const statCards = [
    {
      title: "Celkem inzerátů",
      value: data.totalListings,
      icon: <Home className="h-6 w-6" />,
      description: "Všechny vaše inzeráty",
      trend: 12
    },
    {
      title: "Aktivní zájemci",
      value: data.totalLeads,
      icon: <Users className="h-6 w-6" />,
      description: "Aktivní v CRM",
      trend: 8
    },
    {
      title: "Očekávané komise",
      value: `${data.totalCommissions.toLocaleString()} Kč`,
      icon: <DollarSign className="h-6 w-6" />,
      description: "V jednání",
      trend: 15
    },
    {
      title: "Zobrazení inzerátů",
      value: data.listingViews.toLocaleString(),
      icon: <Eye className="h-6 w-6" />,
      description: "Celkem zobrazení",
      trend: 23
    },
    {
      title: "Průměrná reakce",
      value: `${data.leadResponseTime}h`,
      icon: <Clock className="h-6 w-6" />,
      description: "Čas na odpověď",
      trend: -5
    },
    {
      title: "Konverze dealů",
      value: `${data.dealConversion}%`,
      icon: <TrendingUp className="h-6 w-6" />,
      description: "Úspěšnost",
      trend: 3
    },
    {
      title: "AI Pipeline",
      value: `${data.aiPipelineProgress}%`,
      icon: <CheckCircle className="h-6 w-6" />,
      description: "Dokončeno",
      trend: 10
    },
    {
      title: "Chat odpovědi",
      value: "98%",
      icon: <MessageSquare className="h-6 w-6" />,
      description: "Úspěšnost",
      trend: 2
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          description={stat.description}
          trend={stat.trend}
          loading={loading}
        />
      ))}
    </div>
  );
}