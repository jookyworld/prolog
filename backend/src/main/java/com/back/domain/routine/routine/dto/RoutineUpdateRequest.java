package com.back.domain.routine.routine.dto;

import com.back.domain.routine.routineItem.dto.RoutineItemCreateRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record RoutineUpdateRequest(
        @NotBlank
        @Size(max = 50)
        String title,
        @Size(max = 500)
        String description,
        @NotEmpty
        @Valid
        List<RoutineItemCreateRequest> routineItems
) {}
