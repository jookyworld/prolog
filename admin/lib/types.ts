export type Gender = "MALE" | "FEMALE" | "UNKNOWN";
export type Role = "USER" | "ADMIN";

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  nickname: string;
  gender: Gender;
  height: number;
  weight: number;
  role: Role;
  createdAt: string;
  birthYear: number | null;
  marketingConsentedAt: string | null;
}

export interface LoginResponse {
  userResponse: UserResponse;
  accessToken: string;
  refreshToken: string;
}
