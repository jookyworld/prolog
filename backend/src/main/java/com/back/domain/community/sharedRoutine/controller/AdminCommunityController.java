package com.back.domain.community.sharedRoutine.controller;

import com.back.domain.community.comment.service.CommentService;
import com.back.domain.community.sharedRoutine.service.SharedRoutineService;
import com.back.domain.report.entity.ReportTargetType;
import com.back.domain.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/community")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCommunityController {

    private final SharedRoutineService sharedRoutineService;
    private final CommentService commentService;
    private final ReportService reportService;

    @DeleteMapping("/routines/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRoutine(@PathVariable Long id) {
        sharedRoutineService.adminDeleteSharedRoutine(id);
        reportService.resolveAllByTarget(ReportTargetType.ROUTINE, id);
    }

    @DeleteMapping("/comments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable Long id) {
        commentService.adminDeleteComment(id);
        reportService.resolveAllByTarget(ReportTargetType.COMMENT, id);
    }
}
