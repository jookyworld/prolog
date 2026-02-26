package com.back.global.exception;

public record ErrorResponse(
        String title,
        String message
) {
    public static ErrorResponse of(String title, String message) {
        return new ErrorResponse(title, message);
    }
}
