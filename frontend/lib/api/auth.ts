import { apiFetch } from "../api";
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  UserResponse,
} from "../types/auth";

export const authApi = {
  login(data: LoginRequest): Promise<LoginResponse> {
    return apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  signup(data: SignupRequest): Promise<UserResponse> {
    return apiFetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  me(): Promise<UserResponse> {
    return apiFetch("/api/auth/me");
  },

  logout(): Promise<void> {
    return apiFetch("/api/auth/logout", { method: "POST" });
  },

  deleteMe(): Promise<void> {
    return apiFetch("/api/auth/deleteMe", { method: "DELETE" });
  },
};
