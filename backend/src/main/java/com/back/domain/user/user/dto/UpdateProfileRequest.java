package com.back.domain.user.user.dto;

import com.back.domain.user.user.entity.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "닉네임은 필수입니다.")
        @Size(min = 2, max = 50, message = "닉네임은 2~50자여야 합니다.")
        String nickname,

        @NotNull(message = "성별은 필수입니다.")
        Gender gender,

        double height,

        double weight
) {}
