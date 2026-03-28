"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ReportTable } from "@/components/reports/ReportTable";
import { ReportDetailModal } from "@/components/reports/ReportDetailModal";
import { reportApi } from "@/lib/api";
import type { AdminReportResponse, PageResponse, ReportStatus } from "@/lib/types";
import { REPORT_STATUS_LABEL } from "@/lib/types";

type StatusFilter = "ALL" | ReportStatus;

export default function ReportsPage() {
  const [data, setData] = useState<PageResponse<AdminReportResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(0);

  const [selectedReport, setSelectedReport] = useState<AdminReportResponse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetch = useCallback(async (status: StatusFilter, p: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await reportApi.getReports({
        status: status === "ALL" ? undefined : status,
        page: p,
        size: 20,
      });
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch(statusFilter, page);
  }, [fetch, statusFilter, page]);

  const handleStatusFilter = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(0);
  };

  const handleSelect = (report: AdminReportResponse) => {
    setSelectedReport(report);
    setModalOpen(true);
  };

  const handleUpdated = (updated: AdminReportResponse) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            content: prev.content.map((r) => (r.id === updated.id ? updated : r)),
          }
        : prev
    );
    setSelectedReport(updated);
  };

  const handleRefresh = () => {
    fetch(statusFilter, page);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">신고 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data ? `전체 ${data.totalElements.toLocaleString()}건` : "로딩 중..."}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value as StatusFilter)}
          className="w-36"
        >
          <option value="ALL">전체</option>
          {(Object.keys(REPORT_STATUS_LABEL) as ReportStatus[]).map((s) => (
            <option key={s} value={s}>
              {REPORT_STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
        {statusFilter !== "ALL" && (
          <Button variant="ghost" size="sm" onClick={() => handleStatusFilter("ALL")}>
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
          <ReportTable reports={data?.content ?? []} onSelect={handleSelect} />

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => p - 1)}
                disabled={data.first}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {data.page + 1} / {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => p + 1)}
                disabled={data.last}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <ReportDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        report={selectedReport}
        onUpdated={handleUpdated}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
