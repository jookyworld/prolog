import { apiFetch } from "../api";
import type { BodyPart, ExerciseResponse, ExerciseUpdateRequest } from "../types/exercise";

export const exerciseApi = {
  getExercises(): Promise<ExerciseResponse[]> {
    return apiFetch("/api/exercises");
  },

  getCustomExercises(): Promise<ExerciseResponse[]> {
    return apiFetch("/api/exercises/custom");
  },

  createCustomExercise(body: {
    name: string;
    bodyPart: BodyPart;
    partDetail?: string;
  }): Promise<ExerciseResponse> {
    return apiFetch("/api/exercises/custom", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  updateCustomExercise(id: number, body: ExerciseUpdateRequest): Promise<ExerciseResponse> {
    return apiFetch(`/api/exercises/custom/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  deleteCustomExercise(id: number, force = false): Promise<void> {
    return apiFetch(`/api/exercises/custom/${id}?force=${force}`, {
      method: "DELETE",
    });
  },
};
