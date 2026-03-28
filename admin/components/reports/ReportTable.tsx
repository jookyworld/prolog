"use client";

import { Badge } from "@/components/ui/badge";
import type { AdminReportResponse, ReportStatus } from "@/lib/types";
import { REPORT_REASON_LABEL, REPORT_STATUS_LABEL, REPORT_TARGET_LABEL } from "@/lib/types";

interface ReportTableProps {
  reports: AdminReportResponse[];
  onSelect: (report: AdminReportResponse) => void;
}

const STATUS_VARIANT: Record<ReportStatus, "default" | "secondary" | "destructive"> = {
  PENDING: "destructive",
  RESOLVED: "default",
  DISMISSED: "secondary",
};

export function ReportTable({ reports, onSelect }: ReportTableProps) {
  if (reports.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border py-16">
        <p className="text-sm text-muted-foreground">신고가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/30">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">상태</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">유형</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">대상 미리보기</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">신고 사유</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">신고자</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">신고일</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, i) => (
            <tr
              key={report.id}
              onClick={() => onSelect(report)}
              className={[
                "cursor-pointer transition-colors hover:bg-secondary/40",
                i < reports.length - 1 ? "border-b border-border" : "",
              ].join(" ")}
            >
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[report.status]}>
                  {REPORT_STATUS_LABEL[report.status]}
                </Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {REPORT_TARGET_LABEL[report.targetType]}
              </td>
              <td className="px-4 py-3 max-w-[240px] truncate text-foreground">
                {report.targetPreview}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {REPORT_REASON_LABEL[report.reason]}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{report.reporterNickname}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(report.createdAt).toLocaleDateString("ko-KR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
