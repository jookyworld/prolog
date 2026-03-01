package com.back.domain.community.sharedRoutine.repository;

import com.back.domain.community.sharedRoutine.entity.SharedRoutine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SharedRoutineRepository extends JpaRepository<SharedRoutine, Long> {

    @EntityGraph(attributePaths = "user")
    Page<SharedRoutine> findAll(Pageable pageable);
}
