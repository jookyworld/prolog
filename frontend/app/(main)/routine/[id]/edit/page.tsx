"use client";

import {
  ChevronDown,
  ChevronUp,
  Dumbbell,
  GripVertical,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

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

export default function RoutineEditPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = React.use(paramsPromise);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [routine, setRoutine] = useState<RoutineDraft>({
    id: "",
    title: "",
    description: "",
    exercises: [],
  });

  // 1. 실시간 초안 저장: routine 상태 변경 시마다 localStorage에 저장 (ID와 함께)
  useEffect(() => {
    // 로딩 중이거나 ID가 없으면 저장하지 않음
    if (isLoading || !routine.id) return;

    if (
      routine.title.trim().length > 0 ||
      routine.description.trim().length > 0 ||
      routine.exercises.length > 0
    ) {
      // ID와 함께 저장하여 다른 루틴 수정 시 데이터가 섞이지 않게 방어
      const draftData = {
        routineId: params.id,
        routine: routine,
      };
      localStorage.setItem(
        "active_routine_edit_draft",
        JSON.stringify(draftData)
      );
    }
  }, [routine, isLoading, params.id]);

  // 2. 기존 루틴 데이터 로딩 및 초안 복구
  useEffect(() => {
    const loadRoutine = async () => {
      try {
        setIsLoading(true);

        // A. 초안 복구: active_routine_edit_draft 확인
        const draftData = localStorage.getItem("active_routine_edit_draft");
        let hasDraft = false;

        if (draftData) {
          try {
            const parsed = JSON.parse(draftData);
            // 저장된 ID가 현재 params.id와 일치하면 초안 사용
            if (parsed.routineId === params.id && parsed.routine) {
              setRoutine(parsed.routine);
              hasDraft = true;
              setIsLoading(false);
              return; // 서버 데이터 로딩 건너뛰기
            } else {
              // ID가 다르면 오래된 초안이므로 삭제
              localStorage.removeItem("active_routine_edit_draft");
            }
          } catch (error) {
            console.error("Failed to parse edit draft:", error);
            localStorage.removeItem("active_routine_edit_draft");
          }
        }

        // B. 초안이 없으면 서버 데이터 로딩
        // TODO: 실제 API 호출로 대체
        // const response = await fetch(`/api/routines/${params.id}`);
        // const data = await response.json();

        // Mock data (실제 API 호출 시 제거)
        const mockData = {
          id: params.id,
          title: "초고강도 5분할 등 루틴",
          description:
            "등 운동의 핵심은 수축과 이완입니다. 각 동작마다 1초 멈춤을 꼭 지켜주세요.",
          routine_exercises: [
            {
              id: "1",
              exercise_name: "랫풀다운",
              target_sets: 4,
              rest_seconds: 60,
              order_no: 1,
            },
            {
              id: "2",
              exercise_name: "시티드 로우",
              target_sets: 4,
              rest_seconds: 60,
              order_no: 2,
            },
            {
              id: "3",
              exercise_name: "덤벨 로우",
              target_sets: 3,
              rest_seconds: 45,
              order_no: 3,
            },
            {
              id: "4",
              exercise_name: "풀업",
              target_sets: 3,
              rest_seconds: 90,
              order_no: 4,
            },
            {
              id: "5",
              exercise_name: "페이스 풀",
              target_sets: 3,
              rest_seconds: 45,
              order_no: 5,
            },
          ],
        };

        // 데이터 매핑
        setRoutine({
          id: mockData.id,
          title: mockData.title,
          description: mockData.description || "",
          exercises: mockData.routine_exercises.map((ex) => ({
            id: ex.id,
            name: ex.exercise_name,
            target_sets: ex.target_sets,
            rest_seconds: ex.rest_seconds,
          })),
        });
      } catch (error) {
        console.error("Failed to load routine:", error);
        alert("루틴을 불러오는데 실패했습니다.");
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    loadRoutine();
  }, [params.id, router]);

  // 3. 종목 병합: localStorage에서 선택된 종목들 확인 및 추가
  useEffect(() => {
    if (isLoading) return;

    const handleStorageUpdate = () => {
      // 커스텀 종목 처리
      const pendingCustomExercise = localStorage.getItem(
        "pending_custom_exercise"
      );
      if (pendingCustomExercise) {
        try {
          const customExercise = JSON.parse(pendingCustomExercise);
          setRoutine((prev) => ({
            ...prev,
            exercises: [
              ...prev.exercises,
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
          setRoutine((prev) => ({
            ...prev,
            exercises: [...prev.exercises, ...newExercises],
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

    // focus 이벤트: 종목 선택 후 복귀 시 즉시 반영
    window.addEventListener("focus", handleStorageUpdate);
    return () => window.removeEventListener("focus", handleStorageUpdate);
  }, [isLoading]);

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

  const onSave = async () => {
    if (!canSave) return;

    try {
      const payload = {
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

      // TODO: 실제 API 호출로 대체
      // const response = await fetch(`/api/routines/${params.id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
      // if (!response.ok) throw new Error('Failed to update routine');

      console.log("UPDATE ROUTINE PAYLOAD:", payload);
      alert("수정 완료 (콘솔 확인)");

      // 4. 저장 성공 시 초안 삭제
      localStorage.removeItem("active_routine_edit_draft");
      localStorage.removeItem("selected_exercises");
      localStorage.removeItem("pending_custom_exercise");

      // 성공 시 상세 페이지로 이동 (히스토리 남기지 않음)
      router.replace(`/routine/${params.id}`);
      // 페이지 새로고침하여 수정된 데이터 반영
      router.refresh();
    } catch (error) {
      console.error("Failed to update routine:", error);
      alert("루틴 수정에 실패했습니다.");
    }
  };

  const onCancel = () => {
    // 작성 중인 데이터 확인
    const confirmed = window.confirm(
      "수정 중인 내용은 저장되지 않습니다. 나갈까요?"
    );
    if (!confirmed) return;

    // 4. 취소 확인 시 초안 삭제
    localStorage.removeItem("active_routine_edit_draft");
    localStorage.removeItem("selected_exercises");
    localStorage.removeItem("pending_custom_exercise");

    // 상세 페이지로 이동
    router.replace(`/routine/${params.id}`);
  };

  const onDelete = async () => {
    if (
      !confirm("루틴을 삭제하시겠습니까?\n(이전 운동 기록은 삭제되지 않습니다)")
    ) {
      return;
    }

    try {
      // TODO: 실제 API 호출로 대체
      // const response = await fetch(`/api/routines/${params.id}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) throw new Error('Failed to delete routine');

      console.log(`DELETE /api/routines/${params.id}`);

      // 성공 시 메인 페이지로 이동
      router.replace("/routine");
    } catch (error) {
      console.error("Failed to delete routine:", error);
      alert("루틴 삭제에 실패했습니다.");
    }
  };

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#101012] flex items-center justify-center">
        <div className="text-white/60">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#101012] overflow-y-auto">
      <div className="min-h-screen text-white pb-32">
        {/* Header - Type B (List/Action) */}
        <header className="sticky top-0 z-50 bg-[#101012]/90 backdrop-blur-xl border-b border-white/5">
          <div className="h-14 px-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">루틴 수정</h1>

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
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <GripVertical
                      className="w-3.5 h-3.5 text-white/30 flex-shrink-0"
                      aria-hidden
                    />
                    <h3 className="text-sm font-bold text-white truncate">
                      {ex.name}
                    </h3>
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
              onClick={() =>
                router.push("/exercise?from=routine_edit_" + routine.id)
              }
              className="w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/[0.07] text-white/70 hover:text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 border border-white/10"
            >
              <Dumbbell className="w-4 h-4" />
              종목 추가
            </button>

            {/* Delete Button */}
            <button
              onClick={onDelete}
              className="w-full px-4 py-2.5 rounded-xl text-red-500 hover:text-red-400 hover:bg-red-500/5 text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-white/5"
            >
              <Trash2 className="w-4 h-4" />
              루틴 삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
