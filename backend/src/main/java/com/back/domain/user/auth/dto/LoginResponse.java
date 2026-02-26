package com.back.domain.user.auth.dto;

import com.back.domain.user.user.dto.UserResponse;

public record LoginResponse(
        UserResponse userResponse,
        String accessToken,
        String refreshToken
) {
    public static LoginResponse from(UserResponse userResponse, String accessToken, String refreshToken) {
        return new LoginResponse(
                userResponse,
                accessToken,
                refreshToken
        );
    }
}
