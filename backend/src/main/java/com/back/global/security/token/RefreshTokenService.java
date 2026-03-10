package com.back.global.security.token;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final StringRedisTemplate redisTemplate;
    private static final String KEY_PREFIX = "refresh:";
    @Value("${jwt.refresh-exp}")
    private int refreshExp;

    public void saveRefreshToken(Long userId, String refreshToken) {
        String key = KEY_PREFIX + userId;
        redisTemplate.opsForValue().set(key, refreshToken, Duration.ofMillis(refreshExp));
    }

    public boolean validateRefreshToken(Long userId, String refreshToken) {
        String key = KEY_PREFIX + userId;
        String stored = redisTemplate.opsForValue().get(key);

        return stored != null && stored.equals(refreshToken);
    }

    public void deleteRefreshToken(Long userId) {
        String key = KEY_PREFIX + userId;
        redisTemplate.delete(key);
    }

}
