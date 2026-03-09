package com.back.domain.workout.session.dto;

import com.back.domain.workout.set.dto.WorkoutSetCompleteRequest;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record WorkoutExerciseCompleteRequest(
        @NotNull Long exerciseId,
        @NotNull List<WorkoutSetCompleteRequest> sets
) {
}
