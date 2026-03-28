package com.back.domain.workout.session.dto;

import com.back.domain.workout.session.entity.WorkoutSession;

import java.time.Duration;
import java.time.LocalDateTime;

public record AdminWorkoutSessionResponse(
        Long id,
        Long userId,
        String userNickname,
        String routineTitle,
        LocalDateTime startedAt,
        LocalDateTime completedAt,
        Integer durationMinutes
) {
    public static AdminWorkoutSessionResponse from(WorkoutSession ws) {
        Integer duration = null;
        if (ws.getStartedAt() != null && ws.getCompletedAt() != null) {
            duration = (int) Duration.between(ws.getStartedAt(), ws.getCompletedAt()).toMinutes();
        }
        return new AdminWorkoutSessionResponse(
                ws.getId(),
                ws.getUser().getId(),
                ws.getUser().getNickname(),
                ws.getRoutineTitleSnapshot() != null ? ws.getRoutineTitleSnapshot() : "자유 운동",
                ws.getStartedAt(),
                ws.getCompletedAt(),
                duration
        );
    }
}
