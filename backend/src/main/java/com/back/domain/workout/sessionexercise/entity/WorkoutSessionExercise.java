package com.back.domain.workout.sessionexercise.entity;

import com.back.domain.exercise.entity.BodyPart;
import com.back.domain.exercise.entity.Exercise;
import com.back.domain.workout.session.entity.WorkoutSession;
import com.back.domain.workout.set.entity.WorkoutSet;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "workout_session_exercises")
@EntityListeners(AuditingEntityListener.class)
public class WorkoutSessionExercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workout_session_id", nullable = false)
    private WorkoutSession workoutSession;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(nullable = false)
    private String exerciseName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BodyPart bodyPartSnapshot;

    @Column(nullable = false)
    private int orderInSession;

    @OneToMany(mappedBy = "workoutSessionExercise", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WorkoutSet> sets = new ArrayList<>();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
