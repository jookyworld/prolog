package com.back.domain.workout.set.entity;

import com.back.domain.workout.sessionexercise.entity.WorkoutSessionExercise;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "workout_sets")
@EntityListeners(AuditingEntityListener.class)
public class WorkoutSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workout_session_exercise_id", nullable = false)
    private WorkoutSessionExercise workoutSessionExercise;

    @Column(nullable = false)
    private int setNumber;

    @Column(nullable = false)
    private double weight;

    @Column(nullable = false)
    private int reps;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

}
