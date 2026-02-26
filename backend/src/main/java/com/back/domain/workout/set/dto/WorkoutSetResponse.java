package com.back.domain.workout.set.dto;

import com.back.domain.workout.set.entity.WorkoutSet;

public record WorkoutSetResponse(
        Long id,
        Long exerciseId,
        String exerciseName,
        String bodyPart,
        int setNumber,
        int weight,
        int reps
) {
    public static WorkoutSetResponse from(WorkoutSet set) {
        return new WorkoutSetResponse(
                set.getId(),
                set.getExercise().getId(),
                set.getExerciseName(),
                set.getBodyPartSnapshot().name(),
                set.getSetNumber(),
                set.getWeight(),
                set.getReps()
        );
    }
}
