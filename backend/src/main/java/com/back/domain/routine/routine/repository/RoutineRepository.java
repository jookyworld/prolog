package com.back.domain.routine.routine.repository;

import com.back.domain.routine.routine.entity.Routine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoutineRepository extends JpaRepository<Routine, Long> {
    List<Routine> findByUserIdAndActiveTrueOrderByCreatedAtDesc(Long userId);

    List<Routine> findByUserIdAndActiveFalseOrderByCreatedAtDesc(Long userId);

    List<Routine> findByUserIdOrderByCreatedAtDesc(Long userId);

    void deleteAllByUser_Id(Long userId);
}
