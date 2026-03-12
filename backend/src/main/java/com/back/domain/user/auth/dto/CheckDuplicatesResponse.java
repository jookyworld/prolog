package com.back.domain.user.auth.dto;

public record CheckDuplicatesResponse(
        boolean usernameAvailable,
        boolean emailAvailable,
        boolean nicknameAvailable
) {}
