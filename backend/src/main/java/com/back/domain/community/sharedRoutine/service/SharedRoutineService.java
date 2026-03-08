package com.back.domain.community.sharedRoutine.service;

import com.back.domain.community.comment.dto.CommentResponse;
import com.back.domain.community.comment.entity.Comment;
import com.back.domain.community.comment.repository.CommentRepository;
import com.back.domain.community.sharedRoutine.dto.*;
import com.back.domain.community.sharedRoutine.entity.SharedRoutine;
import com.back.domain.community.sharedRoutine.repository.SharedRoutineRepository;
import com.back.domain.exercise.entity.Exercise;
import com.back.domain.exercise.repository.ExerciseRepository;
import com.back.domain.routine.routine.dto.RoutineResponse;
import com.back.domain.routine.routine.entity.Routine;
import com.back.domain.routine.routine.repository.RoutineRepository;
import com.back.domain.routine.routineItem.entity.RoutineItem;
import com.back.domain.routine.routineItem.repository.RoutineItemRepository;
import com.back.domain.user.user.entity.User;
import com.back.domain.user.user.repository.UserRepository;
import com.back.global.exception.type.BadRequestException;
import com.back.global.exception.type.ForbiddenException;
import com.back.global.exception.type.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SharedRoutineService {

    private final SharedRoutineRepository sharedRoutineRepository;
    private final UserRepository userRepository;
    private final RoutineRepository routineRepository;
    private final RoutineItemRepository routineItemRepository;
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

        SharedRoutine sharedRoutine = SharedRoutine.builder()
                .user(user)
                .title(request.title())
                .description(request.description())
                .routineSnapshot(routineSnapshot)
                .build();

        sharedRoutineRepository.save(sharedRoutine);

        return SharedRoutineDetailResponse.from(sharedRoutine, List.of());
    }

    @Transactional(readOnly = true)
    public Page<SharedRoutineResponse> getSharedRoutines(int page, int size, SharedRoutineSortType sortType) {
        Page<SharedRoutine> sharedRoutines;
        if (sortType == SharedRoutineSortType.POPULAR) {
            sharedRoutines = sharedRoutineRepository.findAllOrderByPopularity(PageRequest.of(page, size));
        } else {
            sharedRoutines = sharedRoutineRepository.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        }

        List<Long> ids = sharedRoutines.getContent().stream().map(SharedRoutine::getId).toList();
        Map<Long, Integer> commentCounts = commentRepository.countBySharedRoutineIdIn(ids)
                .stream().collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> ((Long) row[1]).intValue()
                ));

        return sharedRoutines.map(sr ->
                SharedRoutineResponse.from(sr, commentCounts.getOrDefault(sr.getId(), 0)));
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

        Routine newRoutine = Routine.builder()
                .user(user)
                .title(sharedRoutine.getTitle())
                .description(sharedRoutine.getDescription())
                .active(true)
                .build();

        routineRepository.save(newRoutine);

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

        sharedRoutine.incrementImportCount();

        return RoutineResponse.from(newRoutine);
    }

    private Exercise matchExercise(Long userId, RoutineSnapshotItem item) {
        Optional<Exercise> exerciseOpt = exerciseRepository.findById(item.exerciseId());

        if (exerciseOpt.isPresent()) {
            Exercise exercise = exerciseOpt.get();

            if (!exercise.isCustom()) {
                return exercise;
            }

            if (exercise.getCreatedBy() != null && userId.equals(exercise.getCreatedBy().getId())) {
                return exercise;
            }
        }

        Optional<Exercise> userCustomExercise = exerciseRepository
                .findByNameAndBodyPartAndCreatedBy_Id(item.exerciseName(), item.bodyPart(), userId);

        if (userCustomExercise.isPresent()) {
            return userCustomExercise.get();
        }

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
