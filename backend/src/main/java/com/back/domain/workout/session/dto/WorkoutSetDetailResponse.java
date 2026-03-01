package com.back.domain.workout.session.dto;

import com.back.domain.workout.set.entity.WorkoutSet;

public record WorkoutSetDetailResponse(
        Long setId,
        int setNumber,
        double weight,
        int reps
) {
    public static WorkoutSetDetailResponse from(WorkoutSet ws) {
        return new WorkoutSetDetailResponse(
                ws.getId(),
                ws.getSetNumber(),
                ws.getWeight(),
                ws.getReps()
        );
    }
}
