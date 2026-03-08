package com.back.domain.community.sharedRoutine.repository;

import com.back.domain.community.sharedRoutine.entity.ImportHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface ImportHistoryRepository extends JpaRepository<ImportHistory, Long> {

    @Query("SELECT ih.sharedRoutine.id FROM ImportHistory ih WHERE ih.user.id = :userId")
    Set<Long> findImportedSharedRoutineIdsByUserId(@Param("userId") Long userId);

    boolean existsByUser_IdAndSharedRoutine_Id(Long userId, Long sharedRoutineId);
}
