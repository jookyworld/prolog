package com.back.domain.community.sharedRoutine.dto;

import com.back.domain.community.sharedRoutine.entity.SharedRoutine;
import com.back.domain.exercise.entity.BodyPart;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public record SharedRoutineResponse(
        Long id,
        String username,
        String nickname,
        String title,
        String description,
        int exerciseCount,
        List<BodyPart> bodyParts,
        List<String> exerciseNames, // 대표 운동 종목 이름 (최대 3개)
        int viewCount,
        int importCount,
        LocalDateTime createdAt
) {
    public static SharedRoutineResponse from(SharedRoutine sharedRoutine) {
        RoutineSnapshotWrapper snapshot = sharedRoutine.getRoutineSnapshot();

        List<BodyPart> bodyParts = snapshot.items().stream()
                .map(RoutineSnapshotItem::bodyPart)
                .distinct()
                .collect(Collectors.toList());

        // 대표 운동 종목 이름 (최대 3개)
        List<String> exerciseNames = snapshot.items().stream()
                .limit(3)
                .map(RoutineSnapshotItem::exerciseName)
                .collect(Collectors.toList());

        return new SharedRoutineResponse(
                sharedRoutine.getId(),
                sharedRoutine.getUser().getUsername(),
                sharedRoutine.getUser().getNickname(),
                sharedRoutine.getTitle(),
                sharedRoutine.getDescription(),
                snapshot.items().size(),
                bodyParts,
                exerciseNames,
                sharedRoutine.getViewCount(),
                sharedRoutine.getImportCount(),
                sharedRoutine.getCreatedAt()
        );
    }
}
