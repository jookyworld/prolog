package com.back.global.dto;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * 안정적인 페이지네이션 응답을 위한 DTO
 * Spring Data의 Page 객체를 직접 반환할 때 발생하는 JSON 구조 불안정성 문제를 해결
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last,
        boolean empty
) {
    /**
     * Spring Data의 Page 객체를 PageResponse로 변환
     *
     * @param page Spring Data Page 객체
     * @return PageResponse DTO
     */
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast(),
                page.isEmpty()
        );
    }
}
