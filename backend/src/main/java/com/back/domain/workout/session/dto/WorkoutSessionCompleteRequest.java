package com.back.domain.workout.session.dto;

import com.back.domain.workout.set.dto.WorkoutSetCompleteRequest;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record WorkoutSessionCompleteRequest(
        WorkoutCompleteAction action,
        String routineTitle,
        @NotNull List<WorkoutSetCompleteRequest> sets
) {
}
