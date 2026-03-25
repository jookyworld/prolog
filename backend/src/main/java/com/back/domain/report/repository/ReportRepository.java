package com.back.domain.report.repository;

import com.back.domain.report.entity.Report;
import com.back.domain.report.entity.ReportTargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    boolean existsByReporter_IdAndTargetTypeAndTargetId(Long reporterId, ReportTargetType targetType, Long targetId);
}
