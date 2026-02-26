"use client";

import { ChevronDown, ChevronUp, Dumbbell, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type RoutineExerciseDraft = {
  id: string;
  name: string;
  target_sets: number;
  rest_seconds: number;
};

type RoutineDraft = {
  id: string;
  title: string;
  description: string;
  exercises: RoutineExerciseDraft[];
};

function uid(prefix = "id") {
  return `${prefix}_${Math.random()
    .toString(16)
    .slice(2)}_${Date.now().toString(16)}`;
}

function formatRestTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    if (minutes === 0) {
      return "0초";
    }
    return `${minutes}분`;
  } else {
    if (minutes === 0) {
      return `${remainingSeconds}초`;
    }
    return `${minutes}분 ${remainingSeconds}초`;
  }
}

export default function RoutineCreatePage() {
  const router = useRouter();
  const [routine, setRoutine] = useState<RoutineDraft>({
    id: uid("routine"),
    title: "",
    description: "",
    exercises: [],
  });

  // 1. 실시간 초안 저장: routine 상태 변경 시마다 localStorage에 저장
  useEffect(() => {
    if (
      routine.title.trim().length > 0 ||
      routine.description.trim().length > 0 ||
      routine.exercises.length > 0
    ) {
      localStorage.setItem("active_routine_draft", JSON.stringify(routine));
    }
  }, [routine]);

  // 2. 초안 복구 및 종목 병합: 페이지 마운트 시 및 focus 이벤트 발생 시
  useEffect(() => {
    const handleStorageUpdate = () => {
      // A. 초안 복구: active_routine_draft가 있으면 불러와서 routine 상태 초기화
      const draftData = localStorage.getItem("active_routine_draft");
      let currentDraft: RoutineDraft | null = null;
      if (draftData) {
        try {
          currentDraft = JSON.parse(draftData);
          setRoutine((prev) => {
            // 이미 로드된 경우 중복 방지
            if (prev.exercises.length > 0 && currentDraft) {
              return prev;
            }
            return currentDraft || prev;
          });
        } catch (error) {
          console.error("Failed to parse routine draft:", error);
          localStorage.removeItem("active_routine_draft");
        }
      }

      // B. 종목 합치기: selected_exercises나 pending_custom_exercise 처리
      // 커스텀 종목 처리
      const pendingCustomExercise = localStorage.getItem(
        "pending_custom_exercise"
      );
      if (pendingCustomExercise) {
        try {
          const customExercise = JSON.parse(pendingCustomExercise);
          setRoutine((p) => ({
            ...p,
            exercises: [
              ...p.exercises,
              {
                id: uid("ex"),
                name: customExercise.name,
                target_sets: 3,
                rest_seconds: 120,
              },
            ],
          }));
          localStorage.removeItem("pending_custom_exercise");
        } catch (error) {
          console.error("Failed to parse custom exercise:", error);
          localStorage.removeItem("pending_custom_exercise");
        }
      }

      // 선택된 종목들 처리
      const selectedExercises = localStorage.getItem("selected_exercises");
      if (selectedExercises) {
        try {
          const exercises = JSON.parse(selectedExercises);
          const newExercises = exercises.map(
            (ex: { id: string; name: string }) => ({
              id: uid("ex"),
              name: ex.name,
              target_sets: 3,
              rest_seconds: 120,
            })
          );
          setRoutine((p) => ({
            ...p,
            exercises: [...p.exercises, ...newExercises],
          }));
          localStorage.removeItem("selected_exercises");
        } catch (error) {
          console.error("Failed to parse selected exercises:", error);
          localStorage.removeItem("selected_exercises");
        }
      }
    };

    // 초기 로드 시 체크
    handleStorageUpdate();

    // focus 이벤트: 종목 선택 후 돌아올 때 즉시 반영
    window.addEventListener("focus", handleStorageUpdate);
    return () => window.removeEventListener("focus", handleStorageUpdate);
  }, []);

  const canSave = useMemo(() => {
    const hasTitle = routine.title.trim().length > 0;
    const hasExercises = routine.exercises.length > 0;
    return hasTitle && hasExercises;
  }, [routine.title, routine.exercises.length]);

  const updateTitle = (v: string) => setRoutine((p) => ({ ...p, title: v }));
  const updateDescription = (v: string) =>
    setRoutine((p) => ({ ...p, description: v }));

  const removeExercise = (exerciseId: string) => {
    setRoutine((p) => ({
      ...p,
      exercises: p.exercises.filter((ex) => ex.id !== exerciseId),
    }));
  };

  const changeTargetSets = (exerciseId: string, next: number) => {
    const clamped = Math.max(1, Math.min(20, next));
    setRoutine((p) => ({
      ...p,
      exercises: p.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, target_sets: clamped } : ex
      ),
    }));
  };

  const setRestSeconds = (exerciseId: string, seconds: number) => {
    const clamped = Math.max(0, Math.min(600, seconds));
    setRoutine((p) => ({
      ...p,
      exercises: p.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, rest_seconds: clamped } : ex
      ),
    }));
  };

  const moveExercise = (exerciseId: string, direction: -1 | 1) => {
    setRoutine((p) => {
      const idx = p.exercises.findIndex((e) => e.id === exerciseId);
      if (idx < 0) return p;

      const nextIdx = idx + direction;
      if (nextIdx < 0 || nextIdx >= p.exercises.length) return p;

      const copy = [...p.exercises];
      const [picked] = copy.splice(idx, 1);
      copy.splice(nextIdx, 0, picked);
      return { ...p, exercises: copy };
    });
  };

  const onSave = () => {
    const payload = {
      id: routine.id,
      title: routine.title.trim(),
      description: routine.description.trim(),
      exercises: routine.exercises.map((ex, idx) => ({
        order_no: idx + 1,
        id: ex.id,
        name: ex.name,
        target_sets: ex.target_sets,
        rest_seconds: ex.rest_seconds,
      })),
    };

    console.log("SAVE ROUTINE PAYLOAD:", payload);
    alert("저장 (콘솔 확인)");

    // 3. 생명주기 종료 처리: 저장 성공 시 초안 삭제
    localStorage.removeItem("active_routine_draft");
    localStorage.removeItem("selected_exercises");
    localStorage.removeItem("pending_custom_exercise");

    router.replace("/routine");
  };

  const onCancel = () => {
    // 작성 중인 데이터 확인
    const hasUnsavedData =
      routine.title.trim().length > 0 ||
      routine.description.trim().length > 0 ||
      routine.exercises.length > 0;

    if (hasUnsavedData) {
      const confirmed = window.confirm(
        "작성 중인 내용은 저장되지 않습니다. 나갈까요?"
      );
      if (!confirmed) return;
    }

    // 3. 생명주기 종료 처리: 취소 확인 시 초안 삭제
    localStorage.removeItem("active_routine_draft");
    localStorage.removeItem("selected_exercises");
    localStorage.removeItem("pending_custom_exercise");

    // 히스토리를 남기지 않고 루틴 목록으로 이동
    router.replace("/routine");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#101012] overflow-y-auto">
      <div className="min-h-screen text-white pb-32">
        {/* Header - Type B (List/Action) */}
        <header className="sticky top-0 z-50 bg-[#101012]/90 backdrop-blur-xl border-b border-white/5">
          <div className="h-14 px-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">루틴 생성</h1>

            <div className="flex items-center gap-4">
              <button
                onClick={onCancel}
                className="h-10 px-3 flex items-center text-sm font-medium text-white/60 hover:text-white transition-colors"
                aria-label="취소"
              >
                취소
              </button>
              <button
                onClick={onSave}
                disabled={!canSave}
                className={`h-10 px-3 flex items-center text-sm font-bold transition-colors ${
                  canSave
                    ? "text-[#3182F6] hover:text-[#2563EB]"
                    : "text-white/30 cursor-not-allowed"
                }`}
                aria-label="저장"
              >
                저장
              </button>
            </div>
          </div>
        </header>

        {/* Form */}
        <div className="px-6 pt-6 space-y-6">
          {/* Routine Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/60 mb-2">
                루틴 이름
              </label>
              <input
                value={routine.title}
                onChange={(e) => updateTitle(e.target.value)}
                placeholder="루틴 이름을 입력해주세요 (예: 월요일 가슴/어깨)"
                className="w-full bg-[#17171C] px-4 py-3.5 text-base font-bold text-white placeholder:text-white/30 rounded-2xl outline-none focus:bg-white/[0.07] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/60 mb-2">
                루틴 설명 (선택)
              </label>
              <textarea
                value={routine.description}
                onChange={(e) => updateDescription(e.target.value)}
                placeholder="루틴에 대한 짧은 메모를 남겨주세요"
                rows={2}
                className="w-full bg-[#17171C] px-4 py-3 text-sm text-white placeholder:text-white/30 rounded-2xl outline-none focus:bg-white/[0.07] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Exercise List Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <Dumbbell className="w-5 h-5 text-white/60" />
              <span className="text-base font-bold text-white/80">
                구성 종목
              </span>
            </div>
            <span className="text-sm text-white/40">
              {routine.exercises.length}개
            </span>
          </div>

          {/* Exercise Cards - Slim Version */}
          <div className="space-y-2">
            {routine.exercises.map((ex, index) => (
              <div
                key={ex.id}
                className="bg-white/[0.02] rounded-2xl p-3 border border-white/5 hover:border-white/10 transition-colors"
              >
                {/* Card Header - Compact */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-[13px] font-black text-[#3182F6] opacity-50">
                      0{index + 1}
                    </span>
                    <h3 className="text-m font-bold text-white">{ex.name}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveExercise(ex.id, -1)}
                      disabled={index === 0}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/50 disabled:opacity-20 transition-colors"
                      aria-label="위로 이동"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveExercise(ex.id, 1)}
                      disabled={index === routine.exercises.length - 1}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/50 disabled:opacity-20 transition-colors"
                      aria-label="아래로 이동"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => removeExercise(ex.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-red-400/50 hover:text-red-400 transition-colors"
                      aria-label="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Controls: Horizontal Layout (One Row) */}
                <div className="flex items-center gap-2">
                  {/* Target sets - Compact */}
                  <span className="text-[10px] font-bold text-white/40 uppercase">
                    세트
                  </span>
                  <div className="flex items-center gap-1 bg-white/[0.03] rounded-xl px-2.5 py-1.5 flex-shrink-0">
                    <button
                      onClick={() =>
                        changeTargetSets(ex.id, ex.target_sets - 1)
                      }
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#3182F6]/10 text-[#3182F6] transition-colors text-base font-bold"
                      aria-label="세트 감소"
                    >
                      −
                    </button>

                    <div className="w-7 text-center">
                      <div className="text-sm font-bold text-white">
                        {ex.target_sets}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        changeTargetSets(ex.id, ex.target_sets + 1)
                      }
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#3182F6]/10 text-[#3182F6] transition-colors text-base font-bold"
                      aria-label="세트 증가"
                    >
                      +
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-6 bg-white/5"></div>

                  {/* Rest seconds - Compact */}
                  <span className="text-[10px] font-bold text-white/40 uppercase">
                    휴식
                  </span>
                  <div className="flex items-center gap-1 bg-white/[0.03] rounded-xl px-2.5 py-1.5 flex-shrink-0">
                    <button
                      onClick={() =>
                        setRestSeconds(ex.id, ex.rest_seconds - 30)
                      }
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#3182F6]/10 text-[#3182F6] transition-colors text-base font-bold"
                      aria-label="휴식 시간 감소"
                    >
                      −
                    </button>

                    <div className="min-w-[70px] text-center">
                      <div className="text-sm font-bold text-white">
                        {formatRestTime(ex.rest_seconds)}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setRestSeconds(ex.id, ex.rest_seconds + 30)
                      }
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#3182F6]/10 text-[#3182F6] transition-colors text-base font-bold"
                      aria-label="휴식 시간 증가"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Exercise */}

          <div className="space-y-3">
            <button
              onClick={() => router.push("/exercise?from=routine_new")}
              className="w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/[0.07] text-white/70 hover:text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 border border-white/10"
            >
              <Dumbbell className="w-4 h-4" />
              종목 추가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
