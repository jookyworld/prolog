package com.back.domain.report.repository;

import com.back.domain.report.entity.Report;
import com.back.domain.report.entity.ReportStatus;
import com.back.domain.report.entity.ReportTargetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    boolean existsByReporter_IdAndTargetTypeAndTargetId(Long reporterId, ReportTargetType targetType, Long targetId);

    @Query("""
            SELECT r FROM Report r
            JOIN FETCH r.reporter
            WHERE (:status IS NULL OR r.status = :status)
            ORDER BY r.createdAt DESC
            """)
    Page<Report> findAdminReports(@Param("status") ReportStatus status, Pageable pageable);

    List<Report> findAllByTargetTypeAndTargetId(ReportTargetType targetType, Long targetId);
}
