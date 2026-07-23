"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { inquiryApi } from "@/lib/api";
import type { InquiryResponse } from "@/lib/types";
import { INQUIRY_CATEGORY_LABEL } from "@/lib/types";

interface InquiryDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inquiry: InquiryResponse | null;
  onUpdated: (updated: InquiryResponse) => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between border-b border-border py-2.5 last:border-0">
      <span className="w-20 shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function InquiryDetailModal({
  open,
  onOpenChange,
  inquiry,
  onUpdated,
}: InquiryDetailModalProps) {
  const [answer, setAnswer] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!inquiry) return null;

  const handleAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const updated = await inquiryApi.answer(inquiry.id, answer.trim());
      onUpdated(updated);
      setAnswer("");
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = () => {
    setAnswer(inquiry.answer ?? "");
    setEditing(true);
  };

  const cancelEdit = () => {
    setAnswer("");
    setEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>문의 #{inquiry.id}</DialogTitle>
            <Badge variant={inquiry.answer ? "default" : "destructive"}>
              {inquiry.answer ? "답변완료" : "대기중"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              문의 정보
            </p>
            <div className="rounded-lg border border-border px-4">
              <Row label="유형" value={INQUIRY_CATEGORY_LABEL[inquiry.category]} />
              <Row label="작성자" value={inquiry.nickname} />
              <Row
                label="작성일"
                value={new Date(inquiry.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              문의 내용
            </p>
            <div className="rounded-lg border border-border px-4 py-3">
              <p className="mb-1 text-sm font-semibold text-foreground">{inquiry.title}</p>
              <p className="whitespace-pre-wrap break-words text-sm text-foreground/80">
                {inquiry.content}
              </p>
            </div>
          </section>

          {inquiry.answer && !editing ? (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  답변
                </p>
                <Button variant="ghost" size="sm" onClick={startEdit}>
                  수정
                </Button>
              </div>
              <div className="rounded-lg border border-border px-4 py-3">
                <p className="whitespace-pre-wrap break-words text-sm text-foreground/80">
                  {inquiry.answer}
                </p>
                {inquiry.answeredAt && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(inquiry.answeredAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </section>
          ) : (
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {editing ? "답변 수정" : "답변 작성"}
              </p>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="답변을 입력하세요..."
                rows={4}
                className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="mt-2 flex justify-end gap-2">
                {editing && (
                  <Button variant="ghost" size="sm" onClick={cancelEdit}>
                    취소
                  </Button>
                )}
                <Button size="sm" onClick={handleAnswer} disabled={loading || !answer.trim()}>
                  {loading ? "전송 중..." : editing ? "수정 완료" : "답변 등록"}
                </Button>
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
