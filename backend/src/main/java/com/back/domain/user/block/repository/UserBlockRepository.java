package com.back.domain.user.block.repository;

import com.back.domain.user.block.entity.UserBlock;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserBlockRepository extends JpaRepository<UserBlock, Long> {

    boolean existsByBlocker_IdAndBlocked_Id(Long blockerId, Long blockedId);

    void deleteByBlocker_IdAndBlocked_Id(Long blockerId, Long blockedId);

    @Query("SELECT ub.blocked.id FROM UserBlock ub WHERE ub.blocker.id = :blockerId")
    List<Long> findBlockedUserIdsByBlockerId(@Param("blockerId") Long blockerId);

    @Query(
            "SELECT ub FROM UserBlock ub JOIN FETCH ub.blocked WHERE ub.blocker.id = :blockerId ORDER BY ub.createdAt DESC")
    List<UserBlock> findAllByBlockerIdWithBlocked(@Param("blockerId") Long blockerId);
}
