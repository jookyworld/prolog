"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PageWorkoutSessionListItemRes,
  WorkoutSession,
  toWorkoutSession,
} from "@/components/workout/types";
import { apiFetch } from "@/lib/api";
import { Dumbbell, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type TypeFilter = "all" | "routine" | "free";

export default function WorkoutHistoryPage() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<PageWorkoutSessionListItemRes>(
        "/api/workouts/sessions?page=0&size=100",
      );
      setSessions(data.content.map(toWorkoutSession));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    if (typeFilter !== "all") {
      filtered = filtered.filter((session) => session.type === typeFilter);
    }

    filtered.sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );

    return filtered;
  }, [sessions, typeFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "오늘";
    if (diffDays === 1) return "어제";
    if (diffDays < 7) return `${diffDays}일 전`;

    return date.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
    });
  };

  const handleCardClick = (id: string) => {
    router.push(`/workout/history/${id}`);
  };

  const typeFilters: { value: TypeFilter; label: string }[] = [
    { value: "all", label: "전체" },
    { value: "routine", label: "루틴" },
    { value: "free", label: "자유 운동" },
  ];

  return (
    <div className="min-h-screen bg-[#101012]">
      {/* Header - Type B (List/Action) */}
      <header className="sticky top-0 z-50 bg-[#101012]/90 backdrop-blur-xl">
        <div className="h-14 px-6 flex items-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            운동 기록
          </h1>
        </div>
      </header>

      {/* Filter Chips */}
      <div className="sticky top-14 z-40 bg-[#101012]/90 backdrop-blur-xl border-b border-white/5">
        <div className="px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {typeFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setTypeFilter(filter.value)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                typeFilter === filter.value
                  ? "bg-[#3182F6] text-white border-transparent shadow-lg shadow-[#3182F6]/25"
                  : "bg-[#17171C] text-white/70 border-white/10 hover:text-white hover:border-white/20"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-6 py-6 pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#3182F6] animate-spin mb-3" />
            <p className="text-sm text-white/50">불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="bg-[#17171C] rounded-3xl p-8 border border-white/5 text-center">
            <p className="text-sm text-white/60 mb-4">{error}</p>
            <Button
              onClick={fetchSessions}
              variant="outline"
              className="rounded-full border-white/10 text-white/70 hover:text-white"
            >
              다시 시도
            </Button>
          </div>
        ) : filteredSessions.length === 0 ? (
          /* Empty State */
          <div className="bg-[#17171C] rounded-3xl p-8 border border-white/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#3182F6]/15 border border-[#3182F6]/20 flex items-center justify-center flex-shrink-0">
                <Dumbbell className="w-6 h-6 text-[#3182F6]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white mb-1">
                  아직 운동 기록이 없어요
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  운동을 시작하면 여기에 기록이 쌓여요.
                  <br />
                  지금 바로 첫 운동을 시작해보세요!
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/workout/free")}
              className="w-full mt-6 bg-[#3182F6] hover:bg-[#2563EB] text-white rounded-2xl h-12 font-medium shadow-lg shadow-[#3182F6]/25"
            >
              운동 시작하기
            </Button>
          </div>
        ) : (
          /* Session Cards */
          <div className="space-y-3">
            {filteredSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => handleCardClick(session.id)}
                className="w-full text-left bg-[#17171C] rounded-3xl p-5 hover:bg-[#1F1F24] transition-colors border border-white/5 hover:border-white/10"
              >
                {/* Date */}
                <div className="text-xs text-white/40 mb-2">
                  {formatDate(session.completedAt)}
                </div>

                {/* Title + Badge */}
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white">
                    {session.title}
                  </h3>
                  <Badge
                    className={`${
                      session.type === "routine"
                        ? "bg-[#3182F6]/15 text-[#3182F6]"
                        : "bg-white/10 text-white/60"
                    } border-0 font-medium text-xs`}
                  >
                    {session.type === "routine" ? "루틴" : "자유"}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
