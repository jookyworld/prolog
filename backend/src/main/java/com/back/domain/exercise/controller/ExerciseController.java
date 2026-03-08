package com.back.domain.exercise.controller;

import com.back.domain.exercise.dto.ExerciseCreateRequest;
import com.back.domain.exercise.dto.ExerciseResponse;
import com.back.domain.exercise.dto.ExerciseUpdateRequest;
import com.back.domain.exercise.service.ExerciseService;
import com.back.global.security.principal.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/exercises")
public class ExerciseController {
    private final ExerciseService exerciseService;

    @GetMapping
    public List<ExerciseResponse> getExercisesForUser(@AuthenticationPrincipal UserPrincipal principal) {
        return exerciseService.getExercisesForUser(principal.getId());
    }

    @GetMapping("/custom")
    public List<ExerciseResponse> getCustomExercises(@AuthenticationPrincipal UserPrincipal principal) {
        return exerciseService.getCustomExercises(principal.getId());
    }

    @PostMapping("/custom")
    public ExerciseResponse createCustomExercise(@AuthenticationPrincipal UserPrincipal principal,
                                                 @RequestBody ExerciseCreateRequest request) {
        return exerciseService.createCustomExercise(principal.getId(), request);
    }

    @PutMapping("/custom/{id}")
    public ExerciseResponse updateCustomExercise(@AuthenticationPrincipal UserPrincipal principal,
                                                 @PathVariable Long id,
                                                 @RequestBody ExerciseUpdateRequest request) {
        return exerciseService.updateCustomExercise(principal.getId(), id, request);
    }

    @DeleteMapping("/custom/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCustomExercise(@AuthenticationPrincipal UserPrincipal principal,
                                     @PathVariable Long id,
                                     @RequestParam(defaultValue = "false") boolean force) {
        exerciseService.deleteCustomExercise(principal.getId(), id, force);
    }
}
