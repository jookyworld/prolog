package com.back.domain.routine.routine.repository;

import com.back.domain.routine.routine.entity.Routine;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoutineRepository extends JpaRepository<Routine, Long> {
    List<Routine> findByUserIdAndActiveTrueOrderByCreatedAtDesc(Long userId);

    List<Routine> findByUserIdAndActiveFalseOrderByCreatedAtDesc(Long userId);

    List<Routine> findByUserIdOrderByCreatedAtDesc(Long userId);

    void deleteAllByUser_Id(Long userId);
}
