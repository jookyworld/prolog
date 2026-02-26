package com.back.global.cookieManager;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CookieManager {
    private final HttpServletResponse httpServletResponse;
    @Value("${jwt.access-exp}")
    private int accessExp;
    @Value("${jwt.refresh-exp}")
    private int refreshExp;

    public void setAccessToken(String token) {
        setCookie("accessToken", token, accessExp);
    }

    public void setRefreshToken(String token) {
        setCookie("refreshToken", token, refreshExp);
    }

    public void clearAuthCookies() {
        deleteCookie("accessToken");
        deleteCookie("refreshToken");
    }


    public void setCookie(String name, String value, int maxAge) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(maxAge)
                .build();

        httpServletResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void deleteCookie(String name) {
        setCookie(name, "", 0);
    }

}
