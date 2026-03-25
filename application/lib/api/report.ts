import { apiFetch } from "../api";

export type ReportTargetType = "ROUTINE" | "COMMENT";
export type ReportReason = "SPAM" | "INAPPROPRIATE" | "MISLEADING" | "OTHER";

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  SPAM: "스팸 및 광고",
  INAPPROPRIATE: "부적절한 콘텐츠",
  MISLEADING: "허위 및 과장 정보",
  OTHER: "기타",
};

export const reportApi = {
  createReport: async (
    targetType: ReportTargetType,
    targetId: number,
    reason: ReportReason,
  ): Promise<void> => {
    return apiFetch("/api/reports", {
      method: "POST",
      body: JSON.stringify({ targetType, targetId, reason }),
    });
  },
};
