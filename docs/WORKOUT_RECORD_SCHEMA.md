# 운동 기록 스키마 설계 검토

## 현재 구조의 문제

운동 기록(`workout_session_exercises`)이 종목 정보를 스냅샷 문자열로만 저장하고 있어,
특정 종목 필터링이나 복합 조건 검색 시 비효율이 발생한다.

```sql
workout_session_exercises:
  exercise_name_snapshot  -- 문자열
  body_part_snapshot      -- 문자열
```

**구체적 문제:**
- 특정 종목 기록 조회 → `WHERE exercise_name_snapshot = '벤치프레스'` (문자열 검색, 인덱스 효율 낮음)
- 종목 이름이 변경된 경우 → 옛 이름 기준 필터 시 누락 발생
- 복합 필터 (`부위 = 가슴 AND 종목 = 벤치프레스`) → 스냅샷 컬럼 두 개 모두 문자열 매칭

---

## 이상적인 구조: FK + 스냅샷 병행

### 스키마

```sql
-- 소프트 딜리트 적용
exercises:
  id
  name
  body_part
  deleted_at  -- nullable, 소프트 딜리트용

-- FK 참조 추가
workout_session_exercises:
  id
  workout_session_id        (FK → workout_sessions.id)
  exercise_id               (FK → exercises.id)      ← 신규 추가
  exercise_name_snapshot                              ← 유지
  body_part_snapshot                                  ← 유지
  ...
```

### 컬럼별 역할 분리

| 컬럼 | 용도 |
|---|---|
| `exercise_id` (FK) | 필터링, 집계, JOIN — 인덱스 활용 |
| `exercise_name_snapshot` | 화면 표시, 종목 삭제 후에도 이름 보존 |
| `body_part_snapshot` | 기록 당시 분류 기준 보존 |

---

## 왜 스냅샷을 완전히 제거하면 안 되나

exercises 테이블의 이름·부위가 변경됐을 때:

| 구조 | 문제 |
|---|---|
| FK만 | "3개월 전 벤치프레스" 기록이 관리자 이름 변경 후 다른 이름으로 표시됨 |
| 스냅샷만 | 필터/집계 비효율 (현재 문제) |
| **FK + 스냅샷** | 필터는 FK로 빠르게, 표시는 스냅샷으로 정확하게 |

---

## 소프트 딜리트가 필수인 이유

exercises 행을 실제 삭제하면 `exercise_id` FK가 깨진다.
소프트 딜리트(`deleted_at`)를 사용하면:

- FK 참조 무결성 유지
- 종목이 삭제돼도 과거 기록의 `exercise_id`는 여전히 유효
- 종목 목록 조회 시 `WHERE deleted_at IS NULL`로 필터

---

## 쿼리 변화 비교

### 빈도 상위 부위 집계

```sql
-- 현재
GROUP BY wse.body_part_snapshot

-- 개선 후 (정규화된 값 기준 집계가 필요한 경우)
JOIN exercises e ON wse.exercise_id = e.id
GROUP BY e.body_part
```

### 특정 종목 기록 조회

```sql
-- 현재
WHERE wse.exercise_name_snapshot = '벤치프레스'

-- 개선 후
WHERE wse.exercise_id = 5  -- 인덱스 활용, 이름 변경에 무관
```

---

## body_part: 스냅샷 유지 vs FK 참조 통일

| 방식 | 의미 |
|---|---|
| `body_part_snapshot` 유지 | "그 당시 분류 기준"으로 기록 보존 |
| `exercises.body_part` 참조 | 현재 기준으로 과거 기록도 재분류 |

**결론: 스냅샷 유지가 적합.**
관리자가 "스쿼트"를 하체 → 전신으로 재분류해도,
과거 기록은 "하체 운동을 했다"는 사실 그대로 남아야 한다.

---

## 마이그레이션 방향 (현재 → 개선)

기존 스냅샷 데이터에서 `exercise_id`를 역으로 채우는 방법:

```sql
UPDATE workout_session_exercises wse
JOIN exercises e ON e.name = wse.exercise_name_snapshot
SET wse.exercise_id = e.id
WHERE wse.exercise_id IS NULL;
```

**주의:** 이름이 변경된 종목은 자동 매핑 불가.
초기에는 `exercise_id`를 nullable로 두고 점진적으로 채우는 게 안전하다.

### 인덱스 추가

```sql
-- 종목별 기록 조회 최적화
CREATE INDEX idx_wse_exercise_id ON workout_session_exercises (exercise_id);

-- 세션 + 종목 복합 조회 최적화
CREATE INDEX idx_wse_session_exercise ON workout_session_exercises (workout_session_id, exercise_id);
```

---

## 요약

현재 스냅샷 설계는 **불변성(immutability)** 문제를 올바르게 해결했으나,
**조회 성능과 필터 유연성**이 부족하다.

FK + 스냅샷 병행 + 소프트 딜리트 구조로 전환하면:
- 필터/집계: FK 인덱스 활용으로 성능 확보
- 표시/불변성: 스냅샷으로 과거 기록 보존
- 무결성: 소프트 딜리트로 FK 참조 유지
