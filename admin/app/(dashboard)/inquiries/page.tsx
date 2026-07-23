"use client";

import { useState, useEffect, useCallback } from "react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { InquiryTable } from "@/components/inquiries/InquiryTable";
import { InquiryDetailModal } from "@/components/inquiries/InquiryDetailModal";
import { inquiryApi } from "@/lib/api";
import type { InquiryResponse, InquiryCategory } from "@/lib/types";
import { INQUIRY_CATEGORY_LABEL } from "@/lib/types";

type StatusFilter = "ALL" | "PENDING" | "ANSWERED";
type CategoryFilter = "ALL" | InquiryCategory;

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");

  const [selectedInquiry, setSelectedInquiry] = useState<InquiryResponse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await inquiryApi.getAll();
      setInquiries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = inquiries.filter((inq) => {
    if (statusFilter === "PENDING" && inq.answer) return false;
    if (statusFilter === "ANSWERED" && !inq.answer) return false;
    if (categoryFilter !== "ALL" && inq.category !== categoryFilter) return false;
    return true;
  });

  const handleSelect = (inquiry: InquiryResponse) => {
    setSelectedInquiry(inquiry);
    setModalOpen(true);
  };

  const handleUpdated = (updated: InquiryResponse) => {
    setInquiries((prev) => prev.map((inq) => (inq.id === updated.id ? updated : inq)));
    setSelectedInquiry(updated);
  };

  const pendingCount = inquiries.filter((inq) => !inq.answer).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">문의 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          전체 {inquiries.length}건{pendingCount > 0 && ` (대기 ${pendingCount}건)`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="w-32"
        >
          <option value="ALL">전체 상태</option>
          <option value="PENDING">대기중</option>
          <option value="ANSWERED">답변완료</option>
        </Select>
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
          className="w-32"
        >
          <option value="ALL">전체 유형</option>
          {(Object.keys(INQUIRY_CATEGORY_LABEL) as InquiryCategory[]).map((cat) => (
            <option key={cat} value={cat}>
              {INQUIRY_CATEGORY_LABEL[cat]}
            </option>
          ))}
        </Select>
        {(statusFilter !== "ALL" || categoryFilter !== "ALL") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter("ALL");
              setCategoryFilter("ALL");
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
        <InquiryTable inquiries={filtered} onSelect={handleSelect} />
      )}

      <InquiryDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        inquiry={selectedInquiry}
        onUpdated={handleUpdated}
      />
    </div>
  );
}
