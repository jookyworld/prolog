export type Gender = "MALE" | "FEMALE" | "UNKNOWN";
export type Role = "USER" | "ADMIN";

// 백엔드 BodyPart enum의 @JsonValue가 한국어 label을 반환하므로
// API 송수신 모두 한국어 문자열 사용
export type BodyPart = "가슴" | "어깨" | "등" | "팔" | "하체" | "코어" | "유산소" | "기타";

export const BODY_PARTS: BodyPart[] = [
  "가슴", "어깨", "등", "팔", "하체", "코어", "유산소", "기타",
];

export interface AdminExerciseResponse {
  id: number;
  name: string;
  bodyPart: BodyPart;
  partDetail: string | null;
  custom: boolean;
  createdBy: UserResponse | null;
  createdAt: string;
}

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

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
