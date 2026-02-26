package com.back.domain.workout.session.dto;

import com.back.domain.workout.session.entity.WorkoutSession;

import java.time.LocalDateTime;

public record WorkoutSessionResponse(
        Long id,
        Long routineId,
        String routineTitle,
        LocalDateTime startedAt,
        LocalDateTime completedAt
) {
    public static WorkoutSessionResponse from(WorkoutSession workoutSession) {
        return new WorkoutSessionResponse(
                workoutSession.getId(),
                workoutSession.getRoutine() != null ? workoutSession.getRoutine().getId() : null,
                workoutSession.getRoutine() != null ? workoutSession.getRoutine().getTitle() : null,
                workoutSession.getStartedAt(),
                workoutSession.getCompletedAt()
        );
    }
}
