package com.back.domain.community.comment.repository;

import com.back.domain.community.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findBySharedRoutineIdOrderByCreatedAtAsc(Long sharedRoutineId);

    @Query("SELECT c FROM Comment c WHERE c.sharedRoutine.id = :sharedRoutineId AND c.user.id NOT IN :blockedIds ORDER BY c.createdAt ASC")
    List<Comment> findBySharedRoutineIdExcludingBlocked(
            @Param("sharedRoutineId") Long sharedRoutineId,
            @Param("blockedIds") List<Long> blockedIds);

    @Query("SELECT c.sharedRoutine.id, COUNT(c) FROM Comment c WHERE c.sharedRoutine.id IN :ids GROUP BY c.sharedRoutine.id")
    List<Object[]> countBySharedRoutineIdIn(@Param("ids") List<Long> ids);

    @Query("SELECT c.sharedRoutine.id, COUNT(c) FROM Comment c WHERE c.sharedRoutine.id IN :ids AND c.user.id NOT IN :blockedIds GROUP BY c.sharedRoutine.id")
    List<Object[]> countBySharedRoutineIdInExcludingBlocked(@Param("ids") List<Long> ids, @Param("blockedIds") List<Long> blockedIds);
}
