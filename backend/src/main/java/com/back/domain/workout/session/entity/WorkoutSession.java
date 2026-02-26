package com.back.domain.workout.session.entity;

import com.back.domain.routine.routine.entity.Routine;
import com.back.domain.user.user.entity.User;
import com.back.domain.workout.set.entity.WorkoutSet;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "workout_sessions")
@EntityListeners(AuditingEntityListener.class)
public class WorkoutSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routine_id")
    private Routine routine;

    @Column(nullable = false)
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "workoutSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkoutSet> sets = new ArrayList<>();


    private WorkoutSession(User user, Routine routine, LocalDateTime startedAt) {
        this.user = user;
        this.routine = routine;
        this.startedAt = startedAt;
    }

    public static WorkoutSession start(User user, Routine routine) {
        return new WorkoutSession(user, routine, LocalDateTime.now());
    }

    public void complete(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public boolean isCompleted() {
        return completedAt != null;
    }

}