package com.back.domain.inquiry.dto;

import com.back.domain.inquiry.entity.Inquiry;
import com.back.domain.inquiry.entity.InquiryCategory;
import java.time.LocalDateTime;

public record InquiryResponse(
        Long id,
        Long userId,
        String nickname,
        InquiryCategory category,
        String title,
        String content,
        String answer,
        LocalDateTime answeredAt,
        LocalDateTime createdAt) {

    public static InquiryResponse from(Inquiry inquiry) {
        return new InquiryResponse(
                inquiry.getId(),
                inquiry.getUser().getId(),
                inquiry.getUser().getNickname(),
                inquiry.getCategory(),
                inquiry.getTitle(),
                inquiry.getContent(),
                inquiry.getAnswer(),
                inquiry.getAnsweredAt(),
                inquiry.getCreatedAt());
    }
}
