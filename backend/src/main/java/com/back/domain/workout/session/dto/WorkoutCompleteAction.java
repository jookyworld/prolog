package com.back.domain.workout.session.dto;

public enum WorkoutCompleteAction {
    RECORD_ONLY,                    // 기록만 저장 (루틴 링크 유지)
    CREATE_ROUTINE_AND_RECORD,      // 자유 운동 → 새 루틴 생성 + 기록 저장
    DETACH_AND_RECORD,              // 루틴 연결 해제 → 자유 운동으로 기록 저장
    UPDATE_ROUTINE_AND_RECORD       // 루틴을 현재 운동 내용으로 업데이트 + 기록 저장
}
