package com.back.domain.routine.routine.service;

import com.back.domain.exercise.entity.Exercise;
import com.back.domain.exercise.repository.ExerciseRepository;
import com.back.domain.routine.routine.dto.*;
import com.back.domain.routine.routine.entity.Routine;
import com.back.domain.routine.routine.repository.RoutineRepository;
import com.back.domain.routine.routineItem.dto.RoutineItemCreateRequest;
import com.back.domain.routine.routineItem.dto.RoutineItemDetailResponse;
import com.back.domain.routine.routineItem.entity.RoutineItem;
import com.back.domain.routine.routineItem.repository.RoutineItemRepository;
import com.back.domain.user.user.entity.User;
import com.back.domain.user.user.repository.UserRepository;
import com.back.global.exception.type.BadRequestException;
import com.back.global.exception.type.ForbiddenException;
import com.back.global.exception.type.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoutineService {
    private final RoutineRepository routineRepository;
    private final UserRepository userRepository;
    private final ExerciseRepository exerciseRepository;
    private final RoutineItemRepository routineItemRepository;

    @Transactional
    public Routine createRoutine(Long userId, RoutineCreateRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        Routine routine = Routine.builder()
                .user(user)
                .title(request.title())
                .description(request.description())
                .active(true)
                .build();

        routineRepository.save(routine);

        int order = 1;
        for (RoutineItemCreateRequest i : request.routineItems()) {
            Exercise exercise = exerciseRepository.findById(i.exerciseId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 운동 종목입니다."));

            RoutineItem routineItem = RoutineItem.builder()
                    .routine(routine)
                    .exercise(exercise)
                    .orderInRoutine(order++)
                    .sets(i.sets())
                    .restSeconds(i.restSeconds())
                    .build();

            routineItemRepository.save(routineItem);
        }

        return routine;
    }

    @Transactional(readOnly = true)
    public RoutineDetailResponse getRoutineDetail(Long userId, Long routineId) {
        Routine routine = getRoutineAndValidateOwner(userId, routineId);

        List<RoutineItem> routineItems = routineItemRepository.findByRoutineIdOrderByOrderInRoutineAsc(routineId);

        List<RoutineItemDetailResponse> routineItemDetailResponses = routineItems.stream()
                .map(RoutineItemDetailResponse::from)
                .toList();

        return RoutineDetailResponse.of(routine, routineItemDetailResponses);
    }

    @Transactional(readOnly = true)
    public List<RoutineResponse> getMyRoutines(Long userId, RoutineStatusFilter status) {
        List<Routine> routines;

        switch (status) {
            case ACTIVE -> routines =
                    routineRepository.findByUserIdAndActiveTrueOrderByCreatedAtDesc(userId);
            case ARCHIVED -> routines =
                    routineRepository.findByUserIdAndActiveFalseOrderByCreatedAtDesc(userId);
            case ALL -> routines =
                    routineRepository.findByUserIdOrderByCreatedAtDesc(userId);
            default -> throw new BadRequestException("지원하지 않는 루틴 상태입니다: " + status);
        }

        return routines.stream()
                .map(RoutineResponse::from)
                .toList();
    }

    @Transactional
    public RoutineResponse activateRoutine(Long userId, Long routineId) {
        Routine routine = getRoutineAndValidateOwner(userId, routineId);
        routine.activate();
        return RoutineResponse.from(routine);
    }

    @Transactional
    public RoutineResponse archiveRoutine(Long userId, Long routineId) {
        Routine routine = getRoutineAndValidateOwner(userId, routineId);
        routine.archive();
        return RoutineResponse.from(routine);
    }

    @Transactional
    public RoutineDetailResponse updateRoutine(Long userId, Long routineId, RoutineUpdateRequest request) {
        Routine routine = getRoutineAndValidateOwner(userId, routineId);

        routine.update(request.title(), request.description());

        // 기존 루틴 아이템 삭제 후 새로 생성
        routineItemRepository.deleteAll(
                routineItemRepository.findByRoutineIdOrderByOrderInRoutineAsc(routineId)
        );

        int order = 1;
        for (RoutineItemCreateRequest i : request.routineItems()) {
            Exercise exercise = exerciseRepository.findById(i.exerciseId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 운동 종목입니다."));

            RoutineItem routineItem = RoutineItem.builder()
                    .routine(routine)
                    .exercise(exercise)
                    .orderInRoutine(order++)
                    .sets(i.sets())
                    .restSeconds(i.restSeconds())
                    .build();

            routineItemRepository.save(routineItem);
        }

        List<RoutineItem> updatedItems = routineItemRepository.findByRoutineIdOrderByOrderInRoutineAsc(routineId);
        List<RoutineItemDetailResponse> itemResponses = updatedItems.stream()
                .map(RoutineItemDetailResponse::from)
                .toList();

        return RoutineDetailResponse.of(routine, itemResponses);
    }

    @Transactional
    public void deleteRoutine(Long userId, Long routineId) {
        Routine routine = getRoutineAndValidateOwner(userId, routineId);
        routineItemRepository.deleteAll(
                routineItemRepository.findByRoutineIdOrderByOrderInRoutineAsc(routineId)
        );
        routineRepository.delete(routine);
    }

    private Routine getRoutineAndValidateOwner(Long userId, Long routineId) {
        Routine routine = routineRepository.findById(routineId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 루틴입니다."));

        if (!userId.equals(routine.getUser().getId())) {
            throw new ForbiddenException("권한이 없습니다.");
        }

        return routine;
    }
}
