package com.back.domain.exercise.repository;

import com.back.domain.exercise.entity.BodyPart;
import com.back.domain.exercise.entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    boolean existsByName(String name);

    boolean existsByNameAndCustomIsFalse(String name);

    boolean existsByNameAndCustomIsTrueAndCreatedBy_Id(String name, Long userId);

    @Query("""
           select e
           from Exercise e
           where e.custom = false
              or e.createdBy.id = :userId
           order by e.id
           """)
    List<Exercise> findAllForUser(Long userId);

    List<Exercise> findAllByNameAndBodyPartAndCustomIsTrue(String name, BodyPart bodyPart);

    void deleteAllByCreatedBy_Id(Long userId);
}
