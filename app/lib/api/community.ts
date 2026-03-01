import { apiFetch } from "../api";
import type {
  SharedRoutineListItem,
  SharedRoutineDetail,
  CreateSharedRoutineRequest,
  SharedRoutineSortType,
} from "../types/community";

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const communityApi = {
  // 공유 루틴 목록 조회
  getSharedRoutines: async (
    sort: SharedRoutineSortType = "RECENT",
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<SharedRoutineListItem>> => {
    return apiFetch<PageResponse<SharedRoutineListItem>>(
      `/api/community/routines?page=${page}&size=${size}&sort=${sort}`
    );
  },

  // 공유 루틴 상세 조회
  getSharedRoutineDetail: async (id: number): Promise<SharedRoutineDetail> => {
    return apiFetch<SharedRoutineDetail>(`/api/community/routines/${id}`);
  },

  // 루틴 가져오기
  importRoutine: async (id: number): Promise<{ id: number; title: string }> => {
    return apiFetch<{ id: number; title: string }>(
      `/api/community/routines/${id}/import`,
      { method: "POST" }
    );
  },

  // 공유 루틴 생성
  createSharedRoutine: async (
    data: CreateSharedRoutineRequest
  ): Promise<SharedRoutineDetail> => {
    return apiFetch<SharedRoutineDetail>(`/api/community/routines`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 댓글 작성
  createComment: async (
    routineId: number,
    content: string
  ): Promise<{ id: number; nickname: string; content: string; createdAt: string }> => {
    return apiFetch(
      `/api/community/routines/${routineId}/comments`,
      {
        method: "POST",
        body: JSON.stringify({ content }),
      }
    );
  },

  // 댓글 삭제
  deleteComment: async (commentId: number): Promise<void> => {
    return apiFetch(`/api/community/comments/${commentId}`, {
      method: "DELETE",
    });
  },
};
