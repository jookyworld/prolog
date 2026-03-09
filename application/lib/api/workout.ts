import { apiFetch } from "../api";
import type {
  WorkoutSessionCompleteReq,
  WorkoutSessionDetailRes,
  WorkoutSessionListItemRes,
  WorkoutSessionStartRes,
} from "../types/workout";
import type { PageResponse } from "../types/common";

export const workoutApi = {
  getSessions(page: number = 0, size: number = 20, bodyPart?: string): Promise<PageResponse<WorkoutSessionListItemRes>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (bodyPart) params.append("bodyPart", bodyPart);
    return apiFetch(`/api/workouts/sessions?${params}`);
  },

  getSessionDetail(id: string): Promise<WorkoutSessionDetailRes> {
    return apiFetch(`/api/workouts/sessions/${id}`);
  },

  startSession(routineId?: number | null): Promise<WorkoutSessionStartRes> {
    return apiFetch("/api/workouts/sessions", {
      method: "POST",
      body: JSON.stringify({ routineId: routineId ?? null }),
    });
  },

  deleteSession(sessionId: number): Promise<void> {
    return apiFetch(`/api/workouts/sessions/${sessionId}`, {
      method: "DELETE",
    });
  },

  completeSession(
    sessionId: number,
    body: WorkoutSessionCompleteReq,
  ): Promise<void> {
    return apiFetch(`/api/workouts/sessions/${sessionId}/complete`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  cancelSession(sessionId: number): Promise<void> {
    return apiFetch(`/api/workouts/sessions/${sessionId}/cancel`, {
      method: "DELETE",
    });
  },

  getLastSessionByRoutine(routineId: number): Promise<WorkoutSessionDetailRes> {
    return apiFetch(`/api/workouts/sessions/routines/${routineId}/last`);
  },

  getActiveSession(): Promise<WorkoutSessionStartRes | null> {
    return apiFetch<WorkoutSessionStartRes | null>("/api/workouts/sessions/active").catch(
      () => null,
    );
  },
};
