package com.back.domain.community.sharedRoutine.repository;

import com.back.domain.community.sharedRoutine.entity.SharedRoutine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SharedRoutineRepository extends JpaRepository<SharedRoutine, Long> {

    @EntityGraph(attributePaths = "user")
    Page<SharedRoutine> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "user")
    Page<SharedRoutine> findAllByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String titleKeyword, String descriptionKeyword, Pageable pageable);

    @Query(
        value = "SELECT * FROM shared_routines sr " +
                "ORDER BY (sr.import_count * 3.0 + sr.view_count) / " +
                "POWER((UNIX_TIMESTAMP() - UNIX_TIMESTAMP(sr.created_at)) / 3600.0 + 2, 1.5) DESC",
        countQuery = "SELECT COUNT(*) FROM shared_routines",
        nativeQuery = true
    )
    Page<SharedRoutine> findAllOrderByPopularity(Pageable pageable);

    @Query(
        value = "SELECT * FROM shared_routines sr " +
                "WHERE LOWER(sr.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                "OR LOWER(sr.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                "ORDER BY (sr.import_count * 3.0 + sr.view_count) / " +
                "POWER((UNIX_TIMESTAMP() - UNIX_TIMESTAMP(sr.created_at)) / 3600.0 + 2, 1.5) DESC",
        countQuery = "SELECT COUNT(*) FROM shared_routines sr " +
                     "WHERE LOWER(sr.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                     "OR LOWER(sr.description) LIKE LOWER(CONCAT('%', :keyword, '%'))",
        nativeQuery = true
    )
    Page<SharedRoutine> findAllByKeywordOrderByPopularity(@Param("keyword") String keyword, Pageable pageable);
}
