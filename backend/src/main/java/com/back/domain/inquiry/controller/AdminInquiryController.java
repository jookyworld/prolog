package com.back.domain.inquiry.controller;

import com.back.domain.inquiry.dto.InquiryAnswerRequest;
import com.back.domain.inquiry.dto.InquiryResponse;
import com.back.domain.inquiry.service.InquiryService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/inquiries")
@PreAuthorize("hasRole('ADMIN')")
public class AdminInquiryController {

    private final InquiryService inquiryService;

    @GetMapping
    public List<InquiryResponse> getAllInquiries() {
        return inquiryService.getAllInquiries();
    }

    @PutMapping("/{id}/answer")
    public InquiryResponse answerInquiry(@PathVariable Long id, @Valid @RequestBody InquiryAnswerRequest request) {
        return inquiryService.answerInquiry(id, request);
    }
}
