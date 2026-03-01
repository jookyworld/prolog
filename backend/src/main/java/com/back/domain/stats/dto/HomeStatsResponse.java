package com.back.domain.stats.dto;

import com.back.domain.exercise.entity.BodyPart;

import java.util.List;

public record HomeStatsResponse(
        ThisWeek thisWeek,
        ThisMonth thisMonth,
        long avgWorkoutDuration,
        List<DailyActivity> weeklyActivity,
        List<ExerciseProgress> exerciseProgress,
        List<RecentWorkoutSummary> recentWorkouts
) {

    public record ThisWeek(
            int workouts,
            int goal
    ) {
    }

    public record ThisMonth(
            int workouts
    ) {
    }

    public record DailyActivity(
            String date,            // "2024-02-25" (ISO 형식)
            String dayOfWeek,       // "화"
            String formattedDate,   // "2/25"
            int workoutCount,
            List<BodyPart> bodyParts
    ) {
    }

    public record ExerciseProgress(
            Long exerciseId,
            String exerciseName,
            BodyPart bodyPart,
            List<ExerciseSession> sessions
    ) {
    }

    public record ExerciseSession(
            String date,            // "2/10" (MM/DD 형식)
            long totalVolume,       // kg (정수)
            String routineName,
            List<SetDetail> sets
    ) {
    }

    public record SetDetail(
            double weight,
            int reps
    ) {
    }

    public record RecentWorkoutSummary(
            Long sessionId,
            String title,
            String completedAt,     // ISO 8601
            int exerciseCount,
            int totalSets,
            long totalVolume,
            long duration           // 초
    ) {
    }
}
