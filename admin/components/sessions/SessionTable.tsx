"use client";

import type { AdminWorkoutSessionResponse } from "@/lib/types";

interface SessionTableProps {
  sessions: AdminWorkoutSessionResponse[];
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return "-";
  if (minutes < 60) return `${minutes}분`;
  return `${Math.floor(minutes / 60)}시간 ${minutes % 60}분`;
}

export function SessionTable({ sessions }: SessionTableProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border py-16">
        <p className="text-sm text-muted-foreground">세션이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/30">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">유저</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">루틴</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">완료일</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">소요 시간</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session, i) => (
            <tr
              key={session.id}
              className={[
                "transition-colors",
                i < sessions.length - 1 ? "border-b border-border" : "",
              ].join(" ")}
            >
              <td className="px-4 py-3 font-medium text-foreground">{session.userNickname}</td>
              <td className="px-4 py-3 text-muted-foreground">{session.routineTitle}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(session.completedAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatDuration(session.durationMinutes)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
