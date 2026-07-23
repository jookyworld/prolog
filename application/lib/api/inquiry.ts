import { apiFetch } from "../api";
import type { InquiryCreateRequest, InquiryResponse } from "../types/inquiry";

export const inquiryApi = {
  createInquiry: (data: InquiryCreateRequest): Promise<InquiryResponse> => {
    return apiFetch("/api/inquiries", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getMyInquiries: (): Promise<InquiryResponse[]> => {
    return apiFetch("/api/inquiries");
  },

  getMyInquiry: (id: number): Promise<InquiryResponse> => {
    return apiFetch(`/api/inquiries/${id}`);
  },

  deleteInquiry: (id: number): Promise<void> => {
    return apiFetch(`/api/inquiries/${id}`, { method: "DELETE" });
  },
};
