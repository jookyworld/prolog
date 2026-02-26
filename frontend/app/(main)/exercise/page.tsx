"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Check, PlusCircle, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

type BodyPart =
  | "전체"
  | "가슴"
  | "등"
  | "어깨"
  | "하체"
  | "팔"
  | "코어"
  | "유산소"
  | "기타";

type Exercise = {
  id: string;
  name: string;
  body_part: string;
  part_detail?: string;
};

// TODO: DB의 exercises 테이블에서 가져오도록 변경
const MOCK_EXERCISES: Exercise[] = [
  // 가슴
  {
    id: "ex1",
    name: "벤치프레스",
    body_part: "가슴",
    part_detail: "가슴 전체",
  },
  {
    id: "ex2",
    name: "인클라인 벤치프레스",
    body_part: "가슴",
    part_detail: "상부 가슴",
  },
  {
    id: "ex3",
    name: "덤벨 프레스",
    body_part: "가슴",
    part_detail: "가슴 전체",
  },
  {
    id: "ex4",
    name: "케이블 플라이",
    body_part: "가슴",
    part_detail: "가슴 중앙",
  },
  { id: "ex5", name: "푸쉬업", body_part: "가슴", part_detail: "가슴 전체" },
  { id: "ex6", name: "딥스", body_part: "가슴", part_detail: "하부 가슴" },

  // 등
  {
    id: "ex7",
    name: "데드리프트",
    body_part: "등",
    part_detail: "등 전체",
  },
  { id: "ex8", name: "풀업", body_part: "등", part_detail: "광배근" },
  {
    id: "ex9",
    name: "랫 풀다운",
    body_part: "등",
    part_detail: "광배근",
  },
  { id: "ex10", name: "바벨 로우", body_part: "등", part_detail: "등 중앙" },
  {
    id: "ex11",
    name: "시티드 로우",
    body_part: "등",
    part_detail: "등 중앙",
  },
  { id: "ex12", name: "덤벨 로우", body_part: "등", part_detail: "광배근" },

  // 어깨
  {
    id: "ex13",
    name: "오버헤드 프레스",
    body_part: "어깨",
    part_detail: "전면 삼각근",
  },
  {
    id: "ex14",
    name: "사이드 레터럴 레이즈",
    body_part: "어깨",
    part_detail: "측면 삼각근",
  },
  {
    id: "ex15",
    name: "프론트 레이즈",
    body_part: "어깨",
    part_detail: "전면 삼각근",
  },
  {
    id: "ex16",
    name: "리어 델트 플라이",
    body_part: "어깨",
    part_detail: "후면 삼각근",
  },
  {
    id: "ex17",
    name: "페이스 풀",
    body_part: "어깨",
    part_detail: "후면 삼각근",
  },

  // 하체
  {
    id: "ex18",
    name: "스쿼트",
    body_part: "하체",
    part_detail: "대퇴사두근",
  },
  {
    id: "ex19",
    name: "레그프레스",
    body_part: "하체",
    part_detail: "대퇴사두근",
  },
  { id: "ex20", name: "레그 컬", body_part: "하체", part_detail: "햄스트링" },
  {
    id: "ex21",
    name: "레그 익스텐션",
    body_part: "하체",
    part_detail: "대퇴사두근",
  },
  {
    id: "ex22",
    name: "런지",
    body_part: "하체",
    part_detail: "하체 전체",
  },
  {
    id: "ex23",
    name: "불가리안 스쿼트",
    body_part: "하체",
    part_detail: "대퇴사두근",
  },
  {
    id: "ex24",
    name: "카프 레이즈",
    body_part: "하체",
    part_detail: "종아리",
  },

  // 팔
  {
    id: "ex25",
    name: "바벨 컬",
    body_part: "팔",
    part_detail: "이두근",
  },
  { id: "ex26", name: "덤벨 컬", body_part: "팔", part_detail: "이두근" },
  {
    id: "ex27",
    name: "해머 컬",
    body_part: "팔",
    part_detail: "이두근",
  },
  {
    id: "ex28",
    name: "트라이셉스 익스텐션",
    body_part: "팔",
    part_detail: "삼두근",
  },
  {
    id: "ex29",
    name: "케이블 푸쉬다운",
    body_part: "팔",
    part_detail: "삼두근",
  },
  {
    id: "ex30",
    name: "스컬 크러셔",
    body_part: "팔",
    part_detail: "삼두근",
  },

  // 코어
  {
    id: "ex31",
    name: "플랭크",
    body_part: "코어",
    part_detail: "복부 전체",
  },
  {
    id: "ex32",
    name: "크런치",
    body_part: "코어",
    part_detail: "복직근",
  },
  {
    id: "ex33",
    name: "레그레이즈",
    body_part: "코어",
    part_detail: "하복부",
  },
  {
    id: "ex34",
    name: "러시안 트위스트",
    body_part: "코어",
    part_detail: "복사근",
  },
  {
    id: "ex35",
    name: "케이블 크런치",
    body_part: "코어",
    part_detail: "복직근",
  },

  // 유산소
  {
    id: "ex36",
    name: "러닝",
    body_part: "유산소",
    part_detail: "전신",
  },
  {
    id: "ex37",
    name: "사이클",
    body_part: "유산소",
    part_detail: "하체",
  },
  {
    id: "ex38",
    name: "로잉 머신",
    body_part: "유산소",
    part_detail: "전신",
  },
  {
    id: "ex39",
    name: "버피",
    body_part: "유산소",
    part_detail: "전신",
  },
  {
    id: "ex40",
    name: "점프 로프",
    body_part: "유산소",
    part_detail: "전신",
  },

  // 기타
  {
    id: "ex41",
    name: "스트레칭",
    body_part: "기타",
    part_detail: "전신",
  },
  {
    id: "ex42",
    name: "요가",
    body_part: "기타",
    part_detail: "전신",
  },
];

