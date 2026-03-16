package com.back.domain.community.sharedRoutine.dto;

import com.back.domain.exercise.entity.BodyPart;

public record RoutineSnapshotItem(
        Long exerciseId,
        String exerciseName,
        BodyPart bodyPart,
        String partDetail,
        int orderInRoutine,
        int sets,
        int restSeconds
) {
}
