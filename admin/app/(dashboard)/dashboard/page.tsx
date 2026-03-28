import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Dumbbell, Flag, Activity } from "lucide-react";

const STAT_CARDS = [
  {
    title: "전체 유저",
    icon: Users,
    value: "-",
    description: "Phase 3에서 구현 예정",
  },
  {
    title: "운동 종목",
    icon: Dumbbell,
    value: "-",
    description: "Phase 2에서 구현 예정",
  },
  {
    title: "미처리 신고",
    icon: Flag,
    value: "-",
    description: "Phase 4에서 구현 예정",
  },
  {
    title: "이번 달 운동 세션",
    icon: Activity,
    value: "-",
    description: "Phase 5에서 구현 예정",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">대시보드</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ProLog 서비스 현황을 한눈에 확인하세요.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Placeholder notice */}
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            각 기능은 단계별로 순차 구현됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
