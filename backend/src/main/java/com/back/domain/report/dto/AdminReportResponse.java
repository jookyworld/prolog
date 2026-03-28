package com.back.domain.report.dto;

import com.back.domain.report.entity.Report;
import com.back.domain.report.entity.ReportReason;
import com.back.domain.report.entity.ReportStatus;
import com.back.domain.report.entity.ReportTargetType;

import java.time.LocalDateTime;

public record AdminReportResponse(
        Long id,
        Long reporterId,
        String reporterNickname,
        ReportTargetType targetType,
        Long targetId,
        ReportReason reason,
        ReportStatus status,
        String targetPreview,
        LocalDateTime createdAt
) {
    public static AdminReportResponse of(Report report, String targetPreview) {
        return new AdminReportResponse(
                report.getId(),
                report.getReporter().getId(),
                report.getReporter().getNickname(),
                report.getTargetType(),
                report.getTargetId(),
                report.getReason(),
                report.getStatus(),
                targetPreview,
                report.getCreatedAt()
        );
    }
}
