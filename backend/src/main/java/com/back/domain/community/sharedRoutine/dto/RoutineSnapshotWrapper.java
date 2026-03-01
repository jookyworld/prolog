package com.back.domain.community.sharedRoutine.dto;

import java.util.List;

public record RoutineSnapshotWrapper(
        List<RoutineSnapshotItem> items
) {
}
