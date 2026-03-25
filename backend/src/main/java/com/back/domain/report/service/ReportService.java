package com.back.domain.report.service;

import com.back.domain.report.dto.ReportCreateRequest;
import com.back.domain.report.entity.Report;
import com.back.domain.report.repository.ReportRepository;
import com.back.domain.user.user.entity.User;
import com.back.domain.user.user.repository.UserRepository;
import com.back.global.exception.type.ConflictException;
import com.back.global.exception.type.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createReport(Long reporterId, ReportCreateRequest request) {
        if (reportRepository.existsByReporter_IdAndTargetTypeAndTargetId(
                reporterId, request.targetType(), request.targetId())) {
            throw new ConflictException("이미 신고한 콘텐츠입니다.");
        }

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 회원입니다."));

        reportRepository.save(Report.builder()
                .reporter(reporter)
                .targetType(request.targetType())
                .targetId(request.targetId())
                .reason(request.reason())
                .build());
    }
}
