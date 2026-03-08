package com.back.domain.community.sharedRoutine.controller;

import com.back.domain.community.comment.dto.CommentCreateRequest;
import com.back.domain.community.comment.dto.CommentResponse;
import com.back.domain.community.comment.service.CommentService;
import com.back.domain.community.sharedRoutine.dto.*;
import com.back.domain.community.sharedRoutine.service.SharedRoutineService;
import com.back.domain.routine.routine.dto.RoutineResponse;
import com.back.global.dto.PageResponse;
import com.back.global.security.principal.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/community/routines")
public class SharedRoutineController {

    private final SharedRoutineService sharedRoutineService;
    private final CommentService commentService;

    @PostMapping
    public SharedRoutineDetailResponse shareRoutine(@AuthenticationPrincipal UserPrincipal principal,
                                                    @Valid @RequestBody SharedRoutineCreateRequest request) {
        return sharedRoutineService.shareRoutine(principal.getId(), request);
    }

    @GetMapping
    public PageResponse<SharedRoutineResponse> getSharedRoutines(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "POPULAR") SharedRoutineSortType sort,
            @RequestParam(required = false) String keyword) {
        return PageResponse.from(sharedRoutineService.getSharedRoutines(page, size, sort, keyword));
    }

    @GetMapping("/{id}")
    public SharedRoutineDetailResponse getSharedRoutineDetail(@PathVariable Long id) {
        return sharedRoutineService.getSharedRoutineDetail(id);
    }

    @GetMapping("/my")
    public PageResponse<SharedRoutineResponse> getMySharedRoutines(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return PageResponse.from(sharedRoutineService.getMySharedRoutines(principal.getId(), page, size));
    }

    @DeleteMapping("/{id}")
    public void deleteSharedRoutine(@AuthenticationPrincipal UserPrincipal principal,
                                    @PathVariable Long id) {
        sharedRoutineService.deleteSharedRoutine(principal.getId(), id);
    }

    @PostMapping("/{id}/import")
    public RoutineResponse importRoutine(@AuthenticationPrincipal UserPrincipal principal,
                                         @PathVariable Long id) {
        return sharedRoutineService.importRoutine(principal.getId(), id);
    }

    @PostMapping("/{id}/comments")
    public CommentResponse createComment(@AuthenticationPrincipal UserPrincipal principal,
                                         @PathVariable Long id,
                                         @Valid @RequestBody CommentCreateRequest request) {
        return commentService.createComment(principal.getId(), id, request);
    }
}
