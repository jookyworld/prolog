package com.back.domain.user.auth.controller;

import com.back.domain.user.auth.dto.LoginRequest;
import com.back.domain.user.auth.dto.LoginResponse;
import com.back.domain.user.auth.dto.SignupRequest;
import com.back.domain.user.auth.service.AuthService;
import com.back.domain.user.user.dto.UserResponse;
import com.back.domain.user.user.entity.User;
import com.back.domain.user.user.service.UserService;
import com.back.global.cookieManager.CookieManager;
import com.back.global.exception.type.UnauthorizedException;
import com.back.global.security.jwt.JwtTokenProvider;
import com.back.global.security.jwt.JwtTokenResolver;
import com.back.global.security.principal.UserPrincipal;
import com.back.global.security.token.RefreshTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtTokenResolver jwtTokenResolver;
    private final CookieManager cookieManager;
    private final RefreshTokenService refreshTokenService;
    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<UserResponse> signup(@Valid @RequestBody SignupRequest dto) {
        UserResponse userResponse = authService.signup(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(userResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest dto) {
        User user = authService.login(dto);

        // 토큰 발급
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getRole());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        // refreshToken 저장
        refreshTokenService.saveRefreshToken(user.getId(), refreshToken);

        // 쿠키에 토큰 넣기
        cookieManager.setAccessToken(accessToken);
        cookieManager.setRefreshToken(refreshToken);

        UserResponse userResponse = UserResponse.from(user);

        return ResponseEntity.ok(LoginResponse.from(userResponse, accessToken, refreshToken));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUserById(principal.getId());
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal != null) {
            authService.logout(principal.getId());
        }

        cookieManager.clearAuthCookies();

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshAuth(HttpServletRequest request) {
        // 요청 refreshToken 조회 및 위변조 확인
        String refreshToken = jwtTokenResolver.resolveRefreshToken(request);
        if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("리프레시 토큰이 유효하지 않습니다.");
        }

        // 저장 refreshToken 과 비교 검증
        Long userId = jwtTokenProvider.getUserId(refreshToken);
        if (!refreshTokenService.validateRefreshToken(userId, refreshToken)) {
            throw new UnauthorizedException("리프레시 토큰이 만료되었습니다.");
        }

        User user = userService.getUserById(userId);
        String newAccessToken = jwtTokenProvider.generateAccessToken(userId, user.getRole());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(userId);
        refreshTokenService.saveRefreshToken(userId, newRefreshToken);

        cookieManager.setAccessToken(newAccessToken);
        cookieManager.setRefreshToken(newRefreshToken);

        UserResponse userResponse = UserResponse.from(user);
        return ResponseEntity.ok(LoginResponse.from(userResponse, newAccessToken, newRefreshToken));
    }

    @DeleteMapping("/deleteMe")
    public ResponseEntity<Void> deleteMe(@AuthenticationPrincipal UserPrincipal principal) {
        authService.deleteMe(principal.getId());
        cookieManager.clearAuthCookies();
        return ResponseEntity.noContent().build();
    }
}
