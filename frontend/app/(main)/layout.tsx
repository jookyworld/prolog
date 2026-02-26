"use client";

import { AuthGuard } from "@/components/auth-guard";
import { BottomNav } from "@/components/bottom-nav";
import { RoutineBottomSheet } from "@/components/routine-bottom-sheet";
import { useState } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  return (
    <AuthGuard>
      <main className="min-h-screen pt-safe pb-24">{children}</main>

      <BottomNav onWorkoutClick={() => setIsBottomSheetOpen(true)} />

      <RoutineBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        onSelectRoutine={(id) => {
          console.log("Selected:", id);
          setIsBottomSheetOpen(false);
        }}
      />
    </AuthGuard>
  );
}
