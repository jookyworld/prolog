"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { UserResponse } from "@/lib/types";

interface UserDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponse | null;
}

const GENDER_LABEL: Record<string, string> = {
  MALE: "남성",
  FEMALE: "여성",
  UNKNOWN: "미설정",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function UserDetailModal({ open, onOpenChange, user }: UserDetailModalProps) {
  if (!user) return null;

  const joinedAt = new Date(user.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric",
  });

  const marketingConsent = user.marketingConsentedAt
    ? `동의 (${new Date(user.marketingConsentedAt).toLocaleDateString("ko-KR")})`
    : "미동의";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>{user.nickname}</DialogTitle>
            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
              {user.role}
            </Badge>
          </div>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">계정 정보</p>
            <div className="rounded-lg border border-border px-4">
              <Row label="아이디" value={user.username} />
              <Row label="이메일" value={user.email} />
              <Row label="가입일" value={joinedAt} />
              <Row label="마케팅 동의" value={marketingConsent} />
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">신체 정보</p>
            <div className="rounded-lg border border-border px-4">
              <Row label="성별" value={GENDER_LABEL[user.gender] ?? user.gender} />
              <Row label="키" value={user.height > 0 ? `${user.height} cm` : "미설정"} />
              <Row label="몸무게" value={user.weight > 0 ? `${user.weight} kg` : "미설정"} />
              <Row label="출생년도" value={user.birthYear ?? "미설정"} />
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
