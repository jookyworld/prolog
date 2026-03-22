package com.back.domain.stats.dto;

import com.back.domain.exercise.entity.BodyPart;

import java.util.List;

public record HomeStatsResponse(
        ThisWeek thisWeek,
        ThisMonth thisMonth,
        long avgWorkoutDuration,
        List<DailyActivity> weeklyActivity,
        List<ExerciseProgress> exerciseProgress
) {

    public record ThisWeek(
            int workouts
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
            double estimatedOneRM,  // 세션 최고 e1RM (kg). 맨몸이면 0
            double bestSetWeight,   // 최고 세트 무게 (kg)
            int bestSetReps,        // 최고 세트 횟수
            boolean isBodyweight,   // 맨몸 운동 여부 (weight = 0)
            String routineName,
            List<SetDetail> sets
    ) {
    }

    public record SetDetail(
            double weight,
            int reps
    ) {
    }

}
