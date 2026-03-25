package com.back.domain.user.block.controller;

import com.back.domain.user.block.dto.BlockedUserResponse;
import com.back.domain.user.block.service.UserBlockService;
import com.back.global.security.principal.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserBlockController {

    private final UserBlockService userBlockService;

    @GetMapping("/blocked")
    public List<BlockedUserResponse> getBlockedUsers(@AuthenticationPrincipal UserPrincipal principal) {
        return userBlockService.getBlockedUsers(principal.getId());
    }

    @PostMapping("/{userId}/block")
    public ResponseEntity<Void> blockUser(@AuthenticationPrincipal UserPrincipal principal,
                                          @PathVariable Long userId) {
        userBlockService.blockUser(principal.getId(), userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}/block")
    public ResponseEntity<Void> unblockUser(@AuthenticationPrincipal UserPrincipal principal,
                                            @PathVariable Long userId) {
        userBlockService.unblockUser(principal.getId(), userId);
        return ResponseEntity.noContent().build();
    }
}
