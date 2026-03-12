package com.back.global.security.token;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class PasswordResetTokenService {

    private final StringRedisTemplate redisTemplate;
    private static final String KEY_PREFIX = "pwd-reset:";
    private static final String ATTEMPT_PREFIX = "pwd-reset-attempts:";
    private static final Duration TTL = Duration.ofMinutes(10);
    private static final int MAX_ATTEMPTS = 5;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public String generateAndSave(String email) {
        String code = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
        redisTemplate.opsForValue().set(KEY_PREFIX + email, code, TTL);
        redisTemplate.delete(ATTEMPT_PREFIX + email);
        return code;
    }

    public boolean validate(String email, String code) {
        String attemptKey = ATTEMPT_PREFIX + email;
        String attemptsStr = redisTemplate.opsForValue().get(attemptKey);
        int attempts = attemptsStr != null ? Integer.parseInt(attemptsStr) : 0;

        if (attempts >= MAX_ATTEMPTS) {
            redisTemplate.delete(KEY_PREFIX + email);
            redisTemplate.delete(attemptKey);
            return false;
        }

        String stored = redisTemplate.opsForValue().get(KEY_PREFIX + email);
        if (stored != null && stored.equals(code)) {
            return true;
        }

        redisTemplate.opsForValue().increment(attemptKey);
        redisTemplate.expire(attemptKey, TTL);
        return false;
    }

    public void delete(String email) {
        redisTemplate.delete(KEY_PREFIX + email);
        redisTemplate.delete(ATTEMPT_PREFIX + email);
    }
}
