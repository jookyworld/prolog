package com.back.domain.user.user.dto;

import com.back.domain.user.user.entity.Gender;
import com.back.domain.user.user.entity.Role;
import com.back.domain.user.user.entity.User;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String username,
        String email,
        String nickname,
        Gender gender,
        double height,
        double weight,
        Role role,
        LocalDateTime createdAt
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getNickname(),
                user.getGender(),
                user.getHeight(),
                user.getWeight(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
