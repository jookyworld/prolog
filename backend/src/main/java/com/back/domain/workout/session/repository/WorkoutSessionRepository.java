package com.back.domain.workout.session.repository;

import com.back.domain.workout.session.entity.WorkoutSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {
    boolean existsByUser_IdAndCompletedAtIsNull(Long userId);

    java.util.Optional<WorkoutSession> findByUser_IdAndCompletedAtIsNull(Long userId);

    Page<WorkoutSession> findByUser_IdAndCompletedAtIsNotNullOrderByCompletedAtDesc(Long userId, Pageable pageable);

    java.util.Optional<WorkoutSession> findTopByUser_IdAndRoutine_IdAndCompletedAtIsNotNullOrderByCompletedAtDesc(Long userId, Long routineId);

    void deleteAllByUser_Id(Long userId);

    // Home stats queries
    long countByUser_IdAndCompletedAtIsNotNull(Long userId);

    long countByUser_IdAndCompletedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);

    List<WorkoutSession> findByUser_IdAndCompletedAtBetweenOrderByCompletedAtDesc(Long userId, LocalDateTime start, LocalDateTime end);

    java.util.Optional<WorkoutSession> findTopByUser_IdAndCompletedAtIsNotNullOrderByCompletedAtDesc(Long userId);

    @Query("SELECT DISTINCT CAST(ws.completedAt AS LocalDate) FROM WorkoutSession ws WHERE ws.user.id = :userId AND ws.completedAt IS NOT NULL ORDER BY CAST(ws.completedAt AS LocalDate) DESC")
    List<LocalDate> findDistinctCompletedDates(@Param("userId") Long userId);

    // 평균 운동 시간 계산 (초 단위)
    @Query(value = """
        SELECT AVG(TIMESTAMPDIFF(SECOND, started_at, completed_at))
        FROM workout_sessions
        WHERE user_id = :userId
          AND completed_at BETWEEN :start AND :end
          AND started_at IS NOT NULL
    """, nativeQuery = true)
    Double findAvgWorkoutDuration(@Param("userId") Long userId,
                                   @Param("start") LocalDateTime start,
                                   @Param("end") LocalDateTime end);

    // 특정 날짜의 세션 조회
    @Query(value = """
        SELECT * FROM workout_sessions
        WHERE user_id = :userId
          AND DATE(completed_at) = :date
          AND completed_at IS NOT NULL
        ORDER BY completed_at ASC
    """, nativeQuery = true)
    List<WorkoutSession> findByUserIdAndCompletedDate(@Param("userId") Long userId,
                                                       @Param("date") LocalDate date);

    // 최근 N개 완료된 세션 조회
    @Query(value = """
        SELECT * FROM workout_sessions
        WHERE user_id = :userId
          AND completed_at IS NOT NULL
        ORDER BY completed_at DESC
        LIMIT :limit
    """, nativeQuery = true)
    List<WorkoutSession> findRecentCompletedSessions(@Param("userId") Long userId,
                                                      @Param("limit") int limit);
}
