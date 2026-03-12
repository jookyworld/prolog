package com.back.domain.user.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EmailVerificationConfirmDto(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6, max = 6) String code
) {}
