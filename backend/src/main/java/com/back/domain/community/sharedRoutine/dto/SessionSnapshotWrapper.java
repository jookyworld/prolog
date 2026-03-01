package com.back.domain.community.sharedRoutine.dto;

import java.time.LocalDateTime;
import java.util.List;

public record SessionSnapshotWrapper(
        LocalDateTime completedAt,
        int duration, // 초
        double totalVolume,
        List<SessionSnapshotExercise> exercises
) {
}
