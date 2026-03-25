import { apiFetch } from "../api";

export interface BlockedUser {
  userId: number;
  nickname: string;
  blockedAt: string;
}

export const blockApi = {
  blockUser: async (userId: number): Promise<void> => {
    return apiFetch(`/api/users/${userId}/block`, { method: "POST" });
  },

  unblockUser: async (userId: number): Promise<void> => {
    return apiFetch(`/api/users/${userId}/block`, { method: "DELETE" });
  },

  getBlockedUsers: async (): Promise<BlockedUser[]> => {
    return apiFetch<BlockedUser[]>(`/api/users/blocked`);
  },
};
