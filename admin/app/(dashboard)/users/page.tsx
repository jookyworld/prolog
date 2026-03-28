"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserTable } from "@/components/users/UserTable";
import { UserDetailModal } from "@/components/users/UserDetailModal";
import { userApi } from "@/lib/api";
import type { UserResponse, PageResponse } from "@/lib/types";

type RoleFilter = "ALL" | "USER" | "ADMIN";

export default function UsersPage() {
  const [data, setData] = useState<PageResponse<UserResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [page, setPage] = useState(0);

  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetch = useCallback(async (keyword: string, role: RoleFilter, p: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await userApi.getUsers({
        keyword: keyword || undefined,
        role: role === "ALL" ? undefined : role,
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
    fetch(search, roleFilter, page);
  }, [fetch, search, roleFilter, page]);

  // 검색어/필터 변경 시 페이지 0으로 리셋
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleRoleFilter = (value: RoleFilter) => {
    setRoleFilter(value);
    setPage(0);
  };

  const handleSelect = (user: UserResponse) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">유저 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data ? `전체 ${data.totalElements.toLocaleString()}명` : "로딩 중..."}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="닉네임 · 아이디 · 이메일 검색"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-64"
        />
        <Select
          value={roleFilter}
          onChange={(e) => handleRoleFilter(e.target.value as RoleFilter)}
          className="w-32"
        >
          <option value="ALL">전체</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </Select>
        {(search || roleFilter !== "ALL") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { handleSearch(""); handleRoleFilter("ALL"); }}
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
          <UserTable users={data?.content ?? []} onSelect={handleSelect} />

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

      <UserDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={selectedUser}
      />
    </div>
  );
}
