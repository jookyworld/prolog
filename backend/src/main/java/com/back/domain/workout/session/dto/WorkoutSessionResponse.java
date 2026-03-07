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
                getRoutineTitle(workoutSession),
                workoutSession.getStartedAt(),
                workoutSession.getCompletedAt()
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
