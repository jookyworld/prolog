"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SessionTable } from "@/components/sessions/SessionTable";
import { sessionApi } from "@/lib/api";
import type { AdminWorkoutSessionResponse, PageResponse } from "@/lib/types";

export default function SessionsPage() {
  const [data, setData] = useState<PageResponse<AdminWorkoutSessionResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);

  const fetch = useCallback(async (keyword: string, fromDate: string, toDate: string, p: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await sessionApi.getSessions({
        keyword: keyword || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
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
    fetch(search, from, to, page);
  }, [fetch, search, from, to, page]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleFrom = (value: string) => {
    setFrom(value);
    setPage(0);
  };

  const handleTo = (value: string) => {
    setTo(value);
    setPage(0);
  };

  const handleReset = () => {
    setSearch("");
    setFrom("");
    setTo("");
    setPage(0);
  };

  const hasFilter = search || from || to;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">세션 조회</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data ? `전체 ${data.totalElements.toLocaleString()}건` : "로딩 중..."}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="닉네임 · 아이디 검색"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-52"
        />
        <input
          type="date"
          value={from}
          onChange={(e) => handleFrom(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm"
        />
        <span className="self-center text-sm text-muted-foreground">~</span>
        <input
          type="date"
          value={to}
          onChange={(e) => handleTo(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm"
        />
        {hasFilter && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
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
          <SessionTable sessions={data?.content ?? []} />

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
    </div>
  );
}
