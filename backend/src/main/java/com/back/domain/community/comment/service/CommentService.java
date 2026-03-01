package com.back.domain.community.comment.service;

import com.back.domain.community.comment.dto.CommentCreateRequest;
import com.back.domain.community.comment.dto.CommentResponse;
import com.back.domain.community.comment.entity.Comment;
import com.back.domain.community.comment.repository.CommentRepository;
import com.back.domain.community.sharedRoutine.entity.SharedRoutine;
import com.back.domain.community.sharedRoutine.repository.SharedRoutineRepository;
import com.back.domain.user.user.entity.User;
import com.back.domain.user.user.repository.UserRepository;
import com.back.global.exception.type.ForbiddenException;
import com.back.global.exception.type.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final SharedRoutineRepository sharedRoutineRepository;
    private final UserRepository userRepository;

    @Transactional
    public CommentResponse createComment(Long userId, Long sharedRoutineId, CommentCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 회원입니다."));

        SharedRoutine sharedRoutine = sharedRoutineRepository.findById(sharedRoutineId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 공유 루틴입니다."));

        Comment comment = Comment.builder()
                .sharedRoutine(sharedRoutine)
                .user(user)
                .content(request.content())
                .build();

        commentRepository.save(comment);

        return CommentResponse.from(comment);
    }

    @Transactional
    public void deleteComment(Long userId, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 댓글입니다."));

        if (!userId.equals(comment.getUser().getId())) {
            throw new ForbiddenException("권한이 없습니다.");
        }

        commentRepository.delete(comment);
    }
}
