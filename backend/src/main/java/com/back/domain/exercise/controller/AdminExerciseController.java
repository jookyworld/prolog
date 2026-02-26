package com.back.domain.exercise.controller;

import com.back.domain.exercise.dto.AdminExerciseResponse;
import com.back.domain.exercise.dto.ExerciseCreateRequest;
import com.back.domain.exercise.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/exercises")
@PreAuthorize("hasRole('ADMIN')")
public class AdminExerciseController {
    private final ExerciseService exerciseService;

    @GetMapping
    public List<AdminExerciseResponse> getAllExercises() {
        return exerciseService.adminGetAllExercises();
    }

    @PostMapping
    public AdminExerciseResponse createAdminExercise(@RequestBody ExerciseCreateRequest request) {
        return exerciseService.adminCreateExercise(request);
    }
}
