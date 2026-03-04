package com.back.domain.exercise.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum BodyPart {
    CHEST("가슴"),
    SHOULDER("어깨"),
    BACK("등"),
    ARM("팔"),
    LOWER_BODY("하체"),
    CORE("코어"),
    CARDIO("유산소"),
    OTHER("기타");

    private final String label;

    BodyPart(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static BodyPart fromLabel(String label) {
        for (BodyPart bodyPart : BodyPart.values()) {
            if (bodyPart.label.equals(label)) {
                return bodyPart;
            }
        }
        throw new IllegalArgumentException("알 수 없는 운동 부위입니다: " + label);
    }
}
