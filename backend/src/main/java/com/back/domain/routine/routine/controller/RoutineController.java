package com.back.domain.routine.routine.controller;

import com.back.domain.routine.routine.dto.*;
import com.back.domain.routine.routine.entity.Routine;
import com.back.domain.routine.routine.service.RoutineService;
import com.back.global.security.principal.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/routines")
public class RoutineController {
    private final RoutineService routineService;

    @PostMapping
    public RoutineResponse createRoutine(@AuthenticationPrincipal UserPrincipal principal,
                                         @Valid @RequestBody RoutineCreateRequest request) {
        Routine routine = routineService.createRoutine(principal.getId(), request);
        return RoutineResponse.from(routine);
    }

    @GetMapping("/{routineId}")
    public RoutineDetailResponse getRoutineDetail(@AuthenticationPrincipal UserPrincipal principal,
                                                  @PathVariable Long routineId) {
        return routineService.getRoutineDetail(principal.getId(), routineId);
    }

    @GetMapping
    public List<RoutineResponse> getMyRoutines(@AuthenticationPrincipal UserPrincipal principal,
                                               @RequestParam(name = "status", defaultValue = "ACTIVE")RoutineStatusFilter status) {
        return routineService.getMyRoutines(principal.getId(), status);
    }

    @PatchMapping("/{routineId}/activate")
    public RoutineResponse activateRoutine(@AuthenticationPrincipal UserPrincipal principal,
                                           @PathVariable Long routineId) {
        return routineService.activateRoutine(principal.getId(), routineId);
    }

    @PatchMapping("/{routineId}/archive")
    public RoutineResponse archiveRoutine(@AuthenticationPrincipal UserPrincipal principal,
                                          @PathVariable Long routineId) {
        return routineService.archiveRoutine(principal.getId(), routineId);
    }

    @PutMapping("/{routineId}")
    public RoutineDetailResponse updateRoutine(@AuthenticationPrincipal UserPrincipal principal,
                                               @PathVariable Long routineId,
                                               @Valid @RequestBody RoutineUpdateRequest request) {
        return routineService.updateRoutine(principal.getId(), routineId, request);
    }

    @DeleteMapping("/{routineId}")
    public ResponseEntity<Void> deleteRoutine(@AuthenticationPrincipal UserPrincipal principal,
                                              @PathVariable Long routineId) {
        routineService.deleteRoutine(principal.getId(), routineId);
        return ResponseEntity.noContent().build();
    }
}
