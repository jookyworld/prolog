package com.back.domain.workout.session.dto;

import java.util.List;

public record WorkoutExerciseDetailResponse(
        Long exerciseId,
        String exerciseName,
        List<WorkoutSetDetailResponse> sets
) {}
