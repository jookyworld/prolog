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
                getRoutineTitle(session)
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
