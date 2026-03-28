"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Flag,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  {
    label: "대시보드",
    href: "/dashboard",
    icon: LayoutDashboard,
    available: true,
  },
  {
    label: "유저 관리",
    href: "/users",
    icon: Users,
    available: true,
  },
  {
    label: "운동 관리",
    href: "/exercises",
    icon: Dumbbell,
    available: true,
  },
  {
    label: "신고 관리",
    href: "/reports",
    icon: Flag,
    available: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <span className="text-lg font-bold text-foreground">ProLog</span>
        <span className="ml-2 rounded-md bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          if (!item.available) {
            return (
              <div
                key={item.href}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground/40"
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{item.label}</span>
                <span className="ml-auto text-xs">준비 중</span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
            </Link>
          );
        })}
      </nav>

      {/* User info + Logout */}
      <div className="border-t border-border p-4">
        {user && (
          <div className="mb-3 px-1">
            <p className="text-sm font-medium text-foreground">{user.nickname}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </aside>
  );
}
