package com.back.domain.routine.routineItem.dto;

import com.back.domain.exercise.entity.BodyPart;
import com.back.domain.routine.routineItem.entity.RoutineItem;

public record RoutineItemDetailResponse(
        Long routineItemId,
        int orderInRoutine,
        Long exerciseId,
        String exerciseName,
        BodyPart bodyPart,
        String partDetail,
        int sets,
        int restSeconds
) {
    public static RoutineItemDetailResponse from(RoutineItem routineItem) {
        return new RoutineItemDetailResponse(
                routineItem.getId(),
                routineItem.getOrderInRoutine(),
                routineItem.getExercise().getId(),
                routineItem.getExercise().getName(),
                routineItem.getExercise().getBodyPart(),
                routineItem.getExercise().getPartDetail(),
                routineItem.getSets(),
                routineItem.getRestSeconds()
        );
    }
}
