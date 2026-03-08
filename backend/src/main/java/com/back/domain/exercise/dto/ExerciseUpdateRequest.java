package com.back.domain.exercise.dto;

import com.back.domain.exercise.entity.BodyPart;

public record ExerciseUpdateRequest(
        String name,
        BodyPart bodyPart,
        String partDetail
) {}
