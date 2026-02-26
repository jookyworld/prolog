package com.back.domain.user.auth.dto;

import com.back.domain.user.user.entity.Gender;
import jakarta.validation.constraints.*;

public record SignupRequest(
        @NotBlank
        @Size(min = 5, max = 20)
        String username,

        @NotBlank
        @Size(min = 8, max = 30)
        String password,

        @NotBlank
        @Email
        String email,

        @NotBlank
        @Size(min = 4, max = 30)
        String nickname,

        Gender gender,

        double height,

        double weight
) {
}
