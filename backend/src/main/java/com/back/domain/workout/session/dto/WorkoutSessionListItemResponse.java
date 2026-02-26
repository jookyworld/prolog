package com.back.domain.workout.session.dto;

import com.back.domain.workout.session.entity.WorkoutSession;

import java.time.LocalDateTime;

public record WorkoutSessionListItemResponse(
        Long sessionId,
        Long routineId,
        String routineTitle,     // 루틴 기반이면 이름, 자유운동이면 null
        LocalDateTime startedAt,
        LocalDateTime completedAt
) {
    public static WorkoutSessionListItemResponse from(WorkoutSession session) {
        return new WorkoutSessionListItemResponse(
                session.getId(),
                session.getRoutine() != null ? session.getRoutine().getId() : null,
                session.getRoutine() != null ? session.getRoutine().getTitle() : null,
                session.getStartedAt(),
                session.getCompletedAt()
        );
    }
}
