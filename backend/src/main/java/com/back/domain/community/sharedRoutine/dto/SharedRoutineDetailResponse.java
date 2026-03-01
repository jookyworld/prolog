package com.back.domain.community.sharedRoutine.dto;

import com.back.domain.community.comment.dto.CommentResponse;
import com.back.domain.community.sharedRoutine.entity.SharedRoutine;
import com.back.domain.exercise.entity.BodyPart;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public record SharedRoutineDetailResponse(
        Long id,
        String username,
        String nickname,
        String title,
        String description,
        int exerciseCount,
        List<BodyPart> bodyParts,
        List<String> exerciseNames, // 대표 운동 종목 이름 (최대 3개)
        RoutineSnapshotWrapper routineSnapshot,
        SessionSnapshotWrapper lastSessionSnapshot,
        int viewCount,
        int importCount,
        LocalDateTime createdAt,
        List<CommentResponse> comments
) {
    public static SharedRoutineDetailResponse from(SharedRoutine sharedRoutine, List<CommentResponse> comments) {
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

        return new SharedRoutineDetailResponse(
                sharedRoutine.getId(),
                sharedRoutine.getUser().getUsername(),
                sharedRoutine.getUser().getNickname(),
                sharedRoutine.getTitle(),
                sharedRoutine.getDescription(),
                snapshot.items().size(),
                bodyParts,
                exerciseNames,
                sharedRoutine.getRoutineSnapshot(),
                sharedRoutine.getLastSessionSnapshot(),
                sharedRoutine.getViewCount(),
                sharedRoutine.getImportCount(),
                sharedRoutine.getCreatedAt(),
                comments
        );
    }
}
