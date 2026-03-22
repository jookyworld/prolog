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

    List<WorkoutSet> findByWorkoutSessionExercise_IdInOrderBySetNumberAsc(List<Long> sessionExerciseIds);

    void deleteAllByWorkoutSessionExercise_WorkoutSession_User_Id(Long userId);

    // 최근 30일 내 빈도 상위 4개 부위 조회 (유산소·기타 제외)
    @Query(value = """
        SELECT wse.body_part_snapshot
        FROM workout_session_exercises wse
        JOIN workout_sessions ws ON wse.workout_session_id = ws.id
        WHERE ws.user_id = :userId
          AND ws.completed_at >= :since
          AND ws.completed_at IS NOT NULL
          AND wse.body_part_snapshot NOT IN ('CARDIO', 'OTHER')
        GROUP BY wse.body_part_snapshot
        ORDER BY COUNT(DISTINCT wse.workout_session_id) DESC
        LIMIT 4
    """, nativeQuery = true)
    List<String> findTopBodyPartsByFrequency(@Param("userId") Long userId,
                                              @Param("since") LocalDateTime since);

    // 특정 부위에서 가장 많이 수행한 대표 종목 1개 조회
    @Query(value = """
        SELECT wse.exercise_id as exerciseId,
               wse.exercise_name as exerciseName,
               wse.body_part_snapshot as bodyPart
        FROM workout_session_exercises wse
        JOIN workout_sessions ws ON wse.workout_session_id = ws.id
        WHERE ws.user_id = :userId
          AND ws.completed_at >= :since
          AND ws.completed_at IS NOT NULL
          AND wse.body_part_snapshot = :bodyPart
        GROUP BY wse.exercise_id, wse.exercise_name, wse.body_part_snapshot
        ORDER BY COUNT(DISTINCT wse.workout_session_id) DESC, MAX(ws.completed_at) DESC
        LIMIT 1
    """, nativeQuery = true)
    List<ExerciseInfo> findTopExerciseByBodyPart(@Param("userId") Long userId,
                                                  @Param("since") LocalDateTime since,
                                                  @Param("bodyPart") String bodyPart);

    interface ExerciseInfo {
        Long getExerciseId();
        String getExerciseName();
        String getBodyPart();
    }

    // 특정 운동의 최근 5회 세션 조회 (최신 5개를 오래된 순으로 정렬)
    @Query(value = """
        SELECT sub.sessionId, sub.completedAt, sub.routineTitle
        FROM (
            SELECT ws.id as sessionId,
                   ws.completed_at as completedAt,
                   r.title as routineTitle
            FROM workout_session_exercises wse
            JOIN workout_sessions ws ON wse.workout_session_id = ws.id
            LEFT JOIN routines r ON ws.routine_id = r.id
            WHERE ws.user_id = :userId
              AND wse.exercise_id = :exerciseId
              AND ws.completed_at IS NOT NULL
            GROUP BY ws.id, ws.completed_at, r.title
            ORDER BY ws.completed_at DESC
            LIMIT 5
        ) sub
        ORDER BY sub.completedAt ASC
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
        WHERE ws.workoutSessionExercise.workoutSession.id = :sessionId
          AND ws.workoutSessionExercise.exercise.id = :exerciseId
        ORDER BY ws.setNumber ASC
    """)
    List<WorkoutSet> findBySessionAndExercise(@Param("sessionId") Long sessionId,
                                               @Param("exerciseId") Long exerciseId);
}
