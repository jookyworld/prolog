package com.back.domain.user.auth.service;

import com.back.domain.exercise.repository.ExerciseRepository;
import com.back.domain.routine.routine.repository.RoutineRepository;
import com.back.domain.routine.routineItem.repository.RoutineItemRepository;
import com.back.domain.user.auth.dto.CheckDuplicatesRequest;
import com.back.domain.user.auth.dto.CheckDuplicatesResponse;
import com.back.domain.user.auth.dto.EmailVerificationConfirmDto;
import com.back.domain.user.auth.dto.EmailVerificationSendDto;
import com.back.domain.user.auth.dto.LoginRequest;
import com.back.domain.user.auth.dto.PasswordResetConfirmDto;
import com.back.domain.user.auth.dto.PasswordResetRequestDto;
import com.back.domain.user.auth.dto.SignupRequest;
import com.back.domain.user.user.dto.UserResponse;
import com.back.domain.user.user.entity.Gender;
import com.back.domain.user.user.entity.Role;
import com.back.domain.user.user.entity.User;
import com.back.domain.user.user.repository.UserRepository;
import com.back.domain.workout.session.repository.WorkoutSessionRepository;
import com.back.domain.workout.sessionexercise.repository.WorkoutSessionExerciseRepository;
import com.back.domain.workout.set.repository.WorkoutSetRepository;
import com.back.global.exception.type.BadRequestException;
import com.back.global.exception.type.NotFoundException;
import com.back.global.mail.EmailService;
import com.back.global.mail.EmailVerificationService;
import com.back.global.security.token.PasswordResetTokenService;
import com.back.global.security.token.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetTokenService passwordResetTokenService;
    private final EmailService emailService;
    private final EmailVerificationService emailVerificationService;
    private final WorkoutSetRepository workoutSetRepository;
    private final WorkoutSessionExerciseRepository workoutSessionExerciseRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final RoutineItemRepository routineItemRepository;
    private final RoutineRepository routineRepository;
    private final ExerciseRepository exerciseRepository;

    @Transactional(readOnly = true)
    public CheckDuplicatesResponse checkDuplicates(CheckDuplicatesRequest dto) {
        return new CheckDuplicatesResponse(
                !userRepository.existsByUsername(dto.username()),
                !userRepository.existsByEmail(dto.email()),
                !userRepository.existsByNickname(dto.nickname())
        );
    }

    @Transactional(readOnly = true)
    public void sendEmailVerification(EmailVerificationSendDto dto) {
        if (userRepository.existsByEmail(dto.email())) {
            throw new BadRequestException("이미 사용 중인 이메일입니다.");
        }
        String code = emailVerificationService.generateAndSave(dto.email());
        emailService.sendEmailVerificationCode(dto.email(), code);
    }

    public void confirmEmailVerification(EmailVerificationConfirmDto dto) {
        emailVerificationService.verify(dto.email(), dto.code());
    }

    @Transactional
    public UserResponse signup(SignupRequest dto) {

        if (!emailVerificationService.isVerified(dto.email())) {
            throw new BadRequestException("이메일 인증이 완료되지 않았습니다.");
        }
        if (userRepository.existsByUsername(dto.username())) {
            throw new BadRequestException("이미 사용 중인 아이디입니다.");
        }
        if (userRepository.existsByEmail(dto.email())) {
            throw new BadRequestException("이미 사용 중인 이메일입니다.");
        }
        if (userRepository.existsByNickname(dto.nickname())) {
            throw new BadRequestException("이미 사용 중인 닉네임입니다.");
        }

        String encodedPassword = passwordEncoder.encode(dto.password());

        Gender gender = dto.gender() != null ? dto.gender() : Gender.UNKNOWN;

        User user = User.builder()
                .username(dto.username())
                .password(encodedPassword)
                .email(dto.email())
                .nickname(dto.nickname())
                .gender(gender)
                .height(dto.height())
                .weight(dto.weight())
                .marketingConsent(dto.marketingConsent())
                .role(Role.USER)
                .build();

        User saved = userRepository.save(user);
        emailVerificationService.deleteVerified(dto.email());

        return UserResponse.from(saved);
    }

    public User login(LoginRequest dto) {
        User user = userRepository.findByUsername(dto.username())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다"));

        if (!passwordEncoder.matches(dto.password(), user.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다");
        }

        return user;
    }

    public void logout(Long userId) {
        refreshTokenService.deleteRefreshToken(userId);
    }

    @Transactional(readOnly = true)
    public void requestPasswordReset(PasswordResetRequestDto dto) {
        // 이메일 존재 여부와 무관하게 동일한 응답 (보안)
        userRepository.findByEmail(dto.email()).ifPresent(user -> {
            String code = passwordResetTokenService.generateAndSave(dto.email());
            emailService.sendPasswordResetCode(dto.email(), code);
        });
    }

    @Transactional
    public void confirmPasswordReset(PasswordResetConfirmDto dto) {
        if (!passwordResetTokenService.validate(dto.email(), dto.code())) {
            throw new BadRequestException("인증 코드가 올바르지 않거나 만료되었습니다.");
        }

        User user = userRepository.findByEmail(dto.email())
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        user.resetPassword(passwordEncoder.encode(dto.newPassword()));
        passwordResetTokenService.delete(dto.email());
        refreshTokenService.deleteRefreshToken(user.getId());
    }

    @Transactional
    public void deleteMe(Long userId) {
        // 1. workout_sets (워크아웃 세트 → session_exercise FK)
        workoutSetRepository.deleteAllByWorkoutSessionExercise_WorkoutSession_User_Id(userId);
        // 2. workout_session_exercises (session_exercise → 세션 FK)
        workoutSessionExerciseRepository.deleteAllByWorkoutSession_User_Id(userId);
        // 3. workout_sessions (세션 → 루틴/유저 FK)
        workoutSessionRepository.deleteAllByUser_Id(userId);
        // 4. routine_items (루틴 아이템 → 루틴/운동 FK)
        routineItemRepository.deleteAllByRoutine_User_Id(userId);
        // 5. routines
        routineRepository.deleteAllByUser_Id(userId);
        // 6. exercises (커스텀 운동)
        exerciseRepository.deleteAllByCreatedBy_Id(userId);
        // 7. refresh token (Redis)
        refreshTokenService.deleteRefreshToken(userId);
        // 8. user
        userRepository.deleteById(userId);
    }
}
