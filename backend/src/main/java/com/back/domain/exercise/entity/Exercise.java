package com.back.domain.exercise.entity;

import com.back.domain.user.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "exercises")
@EntityListeners(AuditingEntityListener.class)
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 운동 이름 (벤치프레스, 스쿼트, 사레레 등)
    @Column(nullable = false, length = 100)
    private String name;

    // 운동 대분류 (가슴, 어깨, 등, 팔, 하체, 코어, 유산소, 기타)
    @Enumerated(EnumType.STRING)
    @Column(name = "body_part", nullable = false, length = 20)
    private BodyPart bodyPart;

    // 세부 타겟 (전면 어깨, 이두, 삼두, 힙 등)
    @Column(name = "part_detail", length = 50)
    private String partDetail;

    // 커스텀 종목 여부 (true = 사용자가 직접 만든 종목)
    @Column(name = "is_custom", nullable = false)
    private boolean custom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
