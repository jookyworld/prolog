package com.back.domain.community.sharedRoutine.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SharedRoutineCreateRequest(
        @NotNull
        Long routineId,
        @NotBlank
        @Size(max = 100)
        String title,
        @Size(max = 500)
        String description
) {
}
