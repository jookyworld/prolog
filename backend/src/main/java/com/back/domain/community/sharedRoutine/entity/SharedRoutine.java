package com.back.domain.community.sharedRoutine.entity;

import com.back.domain.community.sharedRoutine.dto.RoutineSnapshotWrapper;
import com.back.domain.community.sharedRoutine.dto.SessionSnapshotWrapper;
import com.back.domain.user.user.entity.User;
import com.back.global.converter.RoutineSnapshotConverter;
import com.back.global.converter.SessionSnapshotConverter;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "shared_routines")
@EntityListeners(AuditingEntityListener.class)
public class SharedRoutine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Convert(converter = RoutineSnapshotConverter.class)
    @Column(nullable = false, columnDefinition = "JSON")
    private RoutineSnapshotWrapper routineSnapshot;

    @Convert(converter = SessionSnapshotConverter.class)
    @Column(columnDefinition = "JSON")
    private SessionSnapshotWrapper lastSessionSnapshot;

    @Builder.Default
    @Column(nullable = false)
    private int viewCount = 0;

    @Builder.Default
    @Column(nullable = false)
    private int importCount = 0;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public void incrementViewCount() {
        this.viewCount++;
    }

    public void incrementImportCount() {
        this.importCount++;
    }
}
