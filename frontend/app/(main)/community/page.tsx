"use client";

import {
  Bell,
  ChevronRight,
  Download,
  Heart,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Category = "전체" | "가슴" | "등" | "하체" | "린매스업" | "파워리프팅";

type FeedRoutine = {
  id: string;
  title: string;
  author: { name: string; avatarText: string };
  summary: string;
  likes: number;
  copies: number;
  tags: string[]; // 주요 운동 3개 스냅샷
  categories: Category[]; // 필터 매칭용
};

const FILTERS: Category[] = [
  "전체",
  "가슴",
  "등",
  "하체",
  "린매스업",
  "파워리프팅",
];

export default function CommunityPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Category>("전체");

  // ✅ mock data (나중에 API로 교체)
  const feed: FeedRoutine[] = [
    {
      id: "101",
      title: "고수의 5x5 파워 루틴 (전신)",
      author: { name: "철봉왕", avatarText: "철" },
      summary:
        "기본 3대 중심. 중량 증가가 정체될 때, 볼륨은 줄이고 강도를 올리는 방식으로 밀어붙입니다.",
      likes: 1280,
      copies: 7420,
      tags: ["스쿼트", "벤치프레스", "데드리프트"],
      categories: ["파워리프팅", "전체"],
    },
    {
      id: "102",
      title: "린매스업 상체 루틴 (가슴/등)",
      author: { name: "린매스업러", avatarText: "린" },
      summary:
        "RPE 7~8로 유지하면서, 템포(하강 3초)로 자극을 극대화합니다. 회복을 망치지 않는 선이 핵심.",
      likes: 842,
      copies: 3910,
      tags: ["벤치프레스", "랫풀다운", "시티드로우"],
      categories: ["린매스업", "가슴", "등"],
    },
    {
      id: "103",
      title: "하체 킬러 (대퇴사두/둔근)",
      author: { name: "스쿼트중독", avatarText: "스" },
      summary:
        "스쿼트→레그프레스→런지 순서로 고립을 끝까지 가져갑니다. 마지막은 드랍셋으로 마무리.",
      likes: 920,
      copies: 5200,
      tags: ["스쿼트", "레그프레스", "런지"],
      categories: ["하체", "전체"],
    },
    {
      id: "104",
      title: "가슴 집중 (프레스 변형 3종)",
      author: { name: "벤치백번", avatarText: "벤" },
      summary:
        "중량 욕심보다, 가슴 상부/중부/하부 라인 분할. 세트별 ROM을 동일하게 유지하세요.",
      likes: 610,
      copies: 2770,
      tags: ["플랫벤치", "인클라인", "케이블플라이"],
      categories: ["가슴", "린매스업"],
    },
    {
      id: "105",
      title: "등 두께 만드는 루틴 (로우 중심)",
      author: { name: "등광배", avatarText: "등" },
      summary:
        "풀업이 안 늘면 로우 볼륨을 먼저 채우세요. 견갑 하강/후인 고정이 전부입니다.",
      likes: 700,
      copies: 3050,
      tags: ["바벨로우", "원암로우", "풀업"],
      categories: ["등", "전체"],
    },
  ];

  // 상단 배너용 (큐레이션)
  const curated = [
    {
      id: "c1",
      badge: "이번 주 가장 많이 복사됨",
      title: "고수의 5x5 파워 루틴",
      sub: "7,420명 가져감",
      icon: TrendingUp,
    },
    {
      id: "c2",
      badge: "운동 고수 추천",
      title: "린매스업 상체 루틴",
      sub: "회복 망치지 않는 템포",
      icon: Sparkles,
    },
  ];

  const visible = useMemo(() => {
    if (filter === "전체") return feed;
    return feed.filter((r) => r.categories.includes(filter));
  }, [filter]);

  return (
    <div className="min-h-screen bg-[#101012] text-white pb-32">
      {/* Header - Type B (List/Action) */}
      <header className="sticky top-0 z-50 bg-[#101012]/90 backdrop-blur-xl border-b border-white/5">
        <div className="h-14 px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">커뮤니티</h1>
          <div className="flex items-center gap-2">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors"
              aria-label="검색"
              onClick={() => console.log("[v0] open search")}
            >
              <Search className="w-5 h-5 text-white/80" />
            </button>
            <button
              className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors"
              aria-label="알림"
              onClick={() => console.log("[v0] open notifications")}
            >
              <Bell className="w-5 h-5 text-white/80" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#3182F6] rounded-full" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-6 pt-6 space-y-6">
        {/* Top Banner (Carousel) */}
        <section className="-mx-6 px-6">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1">
            {curated.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  onClick={() => router.push("/routine/101")}
                  className="snap-start shrink-0 w-[280px] bg-gradient-to-br from-[#3182F6]/20 via-[#17171C] to-[#45FFBC]/10 rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-colors text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3182F6]" />
                        {c.badge}
                      </div>
                      <h2 className="text-xl font-bold mt-4 leading-tight">
                        {c.title}
                      </h2>
                      <p className="text-xs text-white/60 mt-2">{c.sub}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#3182F6]/15 border border-[#3182F6]/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-[#3182F6]" />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-white/60">루틴 상세 보기</p>
                    <ChevronRight className="w-5 h-5 text-white/40" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Filter Chips */}
        <section>
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
        </section>

        {/* Routine Feed List */}
        <section className="space-y-3">
          {visible.map((r) => (
            <button
              key={r.id}
              onClick={() => router.push(`/routine/${r.id}`)}
              className="w-full text-left bg-[#17171C] rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-colors"
            >
              {/* Title */}
              <h3 className="text-lg font-bold leading-tight">{r.title}</h3>

              {/* Author row */}
              <div className="flex items-center gap-3 mt-4">
                <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white/80">
                  {r.author.avatarText}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white/80">
                    {r.author.name}
                  </p>
                  <p className="text-xs text-white/40">루틴 제작자</p>
                </div>
              </div>

              {/* Summary */}
              <p className="text-sm text-white/70 leading-relaxed mt-4 line-clamp-2">
                {r.summary}
              </p>

              {/* Snapshot tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {r.tags.slice(0, 3).map((t) => (
                  <span
                    key={`${r.id}-${t}`}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/70 border border-white/10"
                  >
                    {t}
                  </span>
                ))}
                {r.tags.length > 3 && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/50 border border-white/10">
                    +{r.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-4 mt-5 pt-5 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-white/50" />
                  <span className="text-sm font-bold">{r.likes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#3182F6]" />
                  <span className="text-sm font-bold text-[#3182F6]">
                    {r.copies}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </section>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => router.push("/community/new")}
        className="fixed right-6 bottom-22 z-40 flex items-center gap-2 px-5 h-14 rounded-full bg-[#3182F6] hover:bg-[#2563EB] text-white font-bold shadow-xl shadow-[#3182F6]/30 transition-all active:scale-95"
        aria-label="글쓰기"
      >
        <Plus className="w-5 h-5" />
        공유하기
      </button>
    </div>
  );
}
