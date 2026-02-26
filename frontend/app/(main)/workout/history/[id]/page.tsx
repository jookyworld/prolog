"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  WorkoutSessionDetail,
  WorkoutSessionDetailRes,
  toWorkoutSessionDetail,
} from "@/components/workout/types";
import { apiFetch } from "@/lib/api";
import { AlertCircle, ArrowLeft, Check, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const formatElapsedTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const calcExerciseVolume = (
  exerciseSets: WorkoutSessionDetail["exercises"][0]["sets"],
): number => {
  return exerciseSets.reduce((sum, set) => sum + set.weight * set.reps, 0);
};

const calcTotalSets = (
  exercises: WorkoutSessionDetail["exercises"],
): number => {
  return exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
};

const calcTotalVolume = (
  exercises: WorkoutSessionDetail["exercises"],
): number => {
  return exercises.reduce((sum, ex) => sum + calcExerciseVolume(ex.sets), 0);
};

type EditSession = WorkoutSessionDetail & {
  exercises: Array<{
    id: string;
    orderNo: number;
    exerciseId?: string;
    name: string;
    targetRestSeconds?: number;
    sets: Array<{
      id: string;
      setNo: number;
      weight: number;
      reps: number;
      completed: boolean;
      isWarmup?: boolean;
    }>;
  }>;
};

export default function WorkoutHistoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [session, setSession] = useState<WorkoutSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [editSession, setEditSession] = useState<EditSession | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const fetchSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<WorkoutSessionDetailRes>(
        `/api/workouts/sessions/${id}`,
      );
      setSession(toWorkoutSessionDetail(data));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101012] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#3182F6] animate-spin mb-3" />
        <p className="text-sm text-white/50">불러오는 중...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#101012] flex flex-col items-center justify-center px-6 max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-white/30 mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">
          {error ?? "기록을 찾을 수 없어요"}
        </h2>
        <p className="text-white/50 text-sm mb-8">
          삭제되었거나 존재하지 않는 기록입니다.
        </p>
        <div className="flex gap-3">
          <Button
            onClick={fetchSession}
            variant="outline"
            className="rounded-full border-white/10 text-white/70 hover:text-white"
          >
            다시 시도
          </Button>
          <Button
            onClick={() => router.push("/workout/history")}
            className="bg-[#3182F6] hover:bg-[#2563EB] text-white rounded-full px-6"
          >
            목록으로
          </Button>
        </div>
      </div>
    );
  }

  const handleEditToggle = () => {
    if (editMode) {
      setShowDiscardConfirm(true);
    } else {
      setEditMode(true);
      setEditSession({ ...session });
    }
  };

  const handleDiscardConfirm = () => {
    setShowDiscardConfirm(false);
    setEditMode(false);
    setEditSession(null);
  };

  const handleSave = () => {
    if (!editSession) return;
    // TODO: PUT 엔드포인트가 준비되면 API 호출로 교체
    console.log("Save workout session (API 미지원):", {
      id: editSession.id,
      note: editSession.note,
      exercises: editSession.exercises.map((ex) => ({
        id: ex.id,
        sets: ex.sets.map((set) => ({
          id: set.id,
          weight: set.weight,
          reps: set.reps,
          completed: set.completed,
        })),
      })),
    });

    setEditMode(false);
    setEditSession(null);
    alert("수정 기능은 아직 지원되지 않습니다.");
  };

  const displaySession = editMode && editSession ? editSession : session;

  return (
    <div className="min-h-screen bg-[#101012]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#101012]/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4 max-w-lg mx-auto">
          <button
            onClick={() => {
              if (editMode && editSession) {
                setShowDiscardConfirm(true);
              } else {
                router.back();
              }
            }}
            className="flex items-center justify-center w-8 h-8 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-semibold text-white">기록 상세</h1>
          <div className="flex items-center gap-2">
            {editMode ? (
              <>
                <button
                  onClick={() => setShowDiscardConfirm(true)}
                  className="text-white/60 hover:text-white transition-colors text-sm font-medium"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="text-[#3182F6] hover:text-[#2563EB] transition-colors text-sm font-medium"
                >
                  저장
                </button>
              </>
            ) : (
              <button
                onClick={handleEditToggle}
                className="text-[#3182F6] hover:text-[#2563EB] transition-colors text-sm font-medium"
              >
                수정
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Discard Confirm Dialog */}
      <AlertDialog
        open={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>변경사항을 버릴까요?</AlertDialogTitle>
            <AlertDialogDescription>
              수정한 내용이 저장되지 않습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardConfirm}>
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Content */}
      <div className="max-w-lg mx-auto px-6 py-6 pb-24">
        {/* Summary Card */}
        <div className="bg-[#17171C] rounded-3xl p-5 mb-6 border border-white/5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">
                {displaySession.title}
              </h2>
            </div>
            <Badge
              className={`${
                displaySession.type === "routine"
                  ? "bg-[#3182F6]/15 text-[#3182F6]"
                  : "bg-white/10 text-white/60"
              } border-0 font-medium whitespace-nowrap`}
            >
              {displaySession.type === "routine" ? "루틴" : "자유"}
            </Badge>
          </div>

          {displaySession.isEdited && displaySession.updatedAt && (
            <div className="text-xs text-white/50 mb-4 flex items-center gap-1">
              <span className="inline-block w-1 h-1 bg-white/50 rounded-full" />
              수정됨 · {formatDateTime(displaySession.updatedAt)}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-white/10">
            <div>
              <div className="text-xs text-white/50 mb-1">완료 날짜</div>
              <div className="text-sm font-medium text-white">
                {formatDate(displaySession.completedAt)}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/50 mb-1">운동 시간</div>
              <div className="text-sm font-medium text-white">
                {displaySession.elapsedTime > 0
                  ? formatElapsedTime(displaySession.elapsedTime)
                  : "-"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-white/50 mb-1">총 세트</div>
              <div className="text-sm font-medium text-white">
                {calcTotalSets(displaySession.exercises)}개
              </div>
            </div>
            <div>
              <div className="text-xs text-white/50 mb-1">총 볼륨</div>
              <div className="text-sm font-medium text-white">
                {calcTotalVolume(displaySession.exercises).toLocaleString()} kg
              </div>
            </div>
          </div>
        </div>

        {/* Note Card */}
        {editMode && editSession ? (
          <div className="bg-[#17171C] rounded-3xl p-5 mb-6 border border-white/5">
            <label className="text-xs text-white/50 block mb-3">메모</label>
            <textarea
              value={editSession.note || ""}
              onChange={(e) => {
                setEditSession({
                  ...editSession,
                  note: e.target.value,
                });
              }}
              placeholder="오늘 컨디션/메모를 남겨보세요"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#3182F6] resize-none"
              rows={4}
            />
          </div>
        ) : displaySession.note ? (
          <div className="bg-[#17171C] rounded-3xl p-5 mb-6 border border-white/5">
            <div className="text-xs text-white/50 block mb-2">메모</div>
            <p className="text-sm text-white/80 whitespace-pre-wrap">
              {displaySession.note}
            </p>
          </div>
        ) : null}

        {/* Exercises */}
        <div className="space-y-4">
          {displaySession.exercises
            .sort((a, b) => a.orderNo - b.orderNo)
            .map((exercise, exIdx) => {
              const volume = calcExerciseVolume(exercise.sets);
              return (
                <div
                  key={exercise.id}
                  className="bg-[#17171C] rounded-3xl p-5 border border-white/5"
                >
                  {/* Exercise Header */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h3 className="text-base font-semibold text-white">
                      {exercise.name}
                    </h3>
                    <div className="text-sm font-medium text-[#3182F6]">
                      {volume.toLocaleString()} kg
                    </div>
                  </div>

                  {/* Sets */}
                  <div className="space-y-2">
                    {/* Header Row */}
                    <div className="grid grid-cols-[40px_1fr_1fr_48px] gap-3 items-center px-1">
                      <div className="text-xs text-white/30 text-center">
                        세트
                      </div>
                      <div className="text-xs text-white/30 text-center">
                        kg
                      </div>
                      <div className="text-xs text-white/30 text-center">
                        회
                      </div>
                      <div />
                    </div>

                    {exercise.sets.map((set) => (
                      <div
                        key={set.id}
                        className="grid grid-cols-[40px_1fr_1fr_48px] gap-3 items-center"
                      >
                        {/* Set Number */}
                        <div className="text-center text-sm text-[#3182F6] opacity-50 font-medium">
                          {set.isWarmup ? "W" : set.setNo}
                        </div>

                        {/* Weight */}
                        {editMode && editSession ? (
                          <div className="relative h-12 bg-white/5 border border-white/10 rounded-xl flex items-center px-3 focus-within:border-[#3182F6] focus-within:bg-white/10 transition-colors">
                            <input
                              type="number"
                              value={set.weight}
                              onChange={(e) => {
                                const newExercises = [...editSession.exercises];
                                newExercises[exIdx].sets[
                                  exercise.sets.indexOf(set)
                                ].weight = Number(e.target.value) || 0;
                                setEditSession({
                                  ...editSession,
                                  exercises: newExercises,
                                });
                              }}
                              className="w-full bg-transparent text-sm text-white text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="absolute right-3 text-xs text-white/30">
                              kg
                            </span>
                          </div>
                        ) : (
                          <div className="h-12 bg-white/5 rounded-xl flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {set.weight}
                            </span>
                            <span className="text-xs text-white/30 ml-1">
                              kg
                            </span>
                          </div>
                        )}

                        {/* Reps */}
                        {editMode && editSession ? (
                          <div className="relative h-12 bg-white/5 border border-white/10 rounded-xl flex items-center px-3 focus-within:border-[#3182F6] focus-within:bg-white/10 transition-colors">
                            <input
                              type="number"
                              value={set.reps}
                              onChange={(e) => {
                                const newExercises = [...editSession.exercises];
                                newExercises[exIdx].sets[
                                  exercise.sets.indexOf(set)
                                ].reps = Number(e.target.value) || 0;
                                setEditSession({
                                  ...editSession,
                                  exercises: newExercises,
                                });
                              }}
                              className="w-full bg-transparent text-sm text-white text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="absolute right-3 text-xs text-white/30">
                              회
                            </span>
                          </div>
                        ) : (
                          <div className="h-12 bg-white/5 rounded-xl flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {set.reps}
                            </span>
                            <span className="text-xs text-white/30 ml-1">
                              회
                            </span>
                          </div>
                        )}

                        {/* Complete Button */}
                        {editMode && editSession ? (
                          <button
                            onClick={() => {
                              const newExercises = [...editSession.exercises];
                              newExercises[exIdx].sets[
                                exercise.sets.indexOf(set)
                              ].completed = !set.completed;
                              setEditSession({
                                ...editSession,
                                exercises: newExercises,
                              });
                            }}
                            className={`h-12 w-12 rounded-xl border flex items-center justify-center transition-all flex-shrink-0 ${
                              set.completed
                                ? "bg-[#3182F6] border-[#3182F6] text-white"
                                : "bg-transparent border-white/10 text-white/40 hover:bg-white/5"
                            }`}
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        ) : (
                          <div
                            className={`h-12 w-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${
                              set.completed
                                ? "bg-[#3182F6] border-[#3182F6] text-white"
                                : "bg-transparent border-white/10 text-white/40"
                            }`}
                          >
                            <Check className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
