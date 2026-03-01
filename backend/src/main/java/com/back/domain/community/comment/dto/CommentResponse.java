package com.back.domain.community.comment.dto;

import com.back.domain.community.comment.entity.Comment;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        String nickname,
        String content,
        LocalDateTime createdAt
) {
    public static CommentResponse from(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getUser().getNickname(),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }
}
