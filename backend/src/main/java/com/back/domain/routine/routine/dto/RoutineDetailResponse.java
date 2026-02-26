package com.back.domain.routine.routine.dto;

import com.back.domain.routine.routine.entity.Routine;
import com.back.domain.routine.routineItem.dto.RoutineItemDetailResponse;

import java.time.LocalDateTime;
import java.util.List;

public record RoutineDetailResponse(
        Long id,
        String title,
        String description,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<RoutineItemDetailResponse> routineItems
) {
    public static RoutineDetailResponse of(Routine routine, List<RoutineItemDetailResponse> routineItems) {
        return new RoutineDetailResponse(
                routine.getId(),
                routine.getTitle(),
                routine.getDescription(),
                routine.isActive(),
                routine.getCreatedAt(),
                routine.getUpdatedAt(),
                routineItems
        );
    }
}
