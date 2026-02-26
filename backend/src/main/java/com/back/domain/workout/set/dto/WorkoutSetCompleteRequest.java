package com.back.domain.workout.set.dto;

import jakarta.validation.constraints.NotNull;

public record WorkoutSetCompleteRequest(
        @NotNull Long exerciseId,
        @NotNull Integer setNumber,
        @NotNull int weight,
        @NotNull int reps
) {
}
