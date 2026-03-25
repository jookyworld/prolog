package com.back.domain.user.block.service;

import com.back.domain.user.block.dto.BlockedUserResponse;
import com.back.domain.user.block.entity.UserBlock;
import com.back.domain.user.block.repository.UserBlockRepository;
import com.back.domain.user.user.entity.User;
import com.back.domain.user.user.repository.UserRepository;
import com.back.global.exception.type.BadRequestException;
import com.back.global.exception.type.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserBlockService {

    private final UserBlockRepository userBlockRepository;
    private final UserRepository userRepository;

    @Transactional
    public void blockUser(Long blockerId, Long blockedId) {
        if (blockerId.equals(blockedId)) {
            throw new BadRequestException("자기 자신을 차단할 수 없습니다.");
        }

        if (!userRepository.existsById(blockedId)) {
            throw new NotFoundException("존재하지 않는 사용자입니다.");
        }

        if (userBlockRepository.existsByBlocker_IdAndBlocked_Id(blockerId, blockedId)) {
            return;
        }

        User blocker = userRepository.getReferenceById(blockerId);
        User blocked = userRepository.getReferenceById(blockedId);

        userBlockRepository.save(UserBlock.builder()
                .blocker(blocker)
                .blocked(blocked)
                .build());
    }

    @Transactional
    public void unblockUser(Long blockerId, Long blockedId) {
        userBlockRepository.deleteByBlocker_IdAndBlocked_Id(blockerId, blockedId);
    }

    @Transactional(readOnly = true)
    public List<Long> getBlockedUserIds(Long blockerId) {
        return userBlockRepository.findBlockedUserIdsByBlockerId(blockerId);
    }

    @Transactional(readOnly = true)
    public List<BlockedUserResponse> getBlockedUsers(Long blockerId) {
        return userBlockRepository.findAllByBlockerIdWithBlocked(blockerId)
                .stream()
                .map(BlockedUserResponse::from)
                .toList();
    }
}
