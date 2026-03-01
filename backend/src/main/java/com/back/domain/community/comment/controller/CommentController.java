package com.back.domain.community.comment.controller;

import com.back.domain.community.comment.service.CommentService;
import com.back.global.security.principal.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/community/comments")
public class CommentController {

    private final CommentService commentService;

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@AuthenticationPrincipal UserPrincipal principal,
                                              @PathVariable Long id) {
        commentService.deleteComment(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
