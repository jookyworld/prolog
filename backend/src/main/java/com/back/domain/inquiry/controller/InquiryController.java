package com.back.domain.inquiry.controller;

import com.back.domain.inquiry.dto.InquiryCreateRequest;
import com.back.domain.inquiry.dto.InquiryResponse;
import com.back.domain.inquiry.service.InquiryService;
import com.back.global.security.principal.UserPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/inquiries")
public class InquiryController {

    private final InquiryService inquiryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InquiryResponse createInquiry(
            @AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody InquiryCreateRequest request) {
        return inquiryService.createInquiry(principal.getId(), request);
    }

    @GetMapping
    public List<InquiryResponse> getMyInquiries(@AuthenticationPrincipal UserPrincipal principal) {
        return inquiryService.getMyInquiries(principal.getId());
    }

    @GetMapping("/{id}")
    public InquiryResponse getMyInquiry(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return inquiryService.getMyInquiry(principal.getId(), id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteInquiry(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        inquiryService.deleteInquiry(principal.getId(), id);
    }
}
