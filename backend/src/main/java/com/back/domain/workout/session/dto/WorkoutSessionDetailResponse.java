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
                getRoutineTitle(session),
                session.getStartedAt(),
                session.getCompletedAt(),
                exercises
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
