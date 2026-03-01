package com.back.domain.community.sharedRoutine.service;

import com.back.domain.community.comment.dto.CommentResponse;
import com.back.domain.community.comment.entity.Comment;
import com.back.domain.community.comment.repository.CommentRepository;
import com.back.domain.community.sharedRoutine.dto.*;
import com.back.domain.community.sharedRoutine.entity.SharedRoutine;
import com.back.domain.community.sharedRoutine.repository.SharedRoutineRepository;
import com.back.domain.exercise.entity.BodyPart;
import com.back.domain.exercise.entity.Exercise;
import com.back.domain.exercise.repository.ExerciseRepository;
import com.back.domain.routine.routine.dto.RoutineResponse;
import com.back.domain.routine.routine.entity.Routine;
import com.back.domain.routine.routine.repository.RoutineRepository;
import com.back.domain.routine.routineItem.entity.RoutineItem;
import com.back.domain.routine.routineItem.repository.RoutineItemRepository;
import com.back.domain.user.user.entity.User;
import com.back.domain.user.user.repository.UserRepository;
import com.back.domain.workout.session.entity.WorkoutSession;
import com.back.domain.workout.session.repository.WorkoutSessionRepository;
import com.back.domain.workout.set.entity.WorkoutSet;
import com.back.domain.workout.set.repository.WorkoutSetRepository;
import com.back.global.exception.type.BadRequestException;
import com.back.global.exception.type.ForbiddenException;
import com.back.global.exception.type.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SharedRoutineService {

    private final SharedRoutineRepository sharedRoutineRepository;
    private final UserRepository userRepository;
    private final RoutineRepository routineRepository;
    private final RoutineItemRepository routineItemRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final WorkoutSetRepository workoutSetRepository;
    private final ExerciseRepository exerciseRepository;
    private final CommentRepository commentRepository;

    @Transactional
    public SharedRoutineDetailResponse shareRoutine(Long userId, SharedRoutineCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 회원입니다."));

        Routine routine = routineRepository.findById(request.routineId())
                .orElseThrow(() -> new NotFoundException("존재하지 않는 루틴입니다."));

        if (!userId.equals(routine.getUser().getId())) {
            throw new ForbiddenException("권한이 없습니다.");
        }

        // 루틴 아이템 조회 및 스냅샷 생성
        List<RoutineItem> routineItems = routineItemRepository.findByRoutineIdOrderByOrderInRoutineAsc(request.routineId());

        if (routineItems.isEmpty()) {
            throw new BadRequestException("운동이 없는 루틴은 공유할 수 없습니다.");
        }

        List<RoutineSnapshotItem> snapshotItems = routineItems.stream()
                .map(item -> new RoutineSnapshotItem(
                        item.getExercise().getId(),
                        item.getExercise().getName(),
                        item.getExercise().getBodyPart(),
                        item.getOrderInRoutine(),
                        item.getSets(),
                        item.getRestSeconds()
                ))
                .toList();

        RoutineSnapshotWrapper routineSnapshot = new RoutineSnapshotWrapper(snapshotItems);

        // 마지막 완료 세션 조회
        Optional<WorkoutSession> lastSessionOpt = workoutSessionRepository
                .findTopByUser_IdAndRoutine_IdAndCompletedAtIsNotNullOrderByCompletedAtDesc(userId, request.routineId());

        SessionSnapshotWrapper sessionSnapshot = null;
        if (lastSessionOpt.isPresent()) {
            WorkoutSession lastSession = lastSessionOpt.get();
            List<WorkoutSet> workoutSets = workoutSetRepository.findByWorkoutSession_IdOrderByCreatedAtAsc(lastSession.getId());

            // exerciseName 기준으로 그룹핑 (순서 유지)
            Map<String, List<SessionSnapshotSet>> exerciseMap = new LinkedHashMap<>();
            double totalVolume = 0;

            for (WorkoutSet set : workoutSets) {
                String exerciseName = set.getExercise().getName();
                exerciseMap.computeIfAbsent(exerciseName, k -> new ArrayList<>())
                        .add(new SessionSnapshotSet(set.getSetNumber(), set.getWeight(), set.getReps()));
                totalVolume += set.getWeight() * set.getReps();
            }

            List<SessionSnapshotExercise> exercises = exerciseMap.entrySet().stream()
                    .map(entry -> new SessionSnapshotExercise(entry.getKey(), entry.getValue()))
                    .toList();

            // 운동 시간 계산 (초)
            int duration = (int) java.time.Duration.between(
                    lastSession.getStartedAt(),
                    lastSession.getCompletedAt()
            ).getSeconds();

            sessionSnapshot = new SessionSnapshotWrapper(
                    lastSession.getCompletedAt(),
                    duration,
                    totalVolume,
                    exercises
            );
        }

        SharedRoutine sharedRoutine = SharedRoutine.builder()
                .user(user)
                .title(request.title())
                .description(request.description())
                .routineSnapshot(routineSnapshot)
                .lastSessionSnapshot(sessionSnapshot)
                .build();

        sharedRoutineRepository.save(sharedRoutine);

        return SharedRoutineDetailResponse.from(sharedRoutine, List.of());
    }

    @Transactional(readOnly = true)
    public Page<SharedRoutineResponse> getSharedRoutines(int page, int size, SharedRoutineSortType sortType) {
        Sort sort = switch (sortType) {
            case RECENT -> Sort.by(Sort.Direction.DESC, "createdAt");
            case POPULAR -> Sort.by(Sort.Direction.DESC, "viewCount");
            case IMPORTED -> Sort.by(Sort.Direction.DESC, "importCount");
        };

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<SharedRoutine> sharedRoutines = sharedRoutineRepository.findAll(pageable);

        return sharedRoutines.map(SharedRoutineResponse::from);
    }

    @Transactional
    public SharedRoutineDetailResponse getSharedRoutineDetail(Long sharedRoutineId) {
        SharedRoutine sharedRoutine = sharedRoutineRepository.findById(sharedRoutineId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 공유 루틴입니다."));

        sharedRoutine.incrementViewCount();

        List<Comment> comments = commentRepository.findBySharedRoutineIdOrderByCreatedAtAsc(sharedRoutineId);
        List<CommentResponse> commentResponses = comments.stream()
                .map(CommentResponse::from)
                .toList();

        return SharedRoutineDetailResponse.from(sharedRoutine, commentResponses);
    }

    @Transactional
    public RoutineResponse importRoutine(Long userId, Long sharedRoutineId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 회원입니다."));

        SharedRoutine sharedRoutine = sharedRoutineRepository.findById(sharedRoutineId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 공유 루틴입니다."));

        // 새 루틴 생성
        Routine newRoutine = Routine.builder()
                .user(user)
                .title(sharedRoutine.getTitle())
                .description(sharedRoutine.getDescription())
                .active(true)
                .build();

        routineRepository.save(newRoutine);

        // 운동 종목 매칭 및 루틴 아이템 생성
        List<RoutineSnapshotItem> snapshotItems = sharedRoutine.getRoutineSnapshot().items();

        for (RoutineSnapshotItem item : snapshotItems) {
            Exercise exercise = matchExercise(userId, item);

            RoutineItem routineItem = RoutineItem.builder()
                    .routine(newRoutine)
                    .exercise(exercise)
                    .orderInRoutine(item.orderInRoutine())
                    .sets(item.sets())
                    .restSeconds(item.restSeconds())
                    .build();

            routineItemRepository.save(routineItem);
        }

        // importCount 증가
        sharedRoutine.incrementImportCount();

        return RoutineResponse.from(newRoutine);
    }

    private Exercise matchExercise(Long userId, RoutineSnapshotItem item) {
        // 1. exerciseId로 조회
        Optional<Exercise> exerciseOpt = exerciseRepository.findById(item.exerciseId());

        if (exerciseOpt.isPresent()) {
            Exercise exercise = exerciseOpt.get();

            // 2. 공식 종목이면 바로 사용
            if (!exercise.isCustom()) {
                return exercise;
            }

            // 3. 커스텀 종목이고 본인 소유이면 바로 사용
            if (exercise.getCreatedBy() != null && userId.equals(exercise.getCreatedBy().getId())) {
                return exercise;
            }

            // 4. 커스텀 종목이지만 타인 소유 → fallback
        }

        // 5. exerciseId가 없거나 타인 커스텀 종목인 경우 → fallback
        // 동일한 name + bodyPart + 본인 소유 커스텀 종목 찾기
        Optional<Exercise> userCustomExercise = exerciseRepository
                .findByNameAndBodyPartAndCreatedBy_Id(item.exerciseName(), item.bodyPart(), userId);

        if (userCustomExercise.isPresent()) {
            return userCustomExercise.get();
        }

        // 6. 없으면 새 커스텀 운동 생성
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 회원입니다."));

        Exercise newExercise = Exercise.builder()
                .name(item.exerciseName())
                .bodyPart(item.bodyPart())
                .custom(true)
                .createdBy(user)
                .build();

        exerciseRepository.save(newExercise);

        return newExercise;
    }
}
