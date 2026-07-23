package com.back.domain.inquiry.dto;

import com.back.domain.inquiry.entity.InquiryCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InquiryCreateRequest(
        @NotNull InquiryCategory category, @NotBlank @Size(max = 200) String title, @NotBlank String content) {}
