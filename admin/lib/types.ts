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

export type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED";
export type ReportTargetType = "ROUTINE" | "COMMENT";
export type ReportReason = "SPAM" | "INAPPROPRIATE" | "MISLEADING" | "OTHER";

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  PENDING: "처리 전",
  RESOLVED: "처리 완료",
  DISMISSED: "기각",
};

export const REPORT_TARGET_LABEL: Record<ReportTargetType, string> = {
  ROUTINE: "루틴",
  COMMENT: "댓글",
};

export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
  SPAM: "스팸",
  INAPPROPRIATE: "부적절한 콘텐츠",
  MISLEADING: "허위/오해 정보",
  OTHER: "기타",
};

export interface AdminReportResponse {
  id: number;
  reporterId: number;
  reporterNickname: string;
  targetType: ReportTargetType;
  targetId: number;
  reason: ReportReason;
  status: ReportStatus;
  targetPreview: string;
  createdAt: string;
}
