package com.back.domain.exercise.service;

import com.back.domain.exercise.dto.AdminExerciseResponse;
import com.back.domain.exercise.dto.ExerciseCreateRequest;
import com.back.domain.exercise.dto.ExerciseResponse;
import com.back.domain.exercise.entity.Exercise;
import com.back.domain.exercise.repository.ExerciseRepository;
import com.back.domain.routine.routineItem.repository.RoutineItemRepository;
import com.back.domain.user.user.entity.User;
import com.back.domain.user.user.repository.UserRepository;
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

        Long officialId = official.getId();

        // 2) FK 들고 있는 테이블에서 exercise_id를 전부 officialId로 업데이트
        routineItemRepository.updateExerciseIdBulk(customIds, officialId);

        // 3) 커스텀 exercise들은 삭제 or 비활성화
        exerciseRepository.deleteAllById(customIds);
    }

}
