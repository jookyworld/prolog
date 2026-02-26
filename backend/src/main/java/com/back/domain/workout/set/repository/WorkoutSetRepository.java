package com.back.domain.workout.set.repository;

import com.back.domain.workout.set.entity.WorkoutSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WorkoutSetRepository extends JpaRepository<WorkoutSet, Long> {

    @Query("""
        select
            ws.exercise.id as exerciseId,
            max(ws.setNumber) as maxSetNumber,
            min(ws.createdAt) as firstCreatedAt
        from WorkoutSet ws
        where ws.workoutSession.id = :sessionId
        group by ws.exercise.id
        order by firstCreatedAt asc
    """)
    List<RoutineExerciseSummary> summarizeBySession(Long sessionId);

    interface RoutineExerciseSummary {
        Long getExerciseId();
        Integer getMaxSetNumber();
        LocalDateTime getFirstCreatedAt();
    }

    List<WorkoutSet> findByWorkoutSession_IdOrderByCreatedAtAsc(Long sessionId);

    void deleteAllByWorkoutSession_User_Id(Long userId);

    // 최근 1달 내 운동별 빈도 계산 (3회 이상, TOP 5)
    @Query(value = """
        SELECT e.id as exerciseId,
               e.name as exerciseName,
               e.body_part as bodyPart,
               COUNT(DISTINCT ws_set.workout_session_id) as frequency
        FROM workout_sets ws_set
        JOIN exercises e ON ws_set.exercise_id = e.id
        JOIN workout_sessions ws ON ws_set.workout_session_id = ws.id
        WHERE ws.user_id = :userId
          AND ws.completed_at >= :since
          AND ws.completed_at IS NOT NULL
        GROUP BY e.id, e.name, e.body_part
        HAVING COUNT(DISTINCT ws_set.workout_session_id) >= 3
        ORDER BY frequency DESC
        LIMIT 5
    """, nativeQuery = true)
    List<ExerciseFrequency> findTopFrequentExercises(@Param("userId") Long userId,
                                                      @Param("since") LocalDateTime since);

    interface ExerciseFrequency {
        Long getExerciseId();
        String getExerciseName();
        com.back.domain.exercise.entity.BodyPart getBodyPart();
        Long getFrequency();
    }

    // 특정 운동의 최근 5회 세션 데이터 조회
    @Query(value = """
        SELECT ws.id as sessionId,
               ws.completed_at as completedAt,
               r.title as routineTitle
        FROM workout_sets ws_set
        JOIN workout_sessions ws ON ws_set.workout_session_id = ws.id
        LEFT JOIN routines r ON ws.routine_id = r.id
        WHERE ws.user_id = :userId
          AND ws_set.exercise_id = :exerciseId
          AND ws.completed_at IS NOT NULL
        GROUP BY ws.id, ws.completed_at, r.title
        ORDER BY ws.completed_at ASC
        LIMIT 5
    """, nativeQuery = true)
    List<ExerciseSessionInfo> findRecentSessionsByExercise(@Param("userId") Long userId,
                                                            @Param("exerciseId") Long exerciseId);

    interface ExerciseSessionInfo {
        Long getSessionId();
        LocalDateTime getCompletedAt();
        String getRoutineTitle();
    }

    // 특정 세션 + 특정 운동의 모든 세트 조회
    @Query("""
        SELECT ws FROM WorkoutSet ws
        WHERE ws.workoutSession.id = :sessionId
          AND ws.exercise.id = :exerciseId
        ORDER BY ws.setNumber ASC
    """)
    List<WorkoutSet> findBySessionAndExercise(@Param("sessionId") Long sessionId,
                                               @Param("exerciseId") Long exerciseId);
}
