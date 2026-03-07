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
                getRoutineTitle(session),
                session.getStartedAt(),
                session.getCompletedAt()
        );
    }

    private static String getRoutineTitle(WorkoutSession session) {
        // 1순위: 스냅샷 (루틴 삭제되어도 보존됨)
        if (session.getRoutineTitleSnapshot() != null) {
            return session.getRoutineTitleSnapshot();
        }
        // 2순위: 현재 루틴 (하위 호환)
        if (session.getRoutine() != null) {
            return session.getRoutine().getTitle();
        }
        // 3순위: 자유 운동
        return null;
    }
}
