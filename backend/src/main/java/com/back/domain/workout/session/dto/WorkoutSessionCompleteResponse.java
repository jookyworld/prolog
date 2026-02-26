package com.back.domain.workout.session.dto;

import com.back.domain.routine.routine.entity.Routine;
import com.back.domain.workout.session.entity.WorkoutSession;

import java.time.LocalDateTime;

public record WorkoutSessionCompleteResponse(
        Long sessionId,
        LocalDateTime startedAt,
        LocalDateTime completedAt,
        Long routineId,
        String routineTitle
) {
    public static WorkoutSessionCompleteResponse from(WorkoutSession session) {
        Routine routine = session.getRoutine();
        return new WorkoutSessionCompleteResponse(
                session.getId(),
                session.getStartedAt(),
                session.getCompletedAt(),
                routine != null ? routine.getId() : null,
                routine != null ? routine.getTitle() : null
        );
    }
}
