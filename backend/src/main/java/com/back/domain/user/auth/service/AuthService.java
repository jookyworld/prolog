package com.back.domain.user.auth.service;

import com.back.domain.exercise.repository.ExerciseRepository;
import com.back.domain.routine.routine.repository.RoutineRepository;
import com.back.domain.routine.routineItem.repository.RoutineItemRepository;
import com.back.domain.user.auth.dto.LoginRequest;
import com.back.domain.user.auth.dto.SignupRequest;
import com.back.domain.user.user.dto.UserResponse;
import com.back.domain.user.user.entity.Gender;
import com.back.domain.user.user.entity.Role;
import com.back.domain.user.user.entity.User;
import com.back.domain.user.user.repository.UserRepository;
import com.back.domain.workout.session.repository.WorkoutSessionRepository;
import com.back.domain.workout.set.repository.WorkoutSetRepository;
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
    private final WorkoutSetRepository workoutSetRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final RoutineItemRepository routineItemRepository;
    private final RoutineRepository routineRepository;
    private final ExerciseRepository exerciseRepository;

    public UserResponse signup(SignupRequest dto) {

        if (userRepository.existsByUsername(dto.username())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }
        if (userRepository.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        if (userRepository.existsByNickname(dto.nickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
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
                .role(Role.USER)
                .build();

        User saved = userRepository.save(user);

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

    @Transactional
    public void deleteMe(Long userId) {
        // 1. workout_sets (워크아웃 세트 → 세션 FK)
        workoutSetRepository.deleteAllByWorkoutSession_User_Id(userId);
        // 2. workout_sessions (세션 → 루틴/유저 FK)
        workoutSessionRepository.deleteAllByUser_Id(userId);
        // 3. routine_items (루틴 아이템 → 루틴/운동 FK)
        routineItemRepository.deleteAllByRoutine_User_Id(userId);
        // 4. routines
        routineRepository.deleteAllByUser_Id(userId);
        // 5. exercises (커스텀 운동)
        exerciseRepository.deleteAllByCreatedBy_Id(userId);
        // 6. refresh token (Redis)
        refreshTokenService.deleteRefreshToken(userId);
        // 7. user
        userRepository.deleteById(userId);
    }
}
