package com.back.domain.community.sharedRoutine.dto;

import java.util.List;

public record SessionSnapshotExercise(
        String exerciseName,
        List<SessionSnapshotSet> sets
) {
}
