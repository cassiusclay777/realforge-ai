"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Home,
  Users,
  TrendingUp,
  DollarSign,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
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
  const trendClasses = trend === undefined
    ? ""
    : trend > 0
      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200"
      : "bg-rose-100 text-rose-900 dark:bg-rose-900 dark:text-rose-200";

  return (
    <Card className="overflow-hidden border border-border/70 bg-card/95 shadow-sm transition-shadow duration-200 hover:shadow-lg">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
              {title}
            </p>
            {loading ? (
              <Skeleton className="h-10 w-28" />
            ) : (
              <p className="text-3xl font-semibold tracking-tight text-foreground">
                {value ?? "—"}
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-sm shadow-primary/10">
            {icon}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
          {trend !== undefined && (
            <span className={`text-xs font-semibold uppercase tracking-[0.18em] rounded-full px-3 py-1 ${trendClasses}`}>
              {trend > 0 ? "+" : ""}{trend}%
            </span>
          )}
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