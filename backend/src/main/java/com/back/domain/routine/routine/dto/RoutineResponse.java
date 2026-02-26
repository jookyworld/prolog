package com.back.domain.routine.routine.dto;

import com.back.domain.routine.routine.entity.Routine;

import java.time.LocalDateTime;

public record RoutineResponse(
        Long id,
        String title,
        String description,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static RoutineResponse from(Routine routine) {
        return new RoutineResponse(
                routine.getId(),
                routine.getTitle(),
                routine.getDescription(),
                routine.isActive(),
                routine.getCreatedAt(),
                routine.getUpdatedAt()
        );
    }
}
