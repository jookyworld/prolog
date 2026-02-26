"use client";

import { Dumbbell, Home, LayoutGrid, User, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface BottomNavProps {
  onWorkoutClick?: () => void;
}

export function BottomNav({ onWorkoutClick }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: "홈", icon: Home, path: "/" },
    { label: "루틴", icon: LayoutGrid, path: "/routine" },
    { label: "커뮤니티", icon: Users, path: "/community" },
    { label: "내 정보", icon: User, path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#17171C] border-t border-white/5 rounded-t-3xl z-50">
      <div className="flex items-end justify-around px-4 pt-2 pb-safe max-w-lg mx-auto">
        {/* 좌측 2개 탭 */}
        {navItems.slice(0, 2).map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[64px] transition-colors ${
              pathname === item.path
                ? "text-[#3182F6]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <item.icon className="w-6 h-6" strokeWidth={2} />
            <span className="text-[11px] font-medium mt-0.5">{item.label}</span>
          </button>
        ))}

        {/* 중앙 운동 버튼 - 플로팅 효과 */}
        <div className="flex flex-col items-center -mt-6 min-w-[72px]">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (onWorkoutClick) {
                onWorkoutClick();
              } else {
                router.push("/workout");
              }
            }}
            className="flex flex-col items-center"
          >
            <div className="bg-[#3182F6] hover:bg-[#2563EB] rounded-full p-3.5 shadow-xl shadow-[#3182F6]/40 transition-all active:scale-95">
              <Dumbbell className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span
              className={`text-[11px] font-medium mt-1.5 ${
                pathname === "/workout" ? "text-[#3182F6]" : "text-white/70"
              }`}
            >
              운동
            </span>
          </button>
        </div>

        {/* 우측 2개 탭 */}
        {navItems.slice(2).map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[64px] transition-colors ${
              pathname === item.path
                ? "text-[#3182F6]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <item.icon className="w-6 h-6" strokeWidth={2} />
            <span className="text-[11px] font-medium mt-0.5">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
