"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AdminExerciseResponse } from "@/lib/types";

interface ExerciseTableProps {
  exercises: AdminExerciseResponse[];
  onEdit: (exercise: AdminExerciseResponse) => void;
}

export function ExerciseTable({ exercises, onEdit }: ExerciseTableProps) {
  if (exercises.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border py-16">
        <p className="text-sm text-muted-foreground">운동 종목이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/30">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">운동명</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">부위</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">세부 부위</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">구분</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">생성자</th>
            <th className="w-16 px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {exercises.map((ex, i) => (
            <tr
              key={ex.id}
              className={
                i < exercises.length - 1 ? "border-b border-border" : ""
              }
            >
              <td className="px-4 py-3 font-medium text-foreground">{ex.name}</td>
              <td className="px-4 py-3 text-foreground">{ex.bodyPart}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {ex.partDetail ?? "-"}
              </td>
              <td className="px-4 py-3">
                {ex.custom ? (
                  <Badge variant="secondary">커스텀</Badge>
                ) : (
                  <Badge variant="default">공식</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {ex.createdBy ? ex.createdBy.nickname : "-"}
              </td>
              <td className="px-4 py-3">
                {!ex.custom && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(ex)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
