package com.back.domain.user.user.controller;

import com.back.domain.exercise.repository.ExerciseRepository;
import com.back.domain.report.entity.ReportStatus;
import com.back.domain.report.repository.ReportRepository;
import com.back.domain.user.user.repository.UserRepository;
import com.back.domain.workout.session.repository.WorkoutSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final UserRepository userRepository;
    private final ExerciseRepository exerciseRepository;
    private final ReportRepository reportRepository;
    private final WorkoutSessionRepository workoutSessionRepository;

    @GetMapping("/stats")
    public DashboardStats getStats() {
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime now = LocalDateTime.now();

        return new DashboardStats(
                userRepository.count(),
                exerciseRepository.countByCustomIsFalse(),
                reportRepository.countByStatus(ReportStatus.PENDING),
                workoutSessionRepository.countByCompletedAtBetween(startOfMonth, now)
        );
    }

    public record DashboardStats(
            long totalUsers,
            long totalOfficialExercises,
            long pendingReports,
            long sessionsThisMonth
    ) {}
}
