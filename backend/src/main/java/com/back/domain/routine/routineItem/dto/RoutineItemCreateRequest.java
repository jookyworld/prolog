package com.back.domain.routine.routineItem.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record RoutineItemCreateRequest(
        @NotNull
        Long exerciseId,
        @Min(1)
        int sets,
        @Min(0)
        int restSeconds
) {
}
