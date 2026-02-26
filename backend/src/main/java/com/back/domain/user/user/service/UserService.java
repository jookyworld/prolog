package com.back.domain.user.user.service;

import com.back.domain.user.user.dto.UpdateProfileRequest;
import com.back.domain.user.user.dto.UserResponse;
import com.back.domain.user.user.entity.User;
import com.back.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest dto) {
        User user = getUserById(userId);

        if (!user.getNickname().equals(dto.nickname())
                && userRepository.existsByNickname(dto.nickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        user.updateProfile(dto.nickname(), dto.gender(), dto.height(), dto.weight());

        return UserResponse.from(user);
    }
}
