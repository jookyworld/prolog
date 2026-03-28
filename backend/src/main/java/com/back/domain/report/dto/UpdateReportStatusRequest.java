package com.back.domain.report.dto;

import com.back.domain.report.entity.ReportStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateReportStatusRequest(
        @NotNull ReportStatus status
) {}
