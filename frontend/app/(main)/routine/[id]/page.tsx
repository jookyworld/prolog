"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BarChart3,
  Clock,
  Dumbbell,
  Edit3,
  History,
  Target,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function RoutineDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = React.use(paramsPromise);
  const router = useRouter();

  // Mock data
  const routineData = {
    author: "주권영",
    title: "초고강도 5분할 등 루틴",
    description:
      "등 운동의 핵심은 수축과 이완입니다. 각 동작마다 1초 멈춤을 꼭 지켜주세요. 무게보다는 정확한 자세가 중요합니다.",
    likes: 342,
    usageCount: 1250,
    totalSessions: 7, // 누적 운동 세션 수
    avgDuration: 55, // 평균 소요 시간 (분)
    growthRate: 12.5, // 평균 볼륨 성장률 (%)
    muscleFocus: [
      { name: "등", percent: 75, color: "#3182F6" },
      { name: "이두", percent: 25, color: "#45FFBC" },
    ],
    exercises: [
      {
        id: 1,
        name: "랫풀다운",
        sets: 4,
        restTime: 60,
        lastRecord: { weight: 120, reps: 8 },
      },
      {
        id: 2,
        name: "시티드 로우",
        sets: 4,
        restTime: 60,
        lastRecord: { weight: 95, reps: 10 },
      },
      {
        id: 3,
        name: "덤벨 로우",
        sets: 3,
        restTime: 45,
        lastRecord: { weight: 40, reps: 12 },
      },
      {
        id: 4,
        name: "풀업",
        sets: 3,
        restTime: 90,
        lastRecord: { weight: 0, reps: 15 },
      },
    ],
  };

  const handleStartRoutine = () =>
    router.push(`/workout/planned?routineId=${params.id}`);

  const handleDeleteRoutine = async () => {
    if (!confirm("루틴을 삭제하시겠습니까?\n(이전 운동 기록은 보존됩니다)"))
      return;
    router.replace("/routine");
  };

  // 타겟 비중 차트 계산용
  const strokeDasharray = 2 * Math.PI * 18; // 반지름 18 기준 둘레
  let currentOffset = 0;

  return (
    // 하단바를 덮기 위해 z-index와 fixed inset-0 사용
    <div className="fixed inset-0 z-[100] bg-[#101012] flex flex-col overflow-hidden">
      {/* Header: 표준 h-14 규격 유지 */}
      <header className="sticky top-0 z-50 bg-[#101012]/90 backdrop-blur-xl border-b border-white/5">
        <div className="h-14 px-6 flex items-center justify-between">
          <button
            onClick={() => router.replace("/routine")}
            className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-[15px] font-bold text-white/40">루틴 상세</span>
          <button
            onClick={() => router.push(`/routine/${params.id}/edit`)}
            className="p-2 -mr-2 text-white/60 hover:text-[#3182F6] transition-colors"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content: Scrollable Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-40">
        <div className="px-6 pt-8 space-y-8">
          {/* Routine Summary Section */}
          <section className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-black leading-tight tracking-tight">
                {routineData.title}
              </h1>
              <p className="text-[15px] text-white/50 leading-relaxed font-medium">
                {routineData.description}
              </p>
            </div>
          </section>

          {/* 루틴 추세 섹션 (추가됨) */}
          <section className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between bg-[#17171C] p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-white/30">
                  <Clock className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    평균
                  </span>
                </div>
                <div className="text-xl font-black">
                  약 {routineData.avgDuration}분
                </div>
              </div>

              {/* 누적 기록 (운동 횟수) */}
              <div className="flex items-center justify-between bg-[#17171C] p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-white/30">
                  <History className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    누적 기록
                  </span>
                </div>
                <div className="text-xl font-black">
                  {routineData.totalSessions}회
                </div>
              </div>
            </div>

            {/* 타겟 비중 차트 */}
            <div className="bg-[#17171C] p-5 rounded-3xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between text-white/30">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    타겟 근육 비중
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex h-3 w-full rounded-full overflow-hidden bg-white/5">
                  {routineData.muscleFocus.map((m) => (
                    <div
                      key={m.name}
                      style={{
                        width: `${m.percent}%`,
                        backgroundColor: m.color,
                      }}
                    />
                  ))}
                </div>
                <div className="flex gap-4">
                  {routineData.muscleFocus.map((m) => (
                    <div key={m.name} className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: m.color }}
                      />
                      <span className="text-xs font-bold text-white/60">
                        {m.name} {m.percent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Exercise List */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#3182F6]" />
                운동 구성
              </h2>
              <span className="text-sm font-medium text-white/30 tracking-tighter">
                {routineData.exercises.length}개 종목
              </span>
            </div>

            <div className="space-y-3">
              {routineData.exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="bg-[#17171C] rounded-[24px] overflow-hidden border border-white/5 transition-all active:scale-[0.98]"
                >
                  <div className="p-5 flex flex-col gap-4">
                    {/* Upper: Exercise Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[13px] font-black text-[#3182F6] opacity-50">
                          0{index + 1}
                        </span>
                        <h3 className="text-[16px] font-bold">
                          {exercise.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-[12px] font-bold text-white/40">
                        <span className="flex items-center gap-1">
                          <Dumbbell className="w-3.5 h-3.5" />
                          {exercise.sets}세트
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {exercise.restTime}초 휴식
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Danger Zone */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleDeleteRoutine}
              className="flex items-center gap-2 text-[13px] font-medium text-white/20 hover:text-red-500/50 transition-colors py-2 px-4"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>이 루틴 삭제하기</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Action */}
      <div className="absolute left-0 right-0 bottom-0 p-6 bg-gradient-to-t from-[#101012] via-[#101012] to-transparent pt-10">
        <Button
          onClick={handleStartRoutine}
          className="w-full h-16 bg-[#3182F6] hover:bg-[#2563EB] text-white font-black rounded-2xl text-lg shadow-[0_8px_30px_rgb(49,130,246,0.3)] transition-all active:scale-[0.96]"
        >
          이 루틴으로 바로 시작하기
        </Button>
      </div>
    </div>
  );
}
