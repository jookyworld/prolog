export type Gender = "MALE" | "FEMALE" | "UNKNOWN";

export interface SignupRequest {
  username: string;
  password: string;
  email: string;
  nickname: string;
  gender: Gender;
  birthYear: number;
  height: number;
  weight: number;
  marketingConsent: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  nickname: string;
  gender: Gender;
  birthYear: number;
  height: number;
  weight: number;
  role: string;
  createdAt: string;
  marketingConsentedAt: string | null;
}

export interface LoginResponse {
  userResponse: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface UpdateProfileRequest {
  nickname: string;
  gender: Gender;
  birthYear: number;
  height: number;
  weight: number;
}

export interface UpdateMarketingConsentRequest {
  marketingConsent: boolean;
}

export interface CheckDuplicatesRequest {
  username: string;
  email: string;
  nickname: string;
}

export interface CheckDuplicatesResponse {
  usernameAvailable: boolean;
  emailAvailable: boolean;
  nicknameAvailable: boolean;
}

export interface EmailVerificationSendDto {
  email: string;
}

export interface EmailVerificationConfirmDto {
  email: string;
  code: string;
}

export interface PasswordResetRequestDto {
  email: string;
}

export interface PasswordResetConfirmDto {
  email: string;
  code: string;
  newPassword: string;
}
