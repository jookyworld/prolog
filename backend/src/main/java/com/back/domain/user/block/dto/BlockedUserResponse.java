package com.back.domain.user.block.dto;

import com.back.domain.user.block.entity.UserBlock;

import java.time.LocalDateTime;

public record BlockedUserResponse(
        Long userId,
        String nickname,
        LocalDateTime blockedAt
) {
    public static BlockedUserResponse from(UserBlock userBlock) {
        return new BlockedUserResponse(
                userBlock.getBlocked().getId(),
                userBlock.getBlocked().getNickname(),
                userBlock.getCreatedAt()
        );
    }
}
