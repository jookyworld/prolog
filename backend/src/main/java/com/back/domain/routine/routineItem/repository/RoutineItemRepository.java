package com.back.domain.routine.routineItem.repository;

import com.back.domain.routine.routineItem.entity.RoutineItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoutineItemRepository extends JpaRepository<RoutineItem, Long> {
    @Modifying
    @Query("update RoutineItem ri set ri.exercise.id = :officialId where ri.exercise.id in :customIds")
    void updateExerciseIdBulk(List<Long> customIds, Long officialId);

    List<RoutineItem> findByRoutineIdOrderByOrderInRoutineAsc(Long routineId);

    void deleteAllByRoutine_User_Id(Long userId);
}
