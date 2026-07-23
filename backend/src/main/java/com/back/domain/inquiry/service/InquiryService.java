package com.back.domain.inquiry.service;

import com.back.domain.inquiry.dto.InquiryAnswerRequest;
import com.back.domain.inquiry.dto.InquiryCreateRequest;
import com.back.domain.inquiry.dto.InquiryResponse;
import com.back.domain.inquiry.entity.Inquiry;
import com.back.domain.inquiry.repository.InquiryRepository;
import com.back.domain.user.user.entity.User;
import com.back.domain.user.user.repository.UserRepository;
import com.back.global.exception.type.ForbiddenException;
import com.back.global.exception.type.NotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final UserRepository userRepository;

    @Transactional
    public InquiryResponse createInquiry(Long userId, InquiryCreateRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("존재하지 않는 회원입니다."));

        Inquiry inquiry = Inquiry.builder()
                .user(user)
                .category(request.category())
                .title(request.title())
                .content(request.content())
                .build();

        inquiryRepository.save(inquiry);
        return InquiryResponse.from(inquiry);
    }

    @Transactional(readOnly = true)
    public List<InquiryResponse> getMyInquiries(Long userId) {
        return inquiryRepository.findByUser_IdOrderByCreatedAtDesc(userId).stream()
                .map(InquiryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public InquiryResponse getMyInquiry(Long userId, Long inquiryId) {
        Inquiry inquiry = inquiryRepository
                .findByIdAndUser_Id(inquiryId, userId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 문의입니다."));
        return InquiryResponse.from(inquiry);
    }

    @Transactional
    public void deleteInquiry(Long userId, Long inquiryId) {
        Inquiry inquiry =
                inquiryRepository.findById(inquiryId).orElseThrow(() -> new NotFoundException("존재하지 않는 문의입니다."));

        if (!userId.equals(inquiry.getUser().getId())) {
            throw new ForbiddenException("권한이 없습니다.");
        }

        inquiryRepository.delete(inquiry);
    }

    @Transactional(readOnly = true)
    public List<InquiryResponse> getAllInquiries() {
        return inquiryRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(InquiryResponse::from)
                .toList();
    }

    @Transactional
    public InquiryResponse answerInquiry(Long inquiryId, InquiryAnswerRequest request) {
        Inquiry inquiry =
                inquiryRepository.findById(inquiryId).orElseThrow(() -> new NotFoundException("존재하지 않는 문의입니다."));

        inquiry.answer(request.answer());
        return InquiryResponse.from(inquiry);
    }
}
