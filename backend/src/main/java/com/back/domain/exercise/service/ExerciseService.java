package com.back.domain.exercise.service;

import com.back.domain.exercise.dto.AdminExerciseResponse;
import com.back.domain.exercise.dto.ExerciseCreateRequest;
import com.back.domain.exercise.dto.ExerciseResponse;
import com.back.domain.exercise.dto.ExerciseUpdateRequest;
import com.back.domain.exercise.entity.Exercise;
import com.back.domain.exercise.repository.ExerciseRepository;
import com.back.domain.routine.routineItem.repository.RoutineItemRepository;
import com.back.domain.user.user.entity.User;
import com.back.domain.user.user.repository.UserRepository;
import com.back.domain.workout.session.repository.WorkoutSessionRepository;
import com.back.domain.workout.sessionexercise.repository.WorkoutSessionExerciseRepository;
import com.back.global.exception.type.BadRequestException;
import com.back.global.exception.type.ConflictException;
import com.back.global.exception.type.ForbiddenException;
import com.back.global.exception.type.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExerciseService {
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;
    private final RoutineItemRepository routineItemRepository;
    private final WorkoutSessionExerciseRepository workoutSessionExerciseRepository;
    private final WorkoutSessionRepository workoutSessionRepository;

    public List<ExerciseResponse> getExercisesForUser(Long userId) {
        return exerciseRepository.findAllForUser(userId)
                .stream()
                .map(ExerciseResponse::from)
                .toList();
    }

    @Transactional
    public ExerciseResponse createCustomExercise(Long userId, ExerciseCreateRequest request) {
        if (exerciseRepository.existsByNameAndCustomIsFalse(request.name())) {
            throw new IllegalArgumentException("기본 종목에 이미 존재하는 운동입니다.");
        }

        if (exerciseRepository.existsByNameAndCustomIsTrueAndCreatedBy_Id(request.name(), userId)) {
            throw new IllegalArgumentException("이미 추가한 커스텀 운동 종목입니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다. id=" + userId));

        Exercise exercise = Exercise.builder()
                .name(request.name())
                .bodyPart(request.bodyPart())
                .partDetail(request.partDetail())
                .custom(true)
                .createdBy(user)
                .build();

        exerciseRepository.save(exercise);
        return ExerciseResponse.from(exercise);
    }



    @Transactional(readOnly = true)
    public List<ExerciseResponse> getCustomExercises(Long userId) {
        return exerciseRepository.findAllByCustomIsTrueAndCreatedBy_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(ExerciseResponse::from)
                .toList();
    }

    @Transactional
    public ExerciseResponse updateCustomExercise(Long userId, Long exerciseId, ExerciseUpdateRequest request) {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 종목입니다."));

        if (!exercise.isCustom() || !exercise.getCreatedBy().getId().equals(userId)) {
            throw new ForbiddenException("수정 권한이 없습니다.");
        }

        if (exerciseRepository.existsByNameAndCustomIsFalse(request.name())) {
            throw new IllegalArgumentException("기본 종목에 이미 존재하는 운동입니다.");
        }

        if (exerciseRepository.existsByNameAndCustomIsTrueAndCreatedBy_IdAndIdNot(request.name(), userId, exerciseId)) {
            throw new IllegalArgumentException("이미 사용 중인 종목 이름입니다.");
        }

        exercise.update(request.name(), request.bodyPart(), request.partDetail());
        return ExerciseResponse.from(exercise);
    }

    @Transactional
    public void deleteCustomExercise(Long userId, Long exerciseId, boolean force) {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 종목입니다."));

        if (!exercise.isCustom() || !exercise.getCreatedBy().getId().equals(userId)) {
            throw new ForbiddenException("삭제 권한이 없습니다.");
        }

        if (routineItemRepository.existsByExercise_IdAndRoutine_ActiveTrueAndRoutine_User_Id(exerciseId, userId)) {
            throw new BadRequestException("활성 루틴에서 사용 중인 종목은 삭제할 수 없습니다.");
        }

        long archivedCount = routineItemRepository.countByExercise_IdAndRoutine_ActiveFalseAndRoutine_User_Id(exerciseId, userId);
        if (archivedCount > 0 && !force) {
            throw new ConflictException("보관된 루틴 " + archivedCount + "개에서 사용 중입니다. 삭제 시 해당 루틴에서 이 종목이 제거됩니다.");
        }

        if (archivedCount > 0) {
            routineItemRepository.deleteByExerciseInArchivedRoutines(exerciseId, userId);
        }

        exerciseRepository.delete(exercise);
    }

    @Transactional
    public AdminExerciseResponse adminUpdateExercise(Long exerciseId, ExerciseUpdateRequest request) {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 종목입니다."));

        if (exercise.isCustom()) {
            throw new BadRequestException("공식 종목만 수정할 수 있습니다.");
        }

        if (exerciseRepository.existsByNameAndCustomIsFalseAndIdNot(request.name(), exerciseId)) {
            throw new ConflictException("이미 존재하는 종목 이름입니다.");
        }

        exercise.update(request.name(), request.bodyPart(), request.partDetail());
        return AdminExerciseResponse.from(exercise);
    }

    @Transactional(readOnly = true)
    public List<AdminExerciseResponse> adminGetAllExercises() {
        return exerciseRepository.findAll()
                .stream()
                .map(AdminExerciseResponse::from)
                .toList();
    }

    @Transactional
    public AdminExerciseResponse adminCreateExercise(ExerciseCreateRequest request) {
        if (exerciseRepository.existsByNameAndCustomIsFalse(request.name())) {
            throw new IllegalArgumentException("이미 존재하는 종목입니다.");
        }

        Exercise exercise = Exercise.builder()
                .name(request.name())
                .bodyPart(request.bodyPart())
                .partDetail(request.partDetail())
                .custom(false)
                .createdBy(null)
                .build();

        Exercise savedOfficial = exerciseRepository.save(exercise);

        migrateCustomExercisesToOfficial(savedOfficial);

        return AdminExerciseResponse.from(savedOfficial);
    }

    private void migrateCustomExercisesToOfficial(Exercise official) {
        String name = official.getName();
        var bodyPart = official.getBodyPart();

        // 1) 같은 이름 + 같은 bodyPart의 커스텀 exercise 목록 조회
        List<Exercise> customExercises = exerciseRepository
                .findAllByNameAndBodyPartAndCustomIsTrue(name, bodyPart);

        if (customExercises.isEmpty()) {
            return;
        }

        List<Long> customIds = customExercises.stream()
                .map(Exercise::getId)
                .toList();

        // 2) 커스텀 종목 제작자 중 진행 중인 세션이 있으면 차단
        if (workoutSessionRepository.countActiveSessionsByExerciseCreators(customIds) > 0) {
            throw new ConflictException("해당 커스텀 종목으로 진행 중인 운동 세션이 있습니다. 세션 완료 후 다시 시도해주세요.");
        }

        Long officialId = official.getId();

        // 3) FK 업데이트 후 커스텀 종목 삭제
        routineItemRepository.updateExerciseIdBulk(customIds, officialId);
        workoutSessionExerciseRepository.updateExerciseIdBulk(customIds, officialId);
        exerciseRepository.deleteAllById(customIds);
    }

}
