import { getToken } from "./auth";
import type { AdminExerciseResponse, LoginResponse, PageResponse, UserResponse } from "./types";

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

export const userApi = {
  getUsers: (params: { keyword?: string; role?: string; page?: number; size?: number }) => {
    const query = new URLSearchParams();
    if (params.keyword) query.set("keyword", params.keyword);
    if (params.role) query.set("role", params.role);
    query.set("page", String(params.page ?? 0));
    query.set("size", String(params.size ?? 20));
    return request<PageResponse<UserResponse>>(`/api/admin/users?${query}`);
  },

  getUser: (id: number) => request<UserResponse>(`/api/admin/users/${id}`),
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
