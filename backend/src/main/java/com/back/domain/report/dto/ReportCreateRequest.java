package com.back.domain.report.dto;

import com.back.domain.report.entity.ReportReason;
import com.back.domain.report.entity.ReportTargetType;
import jakarta.validation.constraints.NotNull;

public record ReportCreateRequest(
        @NotNull ReportTargetType targetType,
        @NotNull Long targetId,
        @NotNull ReportReason reason
) {}
