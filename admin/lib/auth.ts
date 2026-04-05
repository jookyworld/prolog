import type { UserResponse } from "./types";

const USER_STORAGE = "admin_user";

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
  removeUser();
}
