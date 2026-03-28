package com.back.domain.workout.session.controller;

import com.back.domain.workout.session.dto.AdminWorkoutSessionResponse;
import com.back.domain.workout.session.service.WorkoutSessionService;
import com.back.global.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/sessions")
@PreAuthorize("hasRole('ADMIN')")
public class AdminWorkoutSessionController {

    private final WorkoutSessionService workoutSessionService;

    @GetMapping
    public PageResponse<AdminWorkoutSessionResponse> getSessions(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        LocalDateTime fromDt = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDt = to != null ? to.plusDays(1).atStartOfDay() : null;
        return workoutSessionService.adminGetSessions(keyword, fromDt, toDt, page, size);
    }
}
