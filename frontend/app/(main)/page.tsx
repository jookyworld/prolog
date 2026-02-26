"use client";

import { Button } from "@/components/ui/button";
import { Bell, Dumbbell, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FitnessHomePage() {
  const router = useRouter();

  const weekDays = [
    { day: "월", isActive: true },
    { day: "화", isActive: true },
    { day: "수", isActive: false },
    { day: "목", isActive: true },
    { day: "금", isActive: false },
    { day: "토", isActive: false },
    { day: "일", isActive: false },
  ];

  const popularRoutines = [
    {
      id: 1,
      title: "가슴/삼두 집중",
      description: "벤치프레스 중심 루틴",
      users: 350,
      exercises: 8,
    },
    {
      id: 2,
      title: "등/이두 데이",
      description: "풀업 + 로우 조합",
      users: 287,
      exercises: 7,
    },
    {
      id: 3,
      title: "하체 킬러",
      description: "스쿼트 데드리프트",
      users: 412,
      exercises: 6,
    },
  ];

  return (
    <div className="min-h-screen bg-[#101012] text-white">
      {/* Header - Type A (Dashboard) */}
      <header className="sticky top-0 z-50 bg-[#101012]/90 backdrop-blur-xl">
        <div className="h-14 px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">주권영 님</h1>
          <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#3182F6] rounded-full" />
          </button>
        </div>
      </header>

      <div className="px-6 space-y-5 pb-24">
        {/* Week Activity Card */}
        <div className="bg-[#17171C] rounded-3xl p-6">
          <h2 className="text-lg font-bold mb-5">이번 주 운동</h2>
          <div className="flex justify-between">
            {weekDays.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-medium transition-all ${
                    item.isActive
                      ? "bg-[#3182F6] text-white shadow-lg shadow-[#3182F6]/30"
                      : "bg-white/5 text-white/40"
                  }`}
                >
                  <Dumbbell className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <span
                  className={`text-xs ${
                    item.isActive ? "text-white" : "text-white/40"
                  }`}
                >
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Routine Card */}
        <div className="bg-gradient-to-br from-[#3182F6] to-[#2563EB] rounded-3xl p-7 shadow-xl shadow-[#3182F6]/20">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm text-white/80 mb-2">오늘 할 운동</p>
              <h3 className="text-2xl font-bold text-white mb-1">
                4분할 등/이두
              </h3>
              <p className="text-sm text-white/70">8개 운동 • 평균 65분</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-3 backdrop-blur-sm">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
          </div>

          <Button
            onClick={() => router.push("/workout")}
            className="w-full bg-white hover:bg-white/90 text-[#3182F6] font-bold rounded-2xl h-14 text-base shadow-lg"
          >
            운동 시작
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#17171C] rounded-3xl p-5">
            <p className="text-sm text-white/60 mb-1">이번 달 운동</p>
            <p className="text-3xl font-bold">
              12<span className="text-lg text-white/60 ml-1">일</span>
            </p>
          </div>
          <div className="bg-[#17171C] rounded-3xl p-5">
            <p className="text-sm text-white/60 mb-1">연속 기록</p>
            <p className="text-3xl font-bold">
              3<span className="text-lg text-white/60 ml-1">일</span>
            </p>
          </div>
        </div>

        {/* Community Snapshot */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">실시간 인기 루틴</h2>
            <button className="text-base text-[#3182F6] font-medium">
              더보기
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-6 px-6">
            {popularRoutines.map((routine, index) => (
              <button
                key={index}
                onClick={() => router.push(`/routine/${routine.id}`)}
                className="bg-[#17171C] rounded-3xl p-5 min-w-[260px] snap-start flex-shrink-0 text-left hover:bg-[#1F1F24] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-base mb-1">
                      {routine.title}
                    </h3>
                    <p className="text-sm text-white/60">
                      {routine.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#3182F6]" />
                    <span className="font-bold text-[#3182F6]">
                      {routine.users}명
                    </span>
                    <span className="text-white/60">가져감</span>
                  </div>
                  <div className="text-white/60">
                    {routine.exercises}개 운동
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
