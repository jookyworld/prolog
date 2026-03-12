import { apiFetch, clearTokens, setTokens } from "../api";
import type {
  LoginRequest,
  LoginResponse,
  PasswordResetConfirmDto,
  PasswordResetRequestDto,
  SignupRequest,
  UserResponse,
} from "../types/auth";

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await apiFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    await setTokens(res.accessToken, res.refreshToken);
    return res;
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

  async logout(): Promise<void> {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      await clearTokens();
    }
  },

  async deleteMe(): Promise<void> {
    await apiFetch("/api/auth/deleteMe", { method: "DELETE" });
    await clearTokens();
  },

  requestPasswordReset(data: PasswordResetRequestDto): Promise<void> {
    return apiFetch("/api/auth/password-reset/request", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  confirmPasswordReset(data: PasswordResetConfirmDto): Promise<void> {
    return apiFetch("/api/auth/password-reset/confirm", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
