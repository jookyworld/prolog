package com.back.domain.inquiry.repository;

import com.back.domain.inquiry.entity.Inquiry;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    List<Inquiry> findByUser_IdOrderByCreatedAtDesc(Long userId);

    Optional<Inquiry> findByIdAndUser_Id(Long id, Long userId);

    List<Inquiry> findAllByOrderByCreatedAtDesc();
}
