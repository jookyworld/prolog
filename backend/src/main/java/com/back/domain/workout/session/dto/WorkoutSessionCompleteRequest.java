package com.back.domain.workout.session.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record WorkoutSessionCompleteRequest(
        WorkoutCompleteAction action,
        String routineTitle,
        @NotNull List<WorkoutExerciseCompleteRequest> exercises
) {
}
