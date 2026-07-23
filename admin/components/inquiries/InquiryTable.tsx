"use client";

import { Badge } from "@/components/ui/badge";
import type { InquiryResponse } from "@/lib/types";
import { INQUIRY_CATEGORY_LABEL } from "@/lib/types";

interface InquiryTableProps {
  inquiries: InquiryResponse[];
  onSelect: (inquiry: InquiryResponse) => void;
}

export function InquiryTable({ inquiries, onSelect }: InquiryTableProps) {
  if (inquiries.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border py-16">
        <p className="text-sm text-muted-foreground">문의가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/30">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">상태</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">유형</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">제목</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">작성자</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">작성일</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((inquiry, i) => (
            <tr
              key={inquiry.id}
              onClick={() => onSelect(inquiry)}
              className={[
                "cursor-pointer transition-colors hover:bg-secondary/40",
                i < inquiries.length - 1 ? "border-b border-border" : "",
              ].join(" ")}
            >
              <td className="px-4 py-3">
                <Badge variant={inquiry.answer ? "default" : "destructive"}>
                  {inquiry.answer ? "답변완료" : "대기중"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {INQUIRY_CATEGORY_LABEL[inquiry.category]}
              </td>
              <td className="max-w-[300px] truncate px-4 py-3 text-foreground">{inquiry.title}</td>
              <td className="px-4 py-3 text-muted-foreground">{inquiry.nickname}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(inquiry.createdAt).toLocaleDateString("ko-KR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
