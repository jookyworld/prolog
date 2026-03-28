"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { reportApi } from "@/lib/api";
import type { AdminReportResponse, ReportStatus } from "@/lib/types";
import {
  REPORT_REASON_LABEL,
  REPORT_STATUS_LABEL,
  REPORT_TARGET_LABEL,
} from "@/lib/types";

interface ReportDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: AdminReportResponse | null;
  onUpdated: (updated: AdminReportResponse) => void;
  onRefresh: () => void;
}

const STATUS_VARIANT: Record<ReportStatus, "default" | "secondary" | "destructive"> = {
  PENDING: "destructive",
  RESOLVED: "default",
  DISMISSED: "secondary",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground shrink-0 w-28">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

export function ReportDetailModal({
  open,
  onOpenChange,
  report,
  onUpdated,
  onRefresh,
}: ReportDetailModalProps) {
  const [loading, setLoading] = useState(false);

  if (!report) return null;

  const handleStatus = async (status: ReportStatus) => {
    setLoading(true);
    try {
      const updated = await reportApi.updateStatus(report.id, status);
      onUpdated(updated);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("해당 콘텐츠를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    setLoading(true);
    try {
      if (report.targetType === "ROUTINE") {
        await reportApi.deleteRoutine(report.targetId);
      } else {
        await reportApi.deleteComment(report.targetId);
      }
      onOpenChange(false);
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="w-[520px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>신고 #{report.id}</DialogTitle>
            <Badge variant={STATUS_VARIANT[report.status]}>
              {REPORT_STATUS_LABEL[report.status]}
            </Badge>
          </div>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              신고 정보
            </p>
            <div className="rounded-lg border border-border px-4">
              <Row label="유형" value={REPORT_TARGET_LABEL[report.targetType]} />
              <Row label="신고 사유" value={REPORT_REASON_LABEL[report.reason]} />
              <Row label="신고자" value={report.reporterNickname} />
              <Row
                label="신고일"
                value={new Date(report.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              대상 콘텐츠
            </p>
            <div className="rounded-lg border border-border px-4 py-3">
              <p className="text-sm text-foreground break-words">{report.targetPreview}</p>
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              처리
            </p>
            {report.status === "RESOLVED" ? (
              <p className="text-sm text-muted-foreground">
                콘텐츠가 삭제되어 처리 완료된 신고입니다.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {report.status === "DISMISSED" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStatus("PENDING")}
                    disabled={loading}
                  >
                    처리 전으로 되돌리기
                  </Button>
                )}
                {report.status === "PENDING" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatus("DISMISSED")}
                    disabled={loading}
                  >
                    기각
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                  className="ml-auto"
                >
                  콘텐츠 삭제
                </Button>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
