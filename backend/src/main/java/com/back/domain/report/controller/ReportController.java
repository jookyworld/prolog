package com.back.domain.report.controller;

import com.back.domain.report.dto.ReportCreateRequest;
import com.back.domain.report.service.ReportService;
import com.back.global.security.principal.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<Void> createReport(@AuthenticationPrincipal UserPrincipal principal,
                                             @Valid @RequestBody ReportCreateRequest request) {
        reportService.createReport(principal.getId(), request);
        return ResponseEntity.noContent().build();
    }
}
