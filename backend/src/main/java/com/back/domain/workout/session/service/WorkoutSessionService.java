package com.back.domain.workout.session.service;

import com.back.domain.exercise.entity.Exercise;
import com.back.domain.exercise.repository.ExerciseRepository;
import com.back.domain.routine.routine.dto.RoutineCreateRequest;
import com.back.domain.routine.routine.dto.RoutineUpdateRequest;
import com.back.domain.routine.routine.entity.Routine;
import com.back.domain.routine.routine.repository.RoutineRepository;
import com.back.domain.routine.routine.service.RoutineService;
import com.back.domain.routine.routineItem.dto.RoutineItemCreateRequest;
import com.back.domain.user.user.entity.User;
import com.back.domain.user.user.repository.UserRepository;
import com.back.domain.workout.session.dto.*;
import com.back.domain.workout.session.entity.WorkoutSession;
import com.back.domain.workout.session.repository.WorkoutSessionRepository;
import com.back.domain.workout.set.dto.WorkoutSetCompleteRequest;
import com.back.domain.workout.set.entity.WorkoutSet;
import com.back.domain.workout.set.repository.WorkoutSetRepository;
import com.back.domain.workout.set.repository.WorkoutSetRepository.RoutineExerciseSummary;
import com.back.global.exception.type.BadRequestException;
import com.back.global.exception.type.ForbiddenException;
import com.back.global.exception.type.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkoutSessionService {
    private final WorkoutSessionRepository workoutSessionRepository;
    private final UserRepository userRepository;
    private final RoutineRepository routineRepository;
    private final RoutineService routineService;
    private final WorkoutSetRepository workoutSetRepository;
    private final ExerciseRepository exerciseRepository;

    @Transactional
    public WorkoutSessionResponse startSession(Long userId, Long routineId) {
        if (workoutSessionRepository.existsByUser_IdAndCompletedAtIsNull(userId)) {
            throw new BadRequestException("이미 진행중인 운동이 있습니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 회원입니다."));

        Routine routine = null;
        if (routineId != null) {
            routine = routineRepository.findById(routineId)
                    .orElseThrow(() -> new NotFoundException("존재하지 않는 루틴입니다."));

            if (!routine.getUser().getId().equals(userId)) {
                throw new ForbiddenException("루틴 소유자가 아닙니다.");
            }
        }

        WorkoutSession workoutSession = WorkoutSession.start(user, routine);
        workoutSessionRepository.save(workoutSession);

        return WorkoutSessionResponse.from(workoutSession);
    }

    @Transactional(readOnly = true)
    public WorkoutSessionResponse getActiveSession(Long userId) {
        return workoutSessionRepository.findByUser_IdAndCompletedAtIsNull(userId)
                .map(WorkoutSessionResponse::from)
                .orElse(null);
    }

    @Transactional
    public WorkoutSessionCompleteResponse completeSession(Long userId, Long sessionId, WorkoutSessionCompleteRequest request) {
        WorkoutSession workoutSession = workoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 운동 세션입니다."));

        if (!workoutSession.getUser().getId().equals(userId)) {
            throw new ForbiddenException("본인의 운동 세션만 완료할 수 있습니다.");
        }

        if (workoutSession.isCompleted()) {
            return WorkoutSessionCompleteResponse.from(workoutSession);
        }

        if (request == null || request.sets() == null || request.sets().isEmpty()) {
            throw new BadRequestException("세트 기록이 없습니다.");
        }

        WorkoutCompleteAction action = request.action() == null ?
                WorkoutCompleteAction.RECORD_ONLY : request.action();

        boolean hasRoutine = workoutSession.getRoutine() != null;

        // 자유 운동에서만 허용되는 액션
        if (!hasRoutine && action == WorkoutCompleteAction.CREATE_ROUTINE_AND_RECORD) {
            // OK: 자유 운동 → 새 루틴 생성
        } else if (hasRoutine && action == WorkoutCompleteAction.CREATE_ROUTINE_AND_RECORD) {
            throw new BadRequestException("루틴 기반 세션에서는 새로운 루틴을 생성할 수 없습니다.");
        }

        // 루틴 기반에서만 허용되는 액션
        if (!hasRoutine && (action == WorkoutCompleteAction.DETACH_AND_RECORD
                || action == WorkoutCompleteAction.UPDATE_ROUTINE_AND_RECORD)) {
            throw new BadRequestException("자유 운동 세션에서는 사용할 수 없는 액션입니다.");
        }

        // 세트 저장
        saveWorkoutSets(workoutSession, request.sets());

        // 완료 처리
        workoutSession.complete(LocalDateTime.now());

        switch (action) {
            case RECORD_ONLY -> {
                // 기록만 저장 (루틴 링크 유지)
            }
            case CREATE_ROUTINE_AND_RECORD -> {
                String routineTitle = request.routineTitle();
                if (routineTitle == null || routineTitle.isBlank()) {
                    throw new BadRequestException("루틴 이름을 입력해주세요.");
                }
                Routine newRoutine = createRoutineFromSession(userId, workoutSession, routineTitle);
                workoutSession.setRoutine(newRoutine);
            }
            case DETACH_AND_RECORD -> {
                // 루틴 연결 해제 → 자유 운동으로 전환
                workoutSession.setRoutine(null);
            }
            case UPDATE_ROUTINE_AND_RECORD -> {
                // 기존 루틴을 현재 운동 내용으로 업데이트
                updateRoutineFromSession(workoutSession);
            }
        }

        return WorkoutSessionCompleteResponse.from(workoutSession);
    }

    @Transactional
    public void cancelSession(Long userId, Long sessionId) {
        WorkoutSession workoutSession = workoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 운동 세션입니다."));

        if (!workoutSession.getUser().getId().equals(userId)) {
            throw new ForbiddenException("본인의 운동 세션만 취소할 수 있습니다.");
        }

        if (workoutSession.isCompleted()) {
            throw new BadRequestException("이미 완료된 운동은 취소할 수 없습니다.");
        }

        workoutSessionRepository.delete(workoutSession);
    }

    @Transactional
    public void deleteSession(Long userId, Long sessionId) {
        WorkoutSession workoutSession = workoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 운동 세션입니다."));

        if (!workoutSession.getUser().getId().equals(userId)) {
            throw new ForbiddenException("본인의 운동 기록만 삭제할 수 있습니다.");
        }

        if (!workoutSession.isCompleted()) {
            throw new BadRequestException("진행중인 운동은 취소를 이용해주세요.");
        }

        workoutSessionRepository.delete(workoutSession);
    }

    @Transactional(readOnly = true)
    public Page<WorkoutSessionListItemResponse> getWorkoutSessions(Long userId, Pageable pageable) {

        Page<WorkoutSession> sessions = workoutSessionRepository.findByUser_IdAndCompletedAtIsNotNullOrderByCompletedAtDesc(userId, pageable);

        return sessions.map(WorkoutSessionListItemResponse::from);
    }

    @Transactional(readOnly = true)
    public WorkoutSessionDetailResponse getWorkoutSessionDetail(Long userId, Long sessionId) {
        WorkoutSession session = workoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 운동 세션입니다."));

        if (!session.getUser().getId().equals(userId)) {
            throw new ForbiddenException("권한이 없습니다.");
        }

        return buildSessionDetailResponse(session);
    }

    @Transactional(readOnly = true)
    public WorkoutSessionDetailResponse getLastSessionByRoutine(Long userId, Long routineId) {
        WorkoutSession session = workoutSessionRepository
                .findTopByUser_IdAndRoutine_IdAndCompletedAtIsNotNullOrderByCompletedAtDesc(userId, routineId)
                .orElse(null);

        if (session == null) {
            return null;
        }

        return buildSessionDetailResponse(session);
    }

    private WorkoutSessionDetailResponse buildSessionDetailResponse(WorkoutSession session) {
        List<WorkoutSet> sets = workoutSetRepository.findByWorkoutSession_IdOrderByCreatedAtAsc(session.getId());

        var grouped = sets.stream().collect(Collectors.groupingBy(
                set -> set.getExercise().getId(),
                java.util.LinkedHashMap::new,
                Collectors.toList()
        ));

        List<WorkoutExerciseDetailResponse> exercises = grouped.values().stream()
                .map(exerciseSets -> {
                    WorkoutSet first = exerciseSets.get(0);
                    List<WorkoutSetDetailResponse> setResponses = exerciseSets.stream()
                            .map(WorkoutSetDetailResponse::from)
                            .toList();

                    return new WorkoutExerciseDetailResponse(
                            first.getExercise().getId(),
                            first.getExerciseName(),
                            setResponses
                    );
                })
                .toList();

        return WorkoutSessionDetailResponse.of(session, exercises);
    }

    private void saveWorkoutSets(WorkoutSession session, List<WorkoutSetCompleteRequest> requests) {

        if (requests == null || requests.isEmpty()) {
            throw new BadRequestException("세트 기록이 없습니다.");
        }

        // 1. 중복 (exerciseId, setNumber) 체크
        Set<String> unique = new HashSet<>();
        for (var r : requests) {
            String key = r.exerciseId() + ":" + r.setNumber();
            if (!unique.add(key)) {
                throw new BadRequestException("같은 종목에서 세트 번호가 중복되었습니다.");
            }
        }

        // 2. exercise 일괄 조회 (N+1 방지)
        List<Long> exerciseIds = requests.stream()
                .map(WorkoutSetCompleteRequest::exerciseId)
                .distinct()
                .toList();

        List<Exercise> exercises = exerciseRepository.findAllById(exerciseIds);
        if (exercises.size() != exerciseIds.size()) {
            throw new NotFoundException("존재하지 않는 운동 종목이 포함되어 있습니다.");
        }

        Map<Long, Exercise> exerciseMap = exercises.stream().collect(Collectors.toMap(Exercise::getId, e -> e));

        // 3. 엔티티 생성
        List<WorkoutSet> entities = requests.stream()
                .map(r -> {
                    Exercise ex = exerciseMap.get(r.exerciseId());

                    return WorkoutSet.builder()
                            .workoutSession(session)
                            .exercise(ex)
                            .exerciseName(ex.getName())       // snapshot
                            .bodyPartSnapshot(ex.getBodyPart()) // 사용 중이면
                            .setNumber(r.setNumber())
                            .weight(r.weight())
                            .reps(r.reps())
                            .build();
                })
                .toList();

        // 4. bulk insert
        workoutSetRepository.saveAll(entities);
    }


    private Routine createRoutineFromSession(Long userId, WorkoutSession workoutSession, String routineTitle) {

        // 1. 세션 내 운동별 요약 집계
        List<RoutineExerciseSummary> summaries = workoutSetRepository.summarizeBySession(workoutSession.getId());
        if (summaries.isEmpty()) {
            throw new BadRequestException("세트 기록이 없는 세션에는 루틴을 생성할 수 없습니다.");
        }

        // 2. RoutineItemCreateRequest 로 변환
        List<RoutineItemCreateRequest> routineItems = summaries.stream()
                .map(s -> new RoutineItemCreateRequest(
                        s.getExerciseId(),
                        s.getMaxSetNumber(),
                        0       // restSeconds 는 우선 0으로
                ))
                .toList();

        // 3. RoutineCreateRequest 구성
        RoutineCreateRequest req = new RoutineCreateRequest(
                routineTitle,
                null,   // description 은 null
                routineItems
        );

        return routineService.createRoutine(userId, req);
    }

    private void updateRoutineFromSession(WorkoutSession workoutSession) {
        Routine routine = workoutSession.getRoutine();
        Long userId = workoutSession.getUser().getId();

        // 세션 내 운동별 요약 집계
        List<RoutineExerciseSummary> summaries = workoutSetRepository.summarizeBySession(workoutSession.getId());
        if (summaries.isEmpty()) {
            throw new BadRequestException("세트 기록이 없는 세션으로는 루틴을 업데이트할 수 없습니다.");
        }

        List<RoutineItemCreateRequest> routineItems = summaries.stream()
                .map(s -> new RoutineItemCreateRequest(
                        s.getExerciseId(),
                        s.getMaxSetNumber(),
                        0
                ))
                .toList();

        RoutineUpdateRequest updateRequest = new RoutineUpdateRequest(
                routine.getTitle(),
                routine.getDescription(),
                routineItems
        );

        routineService.updateRoutine(userId, routine.getId(), updateRequest);
    }
}
