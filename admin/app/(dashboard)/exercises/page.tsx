"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ExerciseTable } from "@/components/exercises/ExerciseTable";
import { ExerciseFormModal } from "@/components/exercises/ExerciseFormModal";
import { exerciseApi } from "@/lib/api";
import {
  BODY_PARTS,
  type AdminExerciseResponse,
  type BodyPart,
} from "@/lib/types";

type FilterType = "ALL" | "OFFICIAL" | "CUSTOM";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<AdminExerciseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 필터 상태
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [filterBodyPart, setFilterBodyPart] = useState<BodyPart | "ALL">("ALL");

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminExerciseResponse | null>(null);

  const fetchExercises = async () => {
    try {
      const data = await exerciseApi.getAll();
      setExercises(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "불러오기 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const filtered = useMemo(() => {
    const tokens = search
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    return exercises.filter((ex) => {
      if (tokens.length > 0) {
        const targets = [
          ex.name,
          ex.bodyPart,
          ex.partDetail ?? "",
        ].map((s) => s.toLowerCase());

        const allMatch = tokens.every((token) =>
          targets.some((t) => t.includes(token))
        );
        if (!allMatch) return false;
      }
      if (filterType === "OFFICIAL" && ex.custom) return false;
      if (filterType === "CUSTOM" && !ex.custom) return false;
      if (filterBodyPart !== "ALL" && ex.bodyPart !== filterBodyPart)
        return false;
      return true;
    });
  }, [exercises, search, filterType, filterBodyPart]);

  const handleAdd = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const handleEdit = (exercise: AdminExerciseResponse) => {
    setEditTarget(exercise);
    setModalOpen(true);
  };

  const handleSubmit = async (data: {
    name: string;
    bodyPart: BodyPart;
    partDetail?: string;
  }) => {
    if (editTarget) {
      const updated = await exerciseApi.update(editTarget.id, data);
      setExercises((prev) =>
        prev.map((ex) => (ex.id === updated.id ? updated : ex))
      );
    } else {
      const created = await exerciseApi.create(data);
      setExercises((prev) => [...prev, created]);
    }
  };

  const officialCount = exercises.filter((e) => !e.custom).length;
  const customCount = exercises.filter((e) => e.custom).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">운동 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            공식 {officialCount}개 · 커스텀 {customCount}개
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          운동 추가
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="운동명 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-48"
        />
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as FilterType)}
          className="w-32"
        >
          <option value="ALL">전체</option>
          <option value="OFFICIAL">공식</option>
          <option value="CUSTOM">커스텀</option>
        </Select>
        <Select
          value={filterBodyPart}
          onChange={(e) =>
            setFilterBodyPart(e.target.value as BodyPart | "ALL")
          }
          className="w-32"
        >
          <option value="ALL">전체 부위</option>
          {BODY_PARTS.map((bp) => (
            <option key={bp} value={bp}>
              {bp}
            </option>
          ))}
        </Select>
        {(search || filterType !== "ALL" || filterBodyPart !== "ALL") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setFilterType("ALL");
              setFilterBodyPart("ALL");
            }}
          >
            초기화
          </Button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {filtered.length}개 표시 중 (전체 {exercises.length}개)
          </p>
          <ExerciseTable exercises={filtered} onEdit={handleEdit} />
        </>
      )}

      {/* Modal */}
      <ExerciseFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        exercise={editTarget}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
