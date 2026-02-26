"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  ArchiveRestore,
  Folder,
  MoreHorizontal,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type MuscleFilter = "전체" | "가슴" | "등" | "하체" | "어깨";

type Routine = {
  id: string;
  title: string;
  description?: string; // 루틴 설명
  tags: string[]; // 예: ["등", "이두"]
  lastDoneText: string; // 예: "2일 전 수행"
  isActive: boolean; // 보관 여부 (true: 활성, false: 보관됨)
};

const FILTERS: MuscleFilter[] = ["전체", "가슴", "등", "하체", "어깨"];

export default function RoutinePage() {
  const router = useRouter();

  // ✅ mock data (나중에 API로 교체)
  const [routines, setRoutines] = useState<Routine[]>([
    {
      id: "1",
      title: "4분할 등/이두",
      description: "광배근과 이두근을 집중적으로 단련하는 루틴",
      tags: ["등", "이두"],
      lastDoneText: "2일 전 수행",
      isActive: true,
    },
    {
      id: "2",
      title: "가슴/삼두 집중",
      description: "대흉근과 삼두근 발달을 위한 고강도 운동",
      tags: ["가슴", "삼두"],
      lastDoneText: "5일 전 수행",
      isActive: true,
    },
    {
      id: "3",
      title: "하체 킬러",
      description: "하체 근력과 근비대를 위한 강도 높은 프로그램",
      tags: ["하체"],
      lastDoneText: "1주 전 수행",
      isActive: true,
    },
    {
      id: "4",
      title: "어깨/코어",
      description: "삼각근 발달과 코어 안정화 운동",
      tags: ["어깨", "코어"],
      lastDoneText: "3일 전 수행",
      isActive: false, // 보관된 루틴 예시
    },
  ]);

  const [filter, setFilter] = useState<MuscleFilter>("전체");
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false); // 보관된 루틴 보기 상태
  const [isSearchVisible, setIsSearchVisible] = useState(false); // 검색창 표시 상태
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 활성 루틴과 보관된 루틴 분리
  const activeRoutines = useMemo(() => {
    return routines.filter((r) => r.isActive);
  }, [routines]);

  const archivedRoutines = useMemo(() => {
    return routines.filter((r) => !r.isActive);
  }, [routines]);

  // 현재 보기 모드에 따라 표시할 루틴 결정
  const targetRoutines = showArchived ? archivedRoutines : activeRoutines;

  const visibleRoutines = useMemo(() => {
    const q = query.trim().toLowerCase();

    return targetRoutines.filter((r) => {
      const matchesFilter =
        filter === "전체" ? true : r.tags.some((t) => t === filter);

      const matchesQuery =
        q.length === 0
          ? true
          : r.title.toLowerCase().includes(q) ||
            r.tags.some((t) => t.toLowerCase().includes(q));

      return matchesFilter && matchesQuery;
    });
  }, [targetRoutines, filter, query]);

  // 루틴 보관 함수
  const archiveRoutine = (id: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: false } : r))
    );
  };

  // 루틴 활성화 함수
  const restoreRoutine = (id: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: true } : r))
    );
  };

  // 루틴 완전 삭제 함수
  const deleteRoutine = async (id: string) => {
    if (
      !confirm("루틴을 삭제하시겠습니까?\n(이전 운동 기록은 삭제되지 않습니다)")
    ) {
      return;
    }

    try {
      // TODO: 실제 API 호출로 대체
      // const response = await fetch(`/api/routines/${id}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) throw new Error('Failed to delete routine');

      console.log(`DELETE /api/routines/${id}`);

      // 성공 시 클라이언트 state에서 제거
      setRoutines((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Failed to delete routine:", error);
      alert("루틴 삭제에 실패했습니다.");
    }
  };

  const isEmpty = activeRoutines.length === 0 && archivedRoutines.length === 0;

  // 검색창이 열릴 때 자동 포커스
  useEffect(() => {
    if (isSearchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchVisible]);

  // 검색창을 토글하는 함수
  const toggleSearch = () => {
    if (isSearchVisible && query) {
      // 검색창이 열려있고 검색어가 있으면 먼저 검색어를 초기화
      setQuery("");
    } else {
      // 검색창 토글
      setIsSearchVisible(!isSearchVisible);
    }
  };

  return (
    <div className="min-h-screen bg-[#101012] text-white pb-32">
      {/* Header - Type B (List/Action) */}
      <header className="sticky top-0 z-50 bg-[#101012]/90 backdrop-blur-xl border-b border-white/5">
        <div className="h-14 px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">루틴</h1>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSearch}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                isSearchVisible
                  ? "bg-[#3182F6]/15 text-[#3182F6]"
                  : "hover:bg-white/5 text-white/80"
              }`}
              aria-label="루틴 검색"
            >
              {isSearchVisible && query ? (
                <X className="w-5 h-5" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => {
                setShowArchived(!showArchived);
                setFilter("전체"); // 보관함 진입 시 필터 초기화
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                showArchived
                  ? "bg-[#3182F6]/15 text-[#3182F6]"
                  : "hover:bg-white/5 text-white/80"
              }`}
              aria-label="보관된 루틴 보기"
            >
              <Folder className="w-5 h-5" />
            </button>

            <button
              onClick={() => router.push("/routine/new")}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors"
              aria-label="루틴 추가"
            >
              <Plus className="w-5 h-5 text-white/80" />
            </button>
          </div>
        </div>

        {/* Search Input (Animated) */}
        <AnimatePresence>
          {isSearchVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden border-t border-white/5"
            >
              <div className="h-12 px-6 flex items-center">
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="루틴 이름 또는 태그로 검색"
                  className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/40"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="px-6 pt-6 space-y-6">
        {/* Filter Chips (Optional / scalable) */}
        {!isEmpty && (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-6 px-6 pb-1">
            {FILTERS.map((f) => {
              const active = f === filter;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`shrink-0 min-w-fit px-4 py-2.5 rounded-full text-sm font-medium transition-all border ${
                    active
                      ? "bg-[#3182F6] text-white border-transparent shadow-lg shadow-[#3182F6]/25"
                      : "bg-[#17171C] text-white/70 border-white/10 hover:text-white hover:border-white/20"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {isEmpty ? (
          <div className="bg-[#17171C] rounded-3xl p-8 border border-white/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#3182F6]/15 border border-[#3182F6]/20 flex items-center justify-center flex-shrink-0">
                <Tag className="w-6 h-6 text-[#3182F6]" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">
                  아직 만든 루틴이 없어요.
                </h2>
                <p className="text-sm text-white/60 leading-relaxed mb-6">
                  첫 루틴을 만들어두면 운동 기록이 훨씬 빨라져요.
                </p>

                <Button
                  onClick={() => router.push("/routine/new")}
                  className="w-full h-14 rounded-2xl bg-[#3182F6] hover:bg-[#2563EB] text-white font-bold text-base shadow-xl shadow-[#3182F6]/25"
                >
                  루틴 만들기
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* My Routines Section */}
            <section className="space-y-3">
              <div className="flex items-end justify-between px-1">
                <div>
                  <h2 className="text-lg font-bold">
                    {showArchived ? "보관된 루틴" : "내 루틴"}
                  </h2>
                  <p className="text-sm text-white/50 mt-1">
                    {showArchived
                      ? "보관된 루틴을 다시 활성화하거나 삭제할 수 있어요"
                      : "진행중인 루틴을 빠르게 시작하세요"}
                  </p>
                </div>

                <span className="text-sm text-white/40">
                  {visibleRoutines.length}개
                </span>
              </div>

              {/* Routine Cards - Slimmed Design */}
              <div className="space-y-2.5">
                {visibleRoutines.map((r) => (
                  <div
                    key={r.id}
                    className={`bg-[#17171C] rounded-3xl p-4 border border-white/5 hover:border-white/10 transition-all group ${
                      !r.isActive ? "opacity-50" : ""
                    }`}
                  >
                    {/* Title and settings button row */}
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <button
                        onClick={() => router.push(`/routine/${r.id}`)}
                        className="text-left flex-1 min-w-0"
                      >
                        <h3 className="text-base font-bold leading-tight">
                          {r.title}
                        </h3>
                      </button>

                      {/* More menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
                            aria-label="루틴 메뉴"
                          >
                            <MoreHorizontal className="w-5 h-5 text-white/60" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-[#17171C] border-white/10 text-white min-w-[180px]"
                        >
                          {r.isActive ? (
                            <>
                              <DropdownMenuItem
                                onClick={() => archiveRoutine(r.id)}
                                className="focus:bg-white/5 cursor-pointer"
                              >
                                <Archive className="w-4 h-4 mr-2" />
                                보관하기
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <>
                              <DropdownMenuItem
                                onClick={() => restoreRoutine(r.id)}
                                className="focus:bg-white/5 cursor-pointer"
                              >
                                <ArchiveRestore className="w-4 h-4 mr-2" />
                                다시 활성화
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteRoutine(r.id)}
                                className="focus:bg-red-500/10 text-red-500 hover:text-red-400 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                삭제
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Description */}
                    <button
                      onClick={() => router.push(`/routine/${r.id}`)}
                      className="text-left"
                    >
                      {r.description && (
                        <p className="text-xs text-white/50 mt-0.5 leading-relaxed">
                          {r.description}
                        </p>
                      )}
                    </button>

                    {/* Bottom row: Tags, date, and start button */}
                    <div className="flex items-center justify-between gap-3 mt-2">
                      <button
                        onClick={() => router.push(`/routine/${r.id}`)}
                        className="text-left flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex flex-wrap gap-1.5">
                            {r.tags.map((t) => (
                              <span
                                key={`${r.id}-${t}`}
                                className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 text-white/60 border border-white/10"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-white/40">•</span>
                          <p className="text-xs text-white/40">
                            {r.lastDoneText}
                          </p>
                        </div>
                      </button>

                      {/* Start button - only for active routines */}
                      {r.isActive && (
                        <button
                          onClick={() =>
                            router.push(`/workout/planned?routineId=${r.id}`)
                          }
                          className="px-4 py-2 rounded-xl bg-[#3182F6] hover:bg-[#2563EB] text-white text-xs font-bold transition-colors shadow-lg shadow-[#3182F6]/25 flex-shrink-0"
                        >
                          운동 시작
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* No results after filter/search */}
              {visibleRoutines.length === 0 && (
                <div className="bg-[#17171C] rounded-3xl p-6 border border-white/5">
                  <p className="text-sm text-white/60">
                    조건에 맞는 루틴이 없어요.
                  </p>
                  <div className="flex gap-3 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setQuery("");
                        setFilter("전체");
                      }}
                      className="rounded-2xl border-white/10 text-white/80 hover:bg-white/5 bg-transparent"
                    >
                      필터 초기화
                    </Button>
                    {!showArchived && (
                      <Button
                        onClick={() => router.push("/routine/new")}
                        className="rounded-2xl bg-[#3182F6] hover:bg-[#2563EB] text-white font-bold"
                      >
                        루틴 만들기
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* 보관된 루틴 보기 버튼 (활성 루틴 페이지에서만 표시) */}
              {!showArchived && archivedRoutines.length > 0 && (
                <button
                  onClick={() => setShowArchived(true)}
                  className="w-full bg-gradient-to-br from-white/5 to-white/[0.02] rounded-3xl p-5 border border-white/10 hover:border-[#3182F6]/30 hover:bg-gradient-to-br hover:from-[#3182F6]/10 hover:to-[#3182F6]/5 transition-all group mt-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3182F6]/20 to-[#3182F6]/10 border border-[#3182F6]/20 flex items-center justify-center">
                        <Archive className="w-7 h-7 text-[#3182F6]" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-base font-bold text-white">
                          보관된 루틴
                        </h3>
                        <p className="text-sm text-white/60 mt-0.5">
                          {archivedRoutines.length}개의 루틴이 보관되어 있어요
                        </p>
                      </div>
                    </div>
                    <div className="text-[#3182F6]/60 group-hover:text-[#3182F6] group-hover:translate-x-1 transition-all">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                </button>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
