package com.back.domain.workout.session.dto;

import java.util.List;

public record WorkoutExerciseDetailResponse(
        Long exerciseId,
        String exerciseName,
        String bodyPart,
        List<WorkoutSetDetailResponse> sets
) {}
