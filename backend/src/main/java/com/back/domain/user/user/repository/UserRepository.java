package com.back.domain.user.user.repository;

import com.back.domain.user.user.entity.User;
import com.back.domain.user.user.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByNickname(String nickname);

    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    @Query("""
            SELECT u FROM User u
            WHERE (:keyword IS NULL OR :keyword = ''
                   OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(u.email)    LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(u.nickname) LIKE LOWER(CONCAT('%', :keyword, '%')))
            AND   (:role IS NULL OR u.role = :role)
            ORDER BY u.createdAt DESC
            """)
    Page<User> findAdminUsers(@Param("keyword") String keyword,
                              @Param("role") Role role,
                              Pageable pageable);
}
