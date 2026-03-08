package com.back.domain.workout.session.dto;

import com.back.domain.exercise.entity.BodyPart;
import com.back.domain.workout.session.entity.WorkoutSession;

import java.time.LocalDateTime;
import java.util.List;

public record WorkoutSessionListItemResponse(
        Long sessionId,
        Long routineId,
        String routineTitle,     // 루틴 기반이면 이름, 자유운동이면 null
        LocalDateTime startedAt,
        LocalDateTime completedAt,
        List<String> bodyParts   // 세션에서 운동한 부위 목록
) {
    public static WorkoutSessionListItemResponse from(WorkoutSession session, List<BodyPart> bodyParts) {
        return new WorkoutSessionListItemResponse(
                session.getId(),
                session.getRoutine() != null ? session.getRoutine().getId() : null,
                getRoutineTitle(session),
                session.getStartedAt(),
                session.getCompletedAt(),
                bodyParts.stream().map(BodyPart::getLabel).toList()
        );
    }

    private static String getRoutineTitle(WorkoutSession session) {
        if (session.getRoutineTitleSnapshot() != null) {
            return session.getRoutineTitleSnapshot();
        }
        if (session.getRoutine() != null) {
            return session.getRoutine().getTitle();
        }
        return null;
    }
}
