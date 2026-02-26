"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
  ChevronRight,
  Dumbbell,
  LayoutGrid,
  Settings,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function ProfilePage() {
  const { user } = useAuth();

  const volumeData = [
    { day: "1일", volume: 8200 },
    { day: "3일", volume: 8500 },
    { day: "5일", volume: 9100 },
    { day: "8일", volume: 8900 },
    { day: "10일", volume: 9400 },
    { day: "13일", volume: 9800 },
    { day: "15일", volume: 10200 },
    { day: "18일", volume: 10600 },
    { day: "20일", volume: 10400 },
    { day: "23일", volume: 11000 },
    { day: "25일", volume: 11400 },
    { day: "28일", volume: 11800 },
    { day: "30일", volume: 12300 },
  ];

  const router = useRouter();

  const menuItems = [
    { title: "운동 기록 보관함", icon: Dumbbell, href: "/workout/history" },
    { title: "개인 최고 기록(1RM)", icon: TrendingUp },
    { title: "공유한 루틴 관리", icon: LayoutGrid },
    { title: "설정", icon: Settings, href: "/profile/settings" },
  ];

  return (
    <div className="min-h-screen bg-[#101012] text-white">
      {/* Header - Type A (Dashboard) */}
      <header className="sticky top-0 z-50 bg-[#101012]/90 backdrop-blur-xl">
        <div className="h-14 px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{user?.nickname ?? "사용자"} 님</h1>
          <Button
            variant="outline"
            className="h-10 rounded-full border-white/10 text-white/80 hover:bg-white/5 px-5 bg-transparent text-sm"
          >
            프로필 보기
          </Button>
        </div>
      </header>

      <div className="px-6 space-y-6 pb-24">
        {/* 신체 지표 카드 */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "키", value: user?.height ?? "-", unit: "cm" },
            { label: "체중", value: user?.weight ?? "-", unit: "kg" },
          ].map((item, i) => (
            <div key={i} className="bg-[#17171C] rounded-2xl p-4 text-center">
              <p className="text-xs text-white/40 mb-1.5">{item.label}</p>
              <p className="text-2xl font-bold">
                {item.value}
                <span className="text-sm font-normal text-white/40 ml-0.5">
                  {item.unit}
                </span>
              </p>
            </div>
          ))}
        </div>

        {/* 볼륨 차트 섹션 */}
        <div className="bg-[#17171C] rounded-3xl p-6 border border-white/5">
          <h2 className="text-lg font-bold mb-5">이번 달 총 볼륨 성장</h2>
          <div className="h-[200px] -mx-2 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#ffffff10"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#ffffff40", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide domain={[7000, 13000]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#17171C",
                    border: "1px solid #ffffff10",
                    borderRadius: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#3182F6"
                  strokeWidth={3}
                  dot={{ fill: "#3182F6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-[#3182F6]/10 rounded-2xl p-4 text-center">
            <p className="text-sm text-[#3182F6]">
              가장 많이 성장한 부위: <span className="font-bold">하체</span>
            </p>
          </div>
        </div>

        {/* 리스트 섹션 */}
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => item.href && router.push(item.href)}
              className="w-full flex items-center justify-between p-5 bg-[#17171C] rounded-2xl hover:bg-[#1F1F24] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/5 rounded-xl p-2.5">
                  <item.icon className="w-5 h-5 text-white/80" />
                </div>
                <span className="text-base font-medium">{item.title}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/20" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
