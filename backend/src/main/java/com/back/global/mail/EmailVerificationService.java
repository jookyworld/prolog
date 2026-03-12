package com.back.global.mail;

import com.back.global.exception.type.BadRequestException;
import com.back.global.exception.type.TooManyRequestsException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final StringRedisTemplate redisTemplate;
    private static final String CODE_PREFIX = "email-verify:";
    private static final String VERIFIED_PREFIX = "email-verify-verified:";
    private static final String ATTEMPT_PREFIX = "email-verify-attempts:";
    private static final String RATE_PREFIX = "email-verify-rate:";
    private static final Duration CODE_TTL = Duration.ofMinutes(10);
    private static final Duration VERIFIED_TTL = Duration.ofMinutes(30);
    private static final int MAX_REQUESTS = 3;
    private static final int MAX_ATTEMPTS = 5;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public String generateAndSave(String email) {
        String rateKey = RATE_PREFIX + email;
        String countStr = redisTemplate.opsForValue().get(rateKey);
        int count = countStr != null ? Integer.parseInt(countStr) : 0;

        if (count >= MAX_REQUESTS) {
            throw new TooManyRequestsException("잠시 후 다시 시도해주세요. (10분에 최대 3회)");
        }

        Long newCount = redisTemplate.opsForValue().increment(rateKey);
        if (newCount == 1) {
            redisTemplate.expire(rateKey, CODE_TTL);
        }

        String code = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
        redisTemplate.opsForValue().set(CODE_PREFIX + email, code, CODE_TTL);
        redisTemplate.delete(ATTEMPT_PREFIX + email);
        return code;
    }

    public void verify(String email, String code) {
        String attemptKey = ATTEMPT_PREFIX + email;
        String attemptsStr = redisTemplate.opsForValue().get(attemptKey);
        int attempts = attemptsStr != null ? Integer.parseInt(attemptsStr) : 0;

        if (attempts >= MAX_ATTEMPTS) {
            redisTemplate.delete(CODE_PREFIX + email);
            redisTemplate.delete(attemptKey);
            throw new TooManyRequestsException("인증 코드 입력 횟수를 초과했습니다. 새 코드를 요청해주세요.");
        }

        String stored = redisTemplate.opsForValue().get(CODE_PREFIX + email);
        if (stored == null || !stored.equals(code)) {
            redisTemplate.opsForValue().increment(attemptKey);
            redisTemplate.expire(attemptKey, CODE_TTL);
            throw new BadRequestException("인증 코드가 올바르지 않거나 만료되었습니다.");
        }

        redisTemplate.delete(CODE_PREFIX + email);
        redisTemplate.delete(attemptKey);
        redisTemplate.opsForValue().set(VERIFIED_PREFIX + email, "1", VERIFIED_TTL);
    }

    public boolean isVerified(String email) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(VERIFIED_PREFIX + email));
    }

    public void deleteVerified(String email) {
        redisTemplate.delete(VERIFIED_PREFIX + email);
        redisTemplate.delete(RATE_PREFIX + email);
    }
}
