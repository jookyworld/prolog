package com.back.global.exception.type;

public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
