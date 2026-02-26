package com.back.domain.workout.session.dto;

import com.back.domain.workout.session.entity.WorkoutSession;

import java.time.LocalDateTime;
import java.util.List;

public record WorkoutSessionDetailResponse(
        Long sessionId,
        Long routineId,
        String routineTitle,
        LocalDateTime startedAt,
        LocalDateTime completedAt,
        List<WorkoutExerciseDetailResponse> exercises
) {
    public static WorkoutSessionDetailResponse of(WorkoutSession session, List<WorkoutExerciseDetailResponse> exercises) {
        return new WorkoutSessionDetailResponse(
                session.getId(),
                session.getRoutine() != null ? session.getRoutine().getId() : null,
                session.getRoutine() != null ? session.getRoutine().getTitle() : null,
                session.getStartedAt(),
                session.getCompletedAt(),
                exercises
        );
    }
}
