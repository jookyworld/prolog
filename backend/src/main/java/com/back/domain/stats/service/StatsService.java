package com.back.domain.stats.service;

import com.back.domain.stats.dto.HomeStatsResponse;
import com.back.domain.workout.session.entity.WorkoutSession;
import com.back.domain.workout.session.repository.WorkoutSessionRepository;
import com.back.domain.workout.set.entity.WorkoutSet;
import com.back.domain.workout.set.repository.WorkoutSetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
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

        // 6. recentWorkouts 계산
        List<HomeStatsResponse.RecentWorkoutSummary> recentWorkouts = calculateRecentWorkouts(userId);

        return new HomeStatsResponse(
                thisWeek,
                thisMonth,
                avgWorkoutDuration,
                weeklyActivity,
                exerciseProgress,
                recentWorkouts
        );
    }

    private HomeStatsResponse.ThisWeek calculateThisWeek(Long userId, LocalDate today) {
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        LocalDateTime weekStartDateTime = weekStart.atStartOfDay();
        LocalDateTime weekEndDateTime = weekEnd.atTime(LocalTime.MAX);

        long count = workoutSessionRepository.countByUser_IdAndCompletedAtBetween(
                userId, weekStartDateTime, weekEndDateTime);

        return new HomeStatsResponse.ThisWeek((int) count, 5); // goal은 하드코딩 5
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
                    .flatMap(session -> session.getSets().stream())
                    .map(WorkoutSet::getBodyPartSnapshot)
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

        // 최근 1달 내 빈도 높은 운동 TOP 5 조회
        List<WorkoutSetRepository.ExerciseFrequency> frequencies =
                workoutSetRepository.findTopFrequentExercises(userId, since);

        return frequencies.stream()
                .map(freq -> {
                    List<HomeStatsResponse.ExerciseSession> sessions =
                            calculateExerciseSessions(userId, freq.getExerciseId());

                    return new HomeStatsResponse.ExerciseProgress(
                            freq.getExerciseId(),
                            freq.getExerciseName(),
                            freq.getBodyPart(),
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

                    long totalVolume = sets.stream()
                            .mapToLong(set -> (long) set.getWeight() * set.getReps())
                            .sum();

                    List<HomeStatsResponse.SetDetail> setDetails = sets.stream()
                            .map(set -> new HomeStatsResponse.SetDetail(set.getWeight(), set.getReps()))
                            .toList();

                    String routineName = info.getRoutineTitle() != null ? info.getRoutineTitle() : "자유 운동";

                    return new HomeStatsResponse.ExerciseSession(
                            com.back.global.util.DateTimeUtil.formatToMd(info.getCompletedAt()),
                            totalVolume,
                            routineName,
                            setDetails
                    );
                })
                .toList();
    }

    private List<HomeStatsResponse.RecentWorkoutSummary> calculateRecentWorkouts(Long userId) {
        List<WorkoutSession> sessions = workoutSessionRepository.findRecentCompletedSessions(userId, 5);

        return sessions.stream()
                .map(session -> {
                    List<WorkoutSet> sets = session.getSets();

                    int exerciseCount = (int) sets.stream()
                            .map(set -> set.getExercise().getId())
                            .distinct()
                            .count();

                    long totalVolume = sets.stream()
                            .mapToLong(set -> (long) set.getWeight() * set.getReps())
                            .sum();

                    long duration = session.getStartedAt() != null && session.getCompletedAt() != null
                            ? java.time.Duration.between(session.getStartedAt(), session.getCompletedAt()).getSeconds()
                            : 0L;

                    String title = session.getRoutine() != null
                            ? session.getRoutine().getTitle()
                            : "자유 운동";

                    return new HomeStatsResponse.RecentWorkoutSummary(
                            session.getId(),
                            title,
                            com.back.global.util.DateTimeUtil.formatToIso(session.getCompletedAt()),
                            exerciseCount,
                            sets.size(),
                            totalVolume,
                            duration
                    );
                })
                .toList();
    }
}
