package com.back.domain.workout.session.service;

import com.back.domain.exercise.entity.BodyPart;
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
import com.back.domain.workout.sessionexercise.entity.WorkoutSessionExercise;
import com.back.domain.workout.sessionexercise.repository.WorkoutSessionExerciseRepository;
import com.back.domain.workout.set.dto.WorkoutSetCompleteRequest;
import com.back.domain.workout.set.entity.WorkoutSet;
import com.back.domain.workout.set.repository.WorkoutSetRepository;
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
    private final WorkoutSessionExerciseRepository workoutSessionExerciseRepository;
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

        if (request == null || request.exercises() == null || request.exercises().isEmpty()) {
            throw new BadRequestException("세트 기록이 없습니다.");
        }

        WorkoutCompleteAction action = request.action() == null ?
                WorkoutCompleteAction.RECORD_ONLY : request.action();

        boolean hasRoutine = workoutSession.getRoutine() != null;

        if (!hasRoutine && action == WorkoutCompleteAction.CREATE_ROUTINE_AND_RECORD) {
            // OK: 자유 운동 → 새 루틴 생성
        } else if (hasRoutine && action == WorkoutCompleteAction.CREATE_ROUTINE_AND_RECORD) {
            throw new BadRequestException("루틴 기반 세션에서는 새로운 루틴을 생성할 수 없습니다.");
        }

        if (!hasRoutine && (action == WorkoutCompleteAction.DETACH_AND_RECORD
                || action == WorkoutCompleteAction.UPDATE_ROUTINE_AND_RECORD)) {
            throw new BadRequestException("자유 운동 세션에서는 사용할 수 없는 액션입니다.");
        }

        // 운동 + 세트 저장
        saveWorkoutExercises(workoutSession, request.exercises());

        // 완료 처리
        workoutSession.complete(LocalDateTime.now());

        switch (action) {
            case RECORD_ONLY -> { }
            case CREATE_ROUTINE_AND_RECORD -> {
                String routineTitle = request.routineTitle();
                if (routineTitle == null || routineTitle.isBlank()) {
                    throw new BadRequestException("루틴 이름을 입력해주세요.");
                }
                Routine newRoutine = createRoutineFromSession(userId, workoutSession, routineTitle);
                workoutSession.setRoutine(newRoutine);
            }
            case DETACH_AND_RECORD -> {
                workoutSession.setRoutine(null);
            }
            case UPDATE_ROUTINE_AND_RECORD -> {
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
    public Page<WorkoutSessionListItemResponse> getWorkoutSessions(Long userId, String type, String bodyPart, Pageable pageable) {
        Page<WorkoutSession> sessions;
        if (bodyPart != null && !bodyPart.isBlank()) {
            String bodyPartName = BodyPart.fromLabel(bodyPart).name();
            sessions = workoutSessionRepository.findByUser_IdAndBodyPartOrderByCompletedAtDesc(userId, bodyPartName, pageable);
        } else {
            sessions = switch (type == null ? "all" : type) {
                case "routine" -> workoutSessionRepository.findByUser_IdAndCompletedAtIsNotNullAndRoutineIsNotNullOrderByCompletedAtDesc(userId, pageable);
                case "free" -> workoutSessionRepository.findByUser_IdAndCompletedAtIsNotNullAndRoutineIsNullOrderByCompletedAtDesc(userId, pageable);
                default -> workoutSessionRepository.findByUser_IdAndCompletedAtIsNotNullOrderByCompletedAtDesc(userId, pageable);
            };
        }

        List<Long> sessionIds = sessions.getContent().stream().map(WorkoutSession::getId).toList();
        Map<Long, List<BodyPart>> bodyPartsMap = sessionIds.isEmpty() ? Map.of() :
                workoutSessionExerciseRepository.findBodyPartsBySessionIds(sessionIds).stream()
                        .collect(Collectors.groupingBy(
                                row -> (Long) row[0],
                                Collectors.mapping(row -> (BodyPart) row[1], Collectors.toList())
                        ));

        return sessions.map(s -> WorkoutSessionListItemResponse.from(s, bodyPartsMap.getOrDefault(s.getId(), List.of())));
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
        List<WorkoutSessionExercise> sessionExercises =
                workoutSessionExerciseRepository.findByWorkoutSession_IdOrderByOrderInSessionAsc(session.getId());

        List<Long> sessionExerciseIds = sessionExercises.stream().map(WorkoutSessionExercise::getId).toList();

        Map<Long, List<WorkoutSet>> setsMap = sessionExerciseIds.isEmpty() ? Map.of() :
                workoutSetRepository.findByWorkoutSessionExercise_IdInOrderBySetNumberAsc(sessionExerciseIds)
                        .stream()
                        .collect(Collectors.groupingBy(ws -> ws.getWorkoutSessionExercise().getId()));

        List<WorkoutExerciseDetailResponse> exercises = sessionExercises.stream()
                .map(se -> {
                    List<WorkoutSetDetailResponse> sets = setsMap.getOrDefault(se.getId(), List.of())
                            .stream()
                            .map(WorkoutSetDetailResponse::from)
                            .toList();
                    return new WorkoutExerciseDetailResponse(
                            se.getExercise().getId(),
                            se.getExerciseName(),
                            se.getBodyPartSnapshot().getLabel(),
                            sets
                    );
                })
                .toList();

        return WorkoutSessionDetailResponse.of(session, exercises);
    }

    private void saveWorkoutExercises(WorkoutSession session, List<WorkoutExerciseCompleteRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            throw new BadRequestException("세트 기록이 없습니다.");
        }

        // exerciseId 중복 체크
        Set<Long> uniqueExerciseIds = new HashSet<>();
        for (var r : requests) {
            if (!uniqueExerciseIds.add(r.exerciseId())) {
                throw new BadRequestException("같은 종목이 중복으로 포함되어 있습니다.");
            }
        }

        // exercise 일괄 조회
        List<Long> exerciseIds = requests.stream().map(WorkoutExerciseCompleteRequest::exerciseId).toList();
        List<Exercise> exercises = exerciseRepository.findAllById(exerciseIds);
        if (exercises.size() != exerciseIds.size()) {
            throw new NotFoundException("존재하지 않는 운동 종목이 포함되어 있습니다.");
        }
        Map<Long, Exercise> exerciseMap = exercises.stream().collect(Collectors.toMap(Exercise::getId, e -> e));

        // 운동별로 순서에 따라 저장
        for (int i = 0; i < requests.size(); i++) {
            WorkoutExerciseCompleteRequest req = requests.get(i);

            if (req.sets() == null || req.sets().isEmpty()) {
                throw new BadRequestException("세트 기록이 없는 운동이 포함되어 있습니다.");
            }

            Exercise exercise = exerciseMap.get(req.exerciseId());

            WorkoutSessionExercise sessionExercise = WorkoutSessionExercise.builder()
                    .workoutSession(session)
                    .exercise(exercise)
                    .exerciseName(exercise.getName())
                    .bodyPartSnapshot(exercise.getBodyPart())
                    .orderInSession(i + 1)
                    .build();

            workoutSessionExerciseRepository.save(sessionExercise);

            // 세트 번호 중복 체크
            Set<Integer> setNumbers = new HashSet<>();
            for (var s : req.sets()) {
                if (!setNumbers.add(s.setNumber())) {
                    throw new BadRequestException("같은 종목에서 세트 번호가 중복되었습니다.");
                }
            }

            List<WorkoutSet> sets = req.sets().stream()
                    .map(s -> WorkoutSet.builder()
                            .workoutSessionExercise(sessionExercise)
                            .setNumber(s.setNumber())
                            .weight(s.weight())
                            .reps(s.reps())
                            .build())
                    .toList();

            workoutSetRepository.saveAll(sets);
        }
    }

    private Routine createRoutineFromSession(Long userId, WorkoutSession workoutSession, String routineTitle) {
        List<WorkoutSessionExerciseRepository.SessionExerciseSummary> summaries =
                workoutSessionExerciseRepository.summarizeBySession(workoutSession.getId());

        if (summaries.isEmpty()) {
            throw new BadRequestException("세트 기록이 없는 세션에는 루틴을 생성할 수 없습니다.");
        }

        List<RoutineItemCreateRequest> routineItems = summaries.stream()
                .map(s -> new RoutineItemCreateRequest(
                        s.getExerciseId(),
                        s.getSetCount().intValue(),
                        0
                ))
                .toList();

        RoutineCreateRequest req = new RoutineCreateRequest(routineTitle, null, routineItems);
        return routineService.createRoutine(userId, req);
    }

    private void updateRoutineFromSession(WorkoutSession workoutSession) {
        Routine routine = workoutSession.getRoutine();
        Long userId = workoutSession.getUser().getId();

        List<WorkoutSessionExerciseRepository.SessionExerciseSummary> summaries =
                workoutSessionExerciseRepository.summarizeBySession(workoutSession.getId());

        if (summaries.isEmpty()) {
            throw new BadRequestException("세트 기록이 없는 세션으로는 루틴을 업데이트할 수 없습니다.");
        }

        List<RoutineItemCreateRequest> routineItems = summaries.stream()
                .map(s -> new RoutineItemCreateRequest(
                        s.getExerciseId(),
                        s.getSetCount().intValue(),
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