const BODY_PARTS: BodyPart[] = [
  "전체",
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
function ExerciseSelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const from = searchParams.get("from") || "routine";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart>("전체");
  const [selectedExercises, setSelectedExercises] = useState<
    Map<string, Exercise>
  >(new Map());

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const filteredExercises = useMemo(() => {
    let filtered = MOCK_EXERCISES;

    // 부위 필터
    if (selectedBodyPart !== "전체") {
      filtered = filtered.filter((ex) => ex.body_part === selectedBodyPart);
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((ex) => ex.name.toLowerCase().includes(query));
    }

    return filtered;
  }, [searchQuery, selectedBodyPart]);

  const toggleExercise = (exercise: Exercise) => {
    setSelectedExercises((prev) => {
      const next = new Map(prev);
      if (next.has(exercise.id)) {
        next.delete(exercise.id);
      } else {
        next.set(exercise.id, exercise);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    if (selectedExercises.size === 0) return;

    const exercises = Array.from(selectedExercises.values()).map((ex) => ({
      id: ex.id,
      name: ex.name,
    }));

    localStorage.setItem("selected_exercises", JSON.stringify(exercises));

    // from 파라미터에 따라 다른 페이지로 이동
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

  const goToCustomExercise = () => {
    const trimmedQuery = searchQuery.trim();
    const params = new URLSearchParams();
    if (trimmedQuery) {
      params.set("name", trimmedQuery);
    }
    params.set("from", from);
    router.push(`/exercise/custom?${params.toString()}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="fixed inset-0 z-[110] bg-[#101012] overflow-y-auto">
      <div className="min-h-screen text-white pb-32">
        {/* Header - Type B (List/Action) */}
        <header className="sticky top-0 z-50 bg-[#101012]/90 backdrop-blur-xl border-b border-white/5">
          <div className="h-14 px-6 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
              aria-label="뒤로가기"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <h1 className="text-lg font-bold tracking-tight">종목 선택</h1>

            <button
              onClick={handleConfirm}
              disabled={selectedExercises.size === 0}
              className={`px-3 py-1.5 text-sm font-bold transition-colors ${
                selectedExercises.size > 0
                  ? "text-[#3182F6] hover:text-[#2563EB]"
                  : "text-white/30 cursor-not-allowed"
              }`}
            >
              확인
              {selectedExercises.size > 0 && ` (${selectedExercises.size})`}
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="px-6 pt-4 space-y-4">
          {/* Category Filter Chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {BODY_PARTS.map((part) => {
              const isActive = selectedBodyPart === part;
              return (
                <button
                  key={part}
                  onClick={() => setSelectedBodyPart(part)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-[#3182F6] text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {part}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="종목명으로 검색"
              className="w-full bg-[#17171C] pl-12 pr-4 py-3.5 text-sm text-white placeholder:text-white/30 rounded-2xl outline-none focus:bg-white/[0.07] transition-colors"
            />
          </div>

          {/* Exercise List */}
          <div className="space-y-2">
            {filteredExercises.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <Search className="w-8 h-8 text-white/30" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-white/60 text-sm">검색 결과가 없습니다</p>
                  <p className="text-white/40 text-xs">
                    찾는 종목이 없으신가요?
                  </p>
                </div>
                <button
                  onClick={goToCustomExercise}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#3182F6] hover:bg-[#2563EB] text-white text-sm font-bold rounded-xl transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  커스텀 종목 추가하기
                </button>
              </div>
            ) : (
              <>
                {filteredExercises.map((exercise) => {
                  const isSelected = selectedExercises.has(exercise.id);
                  return (
                    <motion.button
                      key={exercise.id}
                      onClick={() => toggleExercise(exercise)}
                      className={`w-full p-4 rounded-2xl text-left transition-all ${
                        isSelected
                          ? "bg-[#3182F6]/10 border-2 border-[#3182F6]"
                          : "bg-[#17171C] border-2 border-transparent hover:bg-white/[0.07]"
                      }`}
                      initial={false}
                      animate={{
                        scale: isSelected ? 0.98 : 1,
                      }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white mb-1">
                            {exercise.name}
                          </h3>
                          {exercise.part_detail && (
                            <p className="text-xs text-white/40">
                              {exercise.part_detail}
                            </p>
                          )}
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            isSelected
                              ? "bg-[#3182F6]"
                              : "bg-white/5 border border-white/10"
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}

                {/* Custom Exercise CTA at bottom of list */}
                <button
                  onClick={goToCustomExercise}
                  className="w-full p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-dashed border-white/10 text-white/60 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    찾는 종목이 없나요? 직접 추가하기
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Suspense로 감싼 진입점
export default function ExerciseSelectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#101012]">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#3182F6]/20 border-t-[#3182F6] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/60 text-sm">종목 불러오는 중...</p>
            </div>
          </div>
        </div>
      }
    >
      <ExerciseSelectContent />
    </Suspense>
  );
}
