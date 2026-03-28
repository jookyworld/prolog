package com.back.domain.user.user.controller;

import com.back.domain.user.user.dto.UserResponse;
import com.back.domain.user.user.entity.Role;
import com.back.domain.user.user.service.UserService;
import com.back.global.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public PageResponse<UserResponse> getUsers(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return userService.adminGetUsers(keyword, role, page, size);
    }

    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable Long id) {
        return userService.adminGetUser(id);
    }
}
