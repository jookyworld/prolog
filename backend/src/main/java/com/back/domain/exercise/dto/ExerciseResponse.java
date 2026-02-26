package com.back.domain.exercise.dto;

import com.back.domain.exercise.entity.BodyPart;
import com.back.domain.exercise.entity.Exercise;

public record ExerciseResponse(
        Long id,
        String name,
        BodyPart bodyPart,
        String partDetail,
        boolean custom
) {

    public static ExerciseResponse from(Exercise exercise) {
        return new ExerciseResponse(
                exercise.getId(),
                exercise.getName(),
                exercise.getBodyPart(),
                exercise.getPartDetail(),
                exercise.isCustom()
        );
    }
}