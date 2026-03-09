package com.back.domain.workout.set.dto;

import jakarta.validation.constraints.NotNull;

public record WorkoutSetCompleteRequest(
        @NotNull Integer setNumber,
        double weight,
        @NotNull int reps
) {
}
