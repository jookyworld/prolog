package com.back.domain.stats.service;

import com.back.domain.stats.dto.HomeStatsResponse;
import com.back.domain.workout.session.entity.WorkoutSession;
import com.back.domain.workout.session.repository.WorkoutSessionRepository;
import com.back.domain.workout.sessionexercise.entity.WorkoutSessionExercise;
import com.back.domain.workout.set.entity.WorkoutSet;
import com.back.domain.workout.set.repository.WorkoutSetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.back.domain.exercise.entity.BodyPart;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final WorkoutSessionRepository workoutSessionRepository;
    private final WorkoutSetRepository workoutSetRepository;

    @Transactional(readOnly = true)
    public HomeStatsResponse getHomeStats(Long userId) {
        LocalDate today = LocalDate.now();

        // 1. thisWeek 계산
        HomeStatsResponse.ThisWeek thisWeek = calculateThisWeek(userId, today);

        // 2. thisMonth 계산
        HomeStatsResponse.ThisMonth thisMonth = calculateThisMonth(userId, today);

        // 3. avgWorkoutDuration 계산
        long avgWorkoutDuration = calculateAvgWorkoutDuration(userId, today);

        // 4. weeklyActivity 계산 (최근 7일)
        List<HomeStatsResponse.DailyActivity> weeklyActivity = calculateWeeklyActivity(userId, today);

        // 5. exerciseProgress 계산
        List<HomeStatsResponse.ExerciseProgress> exerciseProgress = calculateExerciseProgress(userId);

        return new HomeStatsResponse(
                thisWeek,
                thisMonth,
                avgWorkoutDuration,
                weeklyActivity,
                exerciseProgress
        );
    }

    private HomeStatsResponse.ThisWeek calculateThisWeek(Long userId, LocalDate today) {
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        LocalDateTime weekStartDateTime = weekStart.atStartOfDay();
        LocalDateTime weekEndDateTime = weekEnd.atTime(LocalTime.MAX);

        long count = workoutSessionRepository.countByUser_IdAndCompletedAtBetween(
                userId, weekStartDateTime, weekEndDateTime);

        return new HomeStatsResponse.ThisWeek((int) count);
    }

    private HomeStatsResponse.ThisMonth calculateThisMonth(Long userId, LocalDate today) {
        LocalDate monthStart = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDateTime monthStartDateTime = monthStart.atStartOfDay();
        LocalDateTime monthEndDateTime = today.atTime(LocalTime.MAX);

        long count = workoutSessionRepository.countByUser_IdAndCompletedAtBetween(
                userId, monthStartDateTime, monthEndDateTime);

        return new HomeStatsResponse.ThisMonth((int) count);
    }

    private long calculateAvgWorkoutDuration(Long userId, LocalDate today) {
        LocalDate monthStart = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDateTime monthStartDateTime = monthStart.atStartOfDay();
        LocalDateTime monthEndDateTime = today.atTime(LocalTime.MAX);

        Double avg = workoutSessionRepository.findAvgWorkoutDuration(
                userId, monthStartDateTime, monthEndDateTime);

        return avg != null ? avg.longValue() : 0L;
    }

    private List<HomeStatsResponse.DailyActivity> calculateWeeklyActivity(Long userId, LocalDate today) {
        List<HomeStatsResponse.DailyActivity> activities = new java.util.ArrayList<>();

        // 오늘 포함 과거 7일
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            List<WorkoutSession> sessions = workoutSessionRepository.findByUserIdAndCompletedDate(userId, date);

            // 해당 날짜의 운동 부위 수집 (중복 제거)
            List<com.back.domain.exercise.entity.BodyPart> bodyParts = sessions.stream()
                    .flatMap(session -> session.getSessionExercises().stream())
                    .map(WorkoutSessionExercise::getBodyPartSnapshot)
                    .distinct()
                    .toList();

            activities.add(new HomeStatsResponse.DailyActivity(
                    com.back.global.util.DateTimeUtil.formatToIso(date),
                    com.back.global.util.DateTimeUtil.toKoreanDayOfWeek(date.getDayOfWeek()),
                    com.back.global.util.DateTimeUtil.formatToMd(date),
                    sessions.size(),
                    bodyParts
            ));
        }

        return activities;
    }

    private List<HomeStatsResponse.ExerciseProgress> calculateExerciseProgress(Long userId) {
        LocalDateTime since = LocalDateTime.now().minusDays(30);

        // 1단계: 빈도 상위 4개 부위 선정 (유산소·기타 제외)
        List<String> topBodyParts = workoutSetRepository.findTopBodyPartsByFrequency(userId, since);

        // 2단계: 각 부위별 대표 종목 1개 선정 후 세션 계산
        return topBodyParts.stream()
                .map(bodyPart -> workoutSetRepository.findTopExerciseByBodyPart(userId, since, bodyPart))
                .filter(list -> !list.isEmpty())
                .map(list -> list.get(0))
                .map(exercise -> {
                    List<HomeStatsResponse.ExerciseSession> sessions =
                            calculateExerciseSessions(userId, exercise.getExerciseId());

                    return new HomeStatsResponse.ExerciseProgress(
                            exercise.getExerciseId(),
                            exercise.getExerciseName(),
                            BodyPart.valueOf(exercise.getBodyPart()),
                            sessions
                    );
                })
                .toList();
    }

    private List<HomeStatsResponse.ExerciseSession> calculateExerciseSessions(Long userId, Long exerciseId) {
        List<WorkoutSetRepository.ExerciseSessionInfo> sessionInfos =
                workoutSetRepository.findRecentSessionsByExercise(userId, exerciseId);

        return sessionInfos.stream()
                .map(info -> {
                    List<WorkoutSet> sets = workoutSetRepository.findBySessionAndExercise(
                            info.getSessionId(), exerciseId);

                    boolean isBodyweight = sets.stream().allMatch(s -> s.getWeight() == 0);

                    WorkoutSet bestSet;
                    double estimatedOneRM;

                    if (isBodyweight) {
                        bestSet = sets.stream()
                                .max(Comparator.comparingInt(WorkoutSet::getReps))
                                .orElseThrow();
                        estimatedOneRM = 0;
                    } else {
                        bestSet = sets.stream()
                                .max(Comparator.comparingDouble(s -> calculateE1RM(s.getWeight(), s.getReps())))
                                .orElseThrow();
                        estimatedOneRM = calculateE1RM(bestSet.getWeight(), bestSet.getReps());
                    }

                    List<HomeStatsResponse.SetDetail> setDetails = sets.stream()
                            .map(set -> new HomeStatsResponse.SetDetail(set.getWeight(), set.getReps()))
                            .toList();

                    String routineName = info.getRoutineTitle() != null ? info.getRoutineTitle() : "자유 운동";

                    return new HomeStatsResponse.ExerciseSession(
                            com.back.global.util.DateTimeUtil.formatToMd(info.getCompletedAt()),
                            estimatedOneRM,
                            bestSet.getWeight(),
                            bestSet.getReps(),
                            isBodyweight,
                            routineName,
                            setDetails
                    );
                })
                .toList();
    }

    // e1RM = weight × (1 + min(reps, 20) / 30), 소수점 1자리
    private double calculateE1RM(double weight, int reps) {
        int cappedReps = Math.min(reps, 20);
        return Math.round(weight * (1 + cappedReps / 30.0) * 10.0) / 10.0;
    }

}
