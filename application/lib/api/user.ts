import { apiFetch } from "../api";
import type { UpdateMarketingConsentRequest, UpdateProfileRequest, UserResponse } from "../types/auth";

export const userApi = {
  updateProfile(req: UpdateProfileRequest): Promise<UserResponse> {
    return apiFetch("/api/users/me", {
      method: "PATCH",
      body: JSON.stringify(req),
    });
  },

  updateMarketingConsent(req: UpdateMarketingConsentRequest): Promise<UserResponse> {
    return apiFetch("/api/users/me/marketing-consent", {
      method: "PATCH",
      body: JSON.stringify(req),
    });
  },
};
