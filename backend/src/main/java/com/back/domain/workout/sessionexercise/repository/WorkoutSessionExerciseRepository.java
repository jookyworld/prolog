package com.back.domain.workout.sessionexercise.repository;

import com.back.domain.workout.sessionexercise.entity.WorkoutSessionExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutSessionExerciseRepository extends JpaRepository<WorkoutSessionExercise, Long> {

    List<WorkoutSessionExercise> findByWorkoutSession_IdOrderByOrderInSessionAsc(Long sessionId);

    void deleteAllByWorkoutSession_User_Id(Long userId);

    @Modifying
    @Query("update WorkoutSessionExercise wse set wse.exercise.id = :officialId where wse.exercise.id in :customIds")
    void updateExerciseIdBulk(@Param("customIds") List<Long> customIds, @Param("officialId") Long officialId);

    // 세션 ID 목록의 부위별 그룹 (목록 응답 body parts 구성용)
    @Query("SELECT se.workoutSession.id, se.bodyPartSnapshot FROM WorkoutSessionExercise se WHERE se.workoutSession.id IN :sessionIds GROUP BY se.workoutSession.id, se.bodyPartSnapshot")
    List<Object[]> findBodyPartsBySessionIds(@Param("sessionIds") List<Long> sessionIds);

    // 루틴 생성/업데이트용 세션 운동 요약
    @Query("""
        SELECT se.exercise.id as exerciseId, COUNT(ws.id) as setCount
        FROM WorkoutSessionExercise se
        LEFT JOIN se.sets ws
        WHERE se.workoutSession.id = :sessionId
        GROUP BY se.id, se.exercise.id
        ORDER BY se.orderInSession ASC
    """)
    List<SessionExerciseSummary> summarizeBySession(@Param("sessionId") Long sessionId);

    interface SessionExerciseSummary {
        Long getExerciseId();
        Long getSetCount();
    }
}
