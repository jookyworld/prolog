package com.back.domain.workout.set.entity;

import com.back.domain.exercise.entity.BodyPart;
import com.back.domain.exercise.entity.Exercise;
import com.back.domain.workout.session.entity.WorkoutSession;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
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
    @JoinColumn(name = "workout_session_id")
    private WorkoutSession workoutSession;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exercise_id")
    private Exercise exercise;

    @Column(nullable = false)
    private String exerciseName;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BodyPart bodyPartSnapshot;

    @Column(nullable = false)
    private int setNumber;
    private int weight;
    @Column(nullable = false)
    private int reps;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;

    private WorkoutSet(WorkoutSession session, Exercise exercise, int setNumber, int weight, int reps) {
        this.workoutSession = session;
        this.exercise = exercise;
        this.exerciseName = exercise.getName();
        this.bodyPartSnapshot = exercise.getBodyPart();
        this.setNumber = setNumber;
        this.weight = weight;
        this.reps = reps;
    }

    public static WorkoutSet create(WorkoutSession session, Exercise exercise, int setNumber, int weight, int reps) {
        return new WorkoutSet(session, exercise, setNumber, weight, reps);
    }

    public void update(int weight, int reps) {
        this.weight = weight;
        this.reps = reps;
    }
}
