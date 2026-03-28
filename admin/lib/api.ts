import { getToken } from "./auth";
import type { AdminExerciseResponse, LoginResponse } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string }).message ?? `HTTP ${res.status}`,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const authApi = {
  login: (username: string, password: string) =>
    request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
};

export const exerciseApi = {
  getAll: () => request<AdminExerciseResponse[]>("/api/admin/exercises"),

  create: (data: { name: string; bodyPart: string; partDetail?: string }) =>
    request<AdminExerciseResponse>("/api/admin/exercises", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: number,
    data: { name: string; bodyPart: string; partDetail?: string }
  ) =>
    request<AdminExerciseResponse>(`/api/admin/exercises/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
