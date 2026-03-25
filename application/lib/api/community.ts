import { apiFetch } from "../api";
import type {
  CreateSharedRoutineRequest,
  SharedRoutineDetail,
  SharedRoutineListItem,
  SharedRoutineSortType,
} from "../types/community";
import type { PageResponse } from "../types/common";

export const communityApi = {
  // 공유 루틴 목록 조회
  getSharedRoutines: async (
    sort: SharedRoutineSortType = "POPULAR",
    page: number = 0,
    size: number = 20,
    keyword?: string,
  ): Promise<PageResponse<SharedRoutineListItem>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size), sort });
    if (keyword?.trim()) params.append("keyword", keyword.trim());
    return apiFetch<PageResponse<SharedRoutineListItem>>(
      `/api/community/routines?${params}`,
    );
  },

  // 공유 루틴 상세 조회
  getSharedRoutineDetail: async (id: number): Promise<SharedRoutineDetail> => {
    return apiFetch<SharedRoutineDetail>(`/api/community/routines/${id}`);
  },

  // 루틴 가져오기
  importRoutine: async (
    id: number,
  ): Promise<{
    id: number;
    title: string;
    description: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  }> => {
    return apiFetch(`/api/community/routines/${id}/import`, { method: "POST" });
  },

  // 공유 루틴 생성
  createSharedRoutine: async (
    data: CreateSharedRoutineRequest,
  ): Promise<SharedRoutineDetail> => {
    return apiFetch<SharedRoutineDetail>(`/api/community/routines`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 댓글 작성
  createComment: async (
    routineId: number,
    content: string,
  ): Promise<{
    id: number;
    userId: number;
    nickname: string;
    content: string;
    createdAt: string;
  }> => {
    return apiFetch(`/api/community/routines/${routineId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  // 내가 공유한 루틴 목록
  getMySharedRoutines: async (
    page: number = 0,
    size: number = 20,
  ): Promise<PageResponse<SharedRoutineListItem>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    return apiFetch<PageResponse<SharedRoutineListItem>>(
      `/api/community/routines/my?${params}`,
    );
  },

  // 공유 루틴 삭제
  deleteSharedRoutine: async (id: number): Promise<void> => {
    return apiFetch(`/api/community/routines/${id}`, { method: "DELETE" });
  },

  // 댓글 삭제
  deleteComment: async (commentId: number): Promise<void> => {
    return apiFetch(`/api/community/comments/${commentId}`, {
      method: "DELETE",
    });
  },
};
