"use client";

import { Plus, X } from "lucide-react";
import type { Exercise } from "./types";

interface ExerciseNavigationProps {
  exercises: Exercise[];
  currentIndex: number;
  onSelectExercise: (index: number) => void;
  onAddExercise: () => void;
  onRemoveExercise: (index: number) => void;
}

export function ExerciseNavigation({
  exercises,
  currentIndex,
  onSelectExercise,
  onAddExercise,
  onRemoveExercise,
}: ExerciseNavigationProps) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
      {exercises.map((exercise, idx) => (
        <div
          key={exercise.id}
          className={`min-w-fit rounded-xl transition-all ${
            idx === currentIndex
              ? "bg-[#3182F6] text-white"
              : "bg-[#17171C] text-white/60"
          }`}
        >
          <div className="flex items-center">
            <button
              onClick={() => onSelectExercise(idx)}
              className="px-4 py-2.5 text-sm font-medium whitespace-nowrap hover:opacity-90 transition-opacity"
            >
              {exercise.name}
            </button>
            {idx === currentIndex && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveExercise(idx);
                }}
                className="pr-2 pl-1 py-2.5 opacity-40 hover:opacity-100 transition-opacity"
                style={{ minWidth: "32px", minHeight: "32px" }}
                aria-label="종목 삭제"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* 종목 추가 버튼 */}
      <button
        onClick={onAddExercise}
        className="min-w-fit px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all border border-dashed border-white/20 flex items-center gap-1.5"
      >
        <Plus className="w-4 h-4" />
        종목 추가
      </button>
    </div>
  );
}
