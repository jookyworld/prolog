export type InquiryCategory = "BUG" | "SUGGESTION" | "QUESTION";

export interface InquiryResponse {
  id: number;
  userId: number;
  nickname: string;
  category: InquiryCategory;
  title: string;
  content: string;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
}

export interface InquiryCreateRequest {
  category: InquiryCategory;
  title: string;
  content: string;
}

export const INQUIRY_CATEGORY_LABEL: Record<InquiryCategory, string> = {
  BUG: "오류 신고",
  SUGGESTION: "기능 제안",
  QUESTION: "이용 문의",
};
