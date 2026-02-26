package com.back.domain.exercise.dto;

import com.back.domain.exercise.entity.BodyPart;
import com.back.domain.exercise.entity.Exercise;
import com.back.domain.user.user.dto.UserResponse;

import java.time.LocalDateTime;

public record AdminExerciseResponse(
        Long id,
        String name,
        BodyPart bodyPart,
        String partDetail,
        boolean custom,
        UserResponse createdBy,
        LocalDateTime createdAt
) {
    public static AdminExerciseResponse from(Exercise exercise) {
        return new AdminExerciseResponse(
                exercise.getId(),
                exercise.getName(),
                exercise.getBodyPart(),
                exercise.getPartDetail(),
                exercise.isCustom(),
                toUserResponse(exercise),
                exercise.getCreatedAt()
        );
    }

    private static UserResponse toUserResponse(Exercise exercise) {
        if (exercise.getCreatedBy() == null) {
            return null;
        }
        return UserResponse.from(exercise.getCreatedBy());
    }

}
