package com.back.domain.report.service;

import com.back.domain.community.comment.entity.Comment;
import com.back.domain.community.comment.repository.CommentRepository;
import com.back.domain.community.sharedRoutine.entity.SharedRoutine;
import com.back.domain.community.sharedRoutine.repository.SharedRoutineRepository;
import com.back.domain.report.dto.AdminReportResponse;
import com.back.domain.report.dto.ReportCreateRequest;
import com.back.domain.report.entity.Report;
import com.back.domain.report.entity.ReportStatus;
import com.back.domain.report.entity.ReportTargetType;
import com.back.domain.report.repository.ReportRepository;
import com.back.domain.user.user.entity.User;
import com.back.domain.user.user.repository.UserRepository;
import com.back.global.dto.PageResponse;
import com.back.global.exception.type.ConflictException;
import com.back.global.exception.type.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final SharedRoutineRepository sharedRoutineRepository;
    private final CommentRepository commentRepository;

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

    @Transactional(readOnly = true)
    public PageResponse<AdminReportResponse> adminGetReports(ReportStatus status, int page, int size) {
        Page<Report> reports = reportRepository.findAdminReports(status, PageRequest.of(page, size));
        Page<AdminReportResponse> mapped = reports.map(report -> {
            String preview = resolvePreview(report);
            return AdminReportResponse.of(report, preview);
        });
        return PageResponse.from(mapped);
    }

    @Transactional
    public AdminReportResponse adminUpdateReportStatus(Long reportId, ReportStatus status) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 신고입니다."));
        report.updateStatus(status);
        String preview = resolvePreview(report);
        return AdminReportResponse.of(report, preview);
    }

    @Transactional
    public void resolveAllByTarget(ReportTargetType targetType, Long targetId) {
        reportRepository.findAllByTargetTypeAndTargetId(targetType, targetId)
                .forEach(r -> r.updateStatus(ReportStatus.RESOLVED));
    }

    private String resolvePreview(Report report) {
        if (report.getTargetType() == ReportTargetType.ROUTINE) {
            return sharedRoutineRepository.findById(report.getTargetId())
                    .map(SharedRoutine::getTitle)
                    .orElse("[삭제된 루틴]");
        } else {
            return commentRepository.findById(report.getTargetId())
                    .map(Comment::getContent)
                    .orElse("[삭제된 댓글]");
        }
    }
}
