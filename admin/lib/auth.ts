import type { UserResponse } from "./types";

const TOKEN_COOKIE = "admin_token";
const USER_STORAGE = "admin_user";
const MAX_AGE = 60 * 60 * 24 * 7; // 7일

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(^| )" + TOKEN_COOKIE + "=([^;]+)")
  );
  return match ? match[2] : null;
}

export function setToken(token: string): void {
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${MAX_AGE}; SameSite=Strict`;
}

export function removeToken(): void {
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
}

export function getUser(): UserResponse | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(USER_STORAGE);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as UserResponse;
  } catch {
    return null;
  }
}

export function setUser(user: UserResponse): void {
  localStorage.setItem(USER_STORAGE, JSON.stringify(user));
}

export function removeUser(): void {
  localStorage.removeItem(USER_STORAGE);
}

export function clearAuth(): void {
  removeToken();
  removeUser();
}
