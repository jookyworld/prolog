package com.back.domain.user.user.controller;

import com.back.domain.user.user.dto.UpdateMarketingConsentRequest;
import com.back.domain.user.user.dto.UpdateProfileRequest;
import com.back.domain.user.user.dto.UserResponse;
import com.back.domain.user.user.service.UserService;
import com.back.global.security.principal.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest dto
    ) {
        UserResponse response = userService.updateProfile(principal.getId(), dto);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/me/marketing-consent")
    public ResponseEntity<UserResponse> updateMarketingConsent(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UpdateMarketingConsentRequest dto
    ) {
        UserResponse response = userService.updateMarketingConsent(principal.getId(), dto.marketingConsent());
        return ResponseEntity.ok(response);
    }
}
