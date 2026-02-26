"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

type BodyPart =
  | "가슴"
  | "등"
  | "어깨"
  | "하체"
  | "팔"
  | "코어"
  | "유산소"
  | "기타";

const BODY_PARTS: BodyPart[] = [
  "가슴",
  "등",
  "어깨",
  "하체",
  "팔",
  "코어",
  "유산소",
  "기타",
];

// ✅ 실제 로직을 담당하는 클라이언트 컴포넌트
function CustomExerciseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [exerciseName, setExerciseName] = useState("");
  const [bodyPart, setBodyPart] = useState<BodyPart | "">("");
  const [partDetail, setPartDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // URL 쿼리에서 from과 name 가져와 초기값 설정
  const from = searchParams.get("from") || "routine"; // 'routine' 또는 'workout'

  useEffect(() => {
    const nameFromQuery = searchParams.get("name");
    if (nameFromQuery) {
      setExerciseName(nameFromQuery);
    }
    // 자동 포커스
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [searchParams]);

  const handleCancel = () => {
    router.back();
  };

  const handleComplete = async () => {
    const trimmedName = exerciseName.trim();
    if (!trimmedName || !bodyPart) return;

    const customExercise = {
      id: `custom_${Date.now()}`,
      name: trimmedName,
      body_part: bodyPart,
      part_detail: partDetail.trim() || undefined,
      is_custom: true,
      timestamp: Date.now(),
    };

    // localStorage에 저장 후 from에 따라 이동
    localStorage.setItem(
      "pending_custom_exercise",
      JSON.stringify(customExercise)
    );

    if (from === "free_start") {
      router.replace("/workout/free");
    } else if (from.startsWith("planned_start_")) {
      const routineId = from.split("_")[2];
      router.replace(`/workout/planned?routineId=${routineId}`);
    } else if (from === "routine_new") {
      router.replace("/routine/new");
    } else if (from.startsWith("routine_edit_")) {
      const id = from.split("_")[2];
      router.replace(`/routine/${id}/edit`);
    }
  };

  // 완료 버튼 활성화 조건: name과 body_part 모두 필수
  const canComplete =
    exerciseName.trim().length > 0 && bodyPart !== "" && !isSubmitting;

  // 컨텍스트별 텍스트
  const headerTitle =
    from === "workout" ? "운동에 종목 추가" : "루틴에 종목 추가";
  const completeButtonText = "추가하기";

  return (
    <div className="fixed inset-0 z-[110] bg-[#101012] overflow-y-auto">
      <div className="min-h-screen text-white pb-32">
        {/* Header - Type B (List/Action) */}
        <header className="sticky top-0 z-50 bg-[#101012]/90 backdrop-blur-xl border-b border-white/5">
          <div className="h-14 px-6 flex items-center justify-between">
            <button
              onClick={handleCancel}
              className="h-10 px-3 flex items-center text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              취소
            </button>

            <h1 className="text-xl font-bold tracking-tight">{headerTitle}</h1>

            <button
              onClick={handleComplete}
              disabled={!canComplete}
              className={`h-10 px-3 flex items-center text-sm font-bold transition-colors ${
                canComplete
                  ? "text-[#3182F6] hover:text-[#2563EB]"
                  : "text-white/30 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "저장 중..." : completeButtonText}
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="px-6 pt-8 space-y-8">
          {/* 종목 이름 입력 */}
          <div>
            <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-3">
              종목 이름
            </label>
            <input
              ref={inputRef}
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canComplete) {
                  handleComplete();
                }
              }}
              placeholder="예: 나만의 스트레칭, 맨몸 운동"
              className="w-full bg-[#17171C] px-5 py-3 text-xl font-bold text-white placeholder:text-white/30 rounded-3xl outline-none focus:bg-white/[0.07] border border-white/5 focus:border-[#3182F6]/30 transition-colors"
            />
          </div>

          {/* 운동 부위 선택 (필수) */}
          <div>
            <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-3">
              운동 부위 <span className="text-[#3182F6]">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {BODY_PARTS.map((part) => {
                const isSelected = bodyPart === part;
                return (
                  <button
                    key={part}
                    onClick={() => setBodyPart(part)}
                    className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
                      isSelected
                        ? "bg-[#3182F6] text-white shadow-lg shadow-[#3182F6]/25"
                        : "bg-[#17171C] text-white/60 hover:bg-white/[0.07] hover:text-white border border-white/5"
                    }`}
                  >
                    {part}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 상세 부위 입력 (선택) */}
          <div>
            <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-3">
              상세 부위{" "}
              <span className="text-white/30 font-normal lowercase">
                (선택)
              </span>
            </label>
            <input
              value={partDetail}
              onChange={(e) => setPartDetail(e.target.value)}
              placeholder="예: 윗가슴, 광배근, 측면 어깨"
              className="w-full bg-[#17171C] px-4 py-2.5 text-base text-white placeholder:text-white/30 rounded-2xl outline-none focus:bg-white/[0.07] border border-white/5 focus:border-[#3182F6]/30 transition-colors"
            />
            <p className="mt-2 text-xs text-white/40 px-1">
              더 구체적인 부위를 입력하면 나중에 찾기 쉬워요
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-br from-[#3182F6]/10 to-[#17171C] rounded-3xl p-5 border border-[#3182F6]/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#3182F6]/20 border border-[#3182F6]/30 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💡</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white mb-2">
                  커스텀 종목이란?
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  등록되지 않은 운동을 추가할 수 있어요. <br />
                  요가, 스트레칭, 달리기 등 다양한 활동을 자유롭게 추가해보세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Suspense로 감싼 진입점
export default function CustomExercisePage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-[110] bg-[#101012]">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#3182F6]/20 border-t-[#3182F6] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/60 text-sm">로딩 중...</p>
            </div>
          </div>
        </div>
      }
    >
      <CustomExerciseContent />
    </Suspense>
  );
}
