"use client";

import { useEffect, useState } from "react";
import { Users, Dumbbell, Flag, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardApi, type DashboardStats } from "@/lib/api";

const STAT_CARDS = [
  {
    key: "totalUsers" as keyof DashboardStats,
    title: "전체 유저",
    icon: Users,
    description: "가입된 전체 유저 수",
  },
  {
    key: "totalOfficialExercises" as keyof DashboardStats,
    title: "공식 운동 종목",
    icon: Dumbbell,
    description: "등록된 공식 종목 수",
  },
  {
    key: "pendingReports" as keyof DashboardStats,
    title: "미처리 신고",
    icon: Flag,
    description: "처리 전 신고 건수",
    highlight: true,
  },
  {
    key: "sessionsThisMonth" as keyof DashboardStats,
    title: "이번 달 운동 세션",
    icon: Activity,
    description: "이번 달 완료된 세션 수",
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">대시보드</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ProLog 서비스 현황을 한눈에 확인하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          const value = stats ? stats[card.key] : null;
          const isPendingAlert = card.highlight && value !== null && value > 0;

          return (
            <Card key={card.key} className={isPendingAlert ? "border-destructive/50" : ""}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${isPendingAlert ? "text-destructive" : "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${isPendingAlert ? "text-destructive" : "text-foreground"}`}>
                  {loading ? "-" : value?.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
