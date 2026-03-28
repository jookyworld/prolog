package com.back.domain.user.user.service;

import com.back.domain.user.user.dto.UpdateProfileRequest;
import com.back.domain.user.user.dto.UserResponse;
import com.back.domain.user.user.entity.Role;
import com.back.domain.user.user.entity.User;
import com.back.domain.user.user.repository.UserRepository;
import com.back.global.dto.PageResponse;
import com.back.global.exception.type.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
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

        if (!user.getNickname().equalsIgnoreCase(dto.nickname())
                && userRepository.existsByNickname(dto.nickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        user.updateProfile(dto.nickname(), dto.gender(), dto.height(), dto.weight(), dto.birthYear());

        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateMarketingConsent(Long userId, boolean marketingConsent) {
        User user = getUserById(userId);
        user.updateMarketingConsent(marketingConsent);
        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> adminGetUsers(String keyword, Role role, int page, int size) {
        var pageable = PageRequest.of(page, size);
        return PageResponse.from(
                userRepository.findAdminUsers(keyword, role, pageable)
                        .map(UserResponse::from)
        );
    }

    @Transactional(readOnly = true)
    public UserResponse adminGetUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 회원입니다."));
        return UserResponse.from(user);
    }
}
