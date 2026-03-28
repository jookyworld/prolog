package com.back.domain.report.controller;

import com.back.domain.report.dto.AdminReportResponse;
import com.back.domain.report.dto.UpdateReportStatusRequest;
import com.back.domain.report.entity.ReportStatus;
import com.back.domain.report.service.ReportService;
import com.back.global.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportController {

    private final ReportService reportService;

    @GetMapping
    public PageResponse<AdminReportResponse> getReports(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return reportService.adminGetReports(status, page, size);
    }

    @PatchMapping("/{id}/status")
    public AdminReportResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReportStatusRequest request) {
        return reportService.adminUpdateReportStatus(id, request.status());
    }
}
