package com.back.domain.stats.controller;

import com.back.domain.stats.dto.HomeStatsResponse;
import com.back.domain.stats.service.StatsService;
import com.back.global.security.principal.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/home")
    public ResponseEntity<HomeStatsResponse> getHomeStats(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(statsService.getHomeStats(principal.getId()));
    }
}
