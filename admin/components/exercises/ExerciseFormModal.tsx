"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { BODY_PARTS, type BodyPart, type AdminExerciseResponse } from "@/lib/types";

interface ExerciseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise?: AdminExerciseResponse | null;
  onSubmit: (data: { name: string; bodyPart: BodyPart; partDetail?: string }) => Promise<void>;
}

export function ExerciseFormModal({
  open,
  onOpenChange,
  exercise,
  onSubmit,
}: ExerciseFormModalProps) {
  const isEdit = !!exercise;

  const [name, setName] = useState("");
  const [bodyPart, setBodyPart] = useState<BodyPart>("가슴");
  const [partDetail, setPartDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(exercise?.name ?? "");
      setBodyPart(exercise?.bodyPart ?? "가슴");
      setPartDetail(exercise?.partDetail ?? "");
      setError("");
    }
  }, [open, exercise]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");
    try {
      await onSubmit({
        name: name.trim(),
        bodyPart,
        partDetail: partDetail.trim() || undefined,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="w-[440px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "운동 수정" : "운동 추가"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">운동명 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 벤치프레스"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bodyPart">부위 *</Label>
            <Select
              id="bodyPart"
              value={bodyPart}
              onChange={(e) => setBodyPart(e.target.value as BodyPart)}
            >
              {BODY_PARTS.map((bp) => (
                <option key={bp} value={bp}>
                  {bp}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="partDetail">세부 부위</Label>
            <Input
              id="partDetail"
              value={partDetail}
              onChange={(e) => setPartDetail(e.target.value)}
              placeholder="예: 전면 어깨 (선택)"
            />
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "저장 중..." : isEdit ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
