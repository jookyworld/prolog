# PROLOG - 기능 요구사항 명세서

**버전:** v1.0.0
**최종 업데이트:** 2026-02-26

> 본 문서는 ProLog 서비스의 핵심 가치, 비즈니스 로직, 기능 요구사항을 정의합니다.
> 기획자, PM, 개발자 모두 본 문서를 기준으로 작업합니다.

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [서비스 핵심 가치](#서비스-핵심-가치)
3. [핵심 기능](#핵심-기능)
4. [운동 분류 체계](#운동-분류-체계)
5. [데이터 모델](#데이터-모델)
6. [비즈니스 로직 상세](#비즈니스-로직-상세)

---

## 프로젝트 개요

### 프로젝트명
**PROLOG (Progress Log)**

### 한 줄 소개
점진적 과부하 추적과 성장 분석을 통해 꾸준한 운동 습관 형성을 돕는 웹 서비스

### 타겟 사용자
- 웨이트 트레이닝을 하는 운동 초보자 ~ 중급자
- 자신의 운동 기록을 체계적으로 관리하고 싶은 사람
- 진척도를 시각적으로 확인하며 동기부여를 받고 싶은 사람
- 운동 루틴을 공유하고 다른 사람의 루틴을 참고하고 싶은 사람

---

## 서비스 핵심 가치

### 1. 점진적 과부하 추적 (Progressive Overload) ✅

#### 정의
동일 루틴(`routine_id`)을 반복 수행할 때, 회차별 수행 기록을 비교하여 성장을 확인할 수 있어야 합니다.

#### 현재 구현 방식
- `workout_sessions.routine_id` 기준으로 루틴 단위 반복 추적
- `GET /api/workouts/sessions/routines/{routineId}/last`
  - 해당 루틴의 **가장 최근 완료 세션 1건** 반환
- 세트는 스냅샷(`exercise_name`, `body_part_snapshot`) 저장
  - 루틴 수정/삭제 이후에도 과거 기록 불변

#### 한계 및 개선 계획
- 현재는 "직전 1회" 조회만 지원
- **Phase 2**: 전체 회차 비교 통계 API 개발 예정
  - `GET /api/stats/routines/{routineId}/progress`

---

### 2. 실시간 피드백 ✅

#### 정의
루틴 기반 운동 수행 시, 직전 회차 기록을 참고하여 목표 설정

#### 구현 방식
루틴 기반 세션 시작 시:
```http
GET /api/workouts/sessions/routines/{routineId}/last
```

#### 제한 사항
- 종목 단위 직전 기록 조회 API는 제공하지 않음 (기획 확정 사항)
- 루틴 단위로만 추적

---

### 3. 스냅샷 기반 영속성 ✅

#### 핵심 원칙
**"과거 기록은 절대 변경되지 않는다"**

#### 구현 방식

1. **스냅샷 저장**
   - `workout_sets.exercise_name`
   - `workout_sets.body_part_snapshot`
   - 운동 종목 수정/삭제 시에도 과거 기록 불변

2. **Cascade 없음**
   - `workout_sets.exercise_id`에 FK만 있음
   - `ON DELETE RESTRICT` 또는 논리 삭제

3. **루틴 독립성**
   - 루틴 수정/삭제해도 `workout_sessions` 데이터 유지
   - `session.routine_id`는 참조용

---

## 핵심 기능

### Phase 1: MVP Core ✅ (완료)
- [x] 회원가입 / 로그인 (JWT)
- [x] 프로필 관리 (닉네임, 신체 정보)
- [x] 회원 탈퇴 (cascade 삭제)
- [x] 기본 운동 종목 제공
- [x] 커스텀 운동 종목 추가
- [x] 루틴 CRUD (생성, 수정, 삭제, 활성화/보관)
- [x] 운동 세션 시작/완료/취소/삭제
- [x] 실시간 세트 기록
- [x] 4가지 완료 액션 정책
- [x] 운동 기록 목록/상세 조회
- [x] 홈 화면 통계 (기본)
- [x] 관리자 운동 종목 관리

### Phase 2: 성장 통계 🚧 (진행 중)
- [x] 홈 화면 통계 (이번 주/달, 주간 활동, 자주 하는 운동)
- [ ] 종목별 볼륨 추이
- [ ] 종목별 최고 중량 추이
- [ ] 루틴별 회차 비교
- [ ] 운동 요약 대시보드
- [ ] 개인 최고 기록 (PR)
- [ ] 부위별 통계
- [ ] 월간/연간 통계

### Phase 3: 커뮤니티 📋 (계획)
- [ ] 루틴 공유 (스냅샷 저장)
- [ ] 공유 루틴 조회 (목록/상세)
- [ ] 루틴 가져오기
- [ ] 댓글 작성/삭제
- [ ] 댓글 좋아요
- [ ] 루틴 추천 알고리즘

### Phase 4: Advanced Features 📋 (계획)
- [ ] OAuth 로그인 (Google, Kakao)
- [ ] 운동 추천 기능
- [ ] 목표 설정 및 관리
- [ ] 알림 기능 (운동 리마인더)
- [ ] PWA 변환
- [ ] 세트 타이머 기능
- [ ] 휴식 시간 추천

---

## 운동 분류 체계

### 4단계 계층 구조

```
1. 루틴 (Routine)
   └─ 2. 운동 부위 (Body Part)
      └─ 3. 운동 종목 (Exercise)
         └─ 4. 세트 (Set)
```

#### 1단계: 루틴 (Routine)
- 사용자 소유 운동 계획 단위
- 여러 운동 종목의 조합
- 테이블: `routines`, `routine_items`

#### 2단계: 운동 부위 (Body Part)
- 8가지 Enum으로 분류:
  - `CHEST` (가슴)
  - `SHOULDER` (어깨)
  - `BACK` (등)
  - `ARM` (팔)
  - `LOWER_BODY` (하체)
  - `CORE` (코어)
  - `CARDIO` (유산소)
  - `OTHER` (기타)
- `part_detail`로 세부 타겟 문자열 지원

#### 3단계: 운동 종목 (Exercise)
- 공식 종목 (`custom=false`)
- 사용자 커스텀 종목 (`custom=true`)

#### 4단계: 세트 (Set)
- 최소 기록 단위
- 구성 요소:
  - exercise_id
  - exercise_name (스냅샷)
  - body_part_snapshot (스냅샷)
  - set_number
  - weight (kg)
  - reps (반복 횟수)

---

## 데이터 모델

### ERD 개요 (Phase 1-2)

```
┌─────────┐         ┌──────────┐         ┌──────────────┐
│  User   │◄────────│ Routine  │◄────────│ RoutineItem  │
└────┬────┘         └──────────┘         └──────┬───────┘
     │                                           │
     │ 1:N                                       │ N:1
     │                                           │
     ▼              ┌──────────────┐             ▼
┌────────────┐     │WorkoutSession│      ┌──────────┐
│  Exercise  │     └──────┬───────┘      │ Exercise │
└─────┬──────┘            │              └──────────┘
      │                   │ 1:N
      │ N:1               │
      │                   ▼
      │            ┌─────────────┐
      └───────────►│ WorkoutSet  │
                   └─────────────┘
```

### Phase 3 추가 테이블

```
┌──────────────────┐
│ SharedRoutine    │
│ (루틴 스냅샷)     │
└────┬─────────────┘
     │ 1:N
     ▼
┌──────────────────┐
│ Comment          │
└────┬─────────────┘
     │ 1:N
     ▼
┌──────────────────┐
│ CommentLike      │
└──────────────────┘
```

---

### 주요 엔티티

#### User (사용자)

**테이블:** `users`

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK | 사용자 ID |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 사용자명 (5~50자) |
| password | VARCHAR(255) | NOT NULL | BCrypt 해시 |
| email | VARCHAR(100) | UNIQUE, NOT NULL | 이메일 |
| nickname | VARCHAR(50) | UNIQUE, NOT NULL | 닉네임 (4~50자) |
| gender | ENUM | NOT NULL | MALE, FEMALE, UNKNOWN |
| height | INT | NULLABLE | 신장 (cm) |
| weight | INT | NULLABLE | 체중 (kg) |
| role | ENUM | NOT NULL | USER, ADMIN |

**비즈니스 규칙:**
- username/email/nickname 중복 시 409 Conflict
- 탈퇴 시 cascade 삭제: routines, workout_sessions, workout_sets, custom exercises

---

#### Exercise (운동 종목)

**테이블:** `exercises`

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK | 운동 종목 ID |
| name | VARCHAR(100) | NOT NULL | 종목명 |
| body_part | ENUM | NOT NULL | 운동 부위 (8가지) |
| part_detail | VARCHAR(50) | NULLABLE | 세부 부위 |
| custom | BOOLEAN | NOT NULL | 커스텀 여부 |
| created_by | BIGINT | FK (users), NULLABLE | 생성자 |

**비즈니스 규칙:**
- 공식 종목: `custom=false`, `createdBy=null`
- 커스텀 종목: `custom=true`, `createdBy=user_id`
- 동일 사용자 내 이름 중복 불가

---

#### Routine (루틴)

**테이블:** `routines`

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK | 루틴 ID |
| user_id | BIGINT | FK (users), NOT NULL | 소유자 |
| title | VARCHAR(100) | NOT NULL | 루틴 제목 |
| description | TEXT | NULLABLE | 루틴 설명 |
| active | BOOLEAN | NOT NULL | 활성화 여부 |

**비즈니스 규칙:**
- 루틴 수정 시 `routine_items` 전체 삭제 후 재생성
- 삭제된 루틴도 과거 세션 기록에는 영향 없음 (스냅샷)

---

#### RoutineItem (루틴 항목)

**테이블:** `routine_items`

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK | 루틴 항목 ID |
| routine_id | BIGINT | FK (routines), NOT NULL | 루틴 ID |
| exercise_id | BIGINT | FK (exercises), NOT NULL | 운동 종목 ID |
| order_in_routine | INT | NOT NULL | 순서 (1부터) |
| sets | INT | NOT NULL | 목표 세트 수 (>=1) |
| rest_seconds | INT | NOT NULL | 휴식 시간 (초, >=0) |

**비즈니스 규칙:**
- `orderInRoutine`은 루틴 내에서 유일

---

#### WorkoutSession (운동 세션)

**테이블:** `workout_sessions`

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK | 세션 ID |
| user_id | BIGINT | FK (users), NOT NULL | 소유자 |
| routine_id | BIGINT | FK (routines), NULLABLE | 루틴 ID (null이면 자유 운동) |
| started_at | TIMESTAMP | NOT NULL | 시작 시간 |
| completed_at | TIMESTAMP | NULLABLE | 완료 시간 (null이면 진행 중) |

**비즈니스 규칙:**
- `routine_id = null` → 자유 운동
- `completedAt = null` → 진행 중
- 사용자당 동시 진행 세션 1개 제한

---

#### WorkoutSet (세트 기록)

**테이블:** `workout_sets`

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK | 세트 ID |
| workout_session_id | BIGINT | FK (workout_sessions), NOT NULL | 세션 ID |
| exercise_id | BIGINT | FK (exercises), NOT NULL | 운동 종목 ID |
| exercise_name | VARCHAR(100) | NOT NULL | 종목명 스냅샷 |
| body_part_snapshot | ENUM | NOT NULL | 부위 스냅샷 |
| set_number | INT | NOT NULL | 세트 번호 (1부터) |
| weight | DECIMAL(5,2) | NOT NULL | 무게 (kg) |
| reps | INT | NOT NULL | 반복 횟수 |

**비즈니스 규칙:**
- 스냅샷 패턴: 운동 종목 수정/삭제해도 기록 불변
- `(workout_session_id, exercise_id, set_number)` 유일
- 세트는 일괄 저장 (완료 시점에 전체 배열 전송)

---

#### SharedRoutine (공유 루틴) 🆕 Phase 3

**테이블:** `shared_routines`

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK | 공유 루틴 ID |
| user_id | BIGINT | FK (users), NOT NULL | 작성자 |
| routine_snapshot_json | JSON | NOT NULL | 루틴 구조 스냅샷 |
| last_session_snapshot_json | JSON | NULLABLE | 최근 수행 기록 스냅샷 |
| view_count | INT | NOT NULL | 조회수 (기본값: 0) |
| import_count | INT | NOT NULL | 가져오기 횟수 (기본값: 0) |

**routine_snapshot_json 구조:**
```json
{
  "title": "상체 루틴 A",
  "description": "가슴, 어깨 집중",
  "items": [
    {
      "exerciseName": "벤치프레스",
      "bodyPart": "CHEST",
      "sets": 5,
      "restSeconds": 90
    }
  ]
}
```

---

## 비즈니스 로직 상세

### 1. 세션 완료 액션 정책

세션 완료 시 4가지 액션 중 1개 선택:

#### 1.1 RECORD_ONLY

**적용 대상:**
- 루틴 기반 세션
- 자유 운동 세션

**동작:**
```
1. completed_at = now()
2. routine_id 유지 (루틴 기반인 경우)
3. workout_sets 저장
```

**결과:**
- 기록만 저장
- 루틴 구조 변경 없음

---

#### 1.2 CREATE_ROUTINE_AND_RECORD

**적용 대상:**
- 자유 운동 세션만 (`routine_id = null`)

**동작:**
```
1. workout_sets 기준으로 새 루틴 생성:
   a. routine.title = 사용자 입력
   b. routine.active = true

2. routine_items 생성:
   a. exercise_id = 세트의 exercise_id
   b. order_in_routine = 종목 등장 순서
   c. sets = max(set_number)
   d. rest_seconds = 0 (기본값)

3. session.routine_id = 생성된 루틴 ID
4. completed_at = now()
```

**예시:**
```
세트 기록:
- 벤치프레스: 1,2,3,4,5번 세트
- 오버헤드 프레스: 1,2,3,4번 세트

생성되는 루틴:
- 종목 1: 벤치프레스 (order=1, sets=5)
- 종목 2: 오버헤드 프레스 (order=2, sets=4)
```

**제약:**
- 루틴 기반 세션에서 사용 시 400 Bad Request

---

#### 1.3 DETACH_AND_RECORD

**적용 대상:**
- 루틴 기반 세션만 (`routine_id != null`)

**동작:**
```
1. session.routine_id = null
2. completed_at = now()
3. workout_sets 저장
```

**결과:**
- 자유 운동으로 전환
- 원본 루틴은 유지

**제약:**
- 자유 운동 세션에서 사용 시 400 Bad Request

---

#### 1.4 UPDATE_ROUTINE_AND_RECORD

**적용 대상:**
- 루틴 기반 세션만 (`routine_id != null`)

**동작:**
```
1. 기존 routine_items 전체 삭제
2. workout_sets 기준으로 routine_items 재생성:
   a. order_in_routine = 종목 등장 순서
   b. sets = max(set_number)
   c. rest_seconds = 0

3. routine.updated_at = now()
4. session.completed_at = now()
```

**영향 범위:**
- 해당 루틴을 참조하는 미래 세션
- 과거 세션은 영향 없음 (스냅샷)

**제약:**
- 자유 운동 세션에서 사용 시 400 Bad Request

---

### 2. 세트 저장 규칙

#### 일괄 저장 방식
```json
POST /api/workouts/sessions/{id}/complete
{
  "action": "RECORD_ONLY",
  "sets": [
    { "exerciseId": 1, "setNumber": 1, "weight": 60, "reps": 12 },
    { "exerciseId": 1, "setNumber": 2, "weight": 70, "reps": 10 }
  ]
}
```

#### 검증 규칙
1. `sets` 배열이 비어있으면 400 Bad Request
2. `(exerciseId, setNumber)` 중복 검증
3. 모든 `exerciseId`가 존재하는지 확인
4. N+1 방지: exercise 일괄 조회

#### 스냅샷 저장
```java
WorkoutSet set = WorkoutSet.builder()
    .workoutSession(session)
    .exercise(exercise)
    .exerciseName(exercise.getName())           // 스냅샷
    .bodyPartSnapshot(exercise.getBodyPart())   // 스냅샷
    .setNumber(request.setNumber())
    .weight(request.weight())
    .reps(request.reps())
    .build();
```

---

### 3. 통계 계산 정책 (Phase 2)

#### 공통 규칙
- **데이터 소스**: `workout_sessions` + `workout_sets`
- **필터**: `completed_at IS NOT NULL`
- **필수 인덱스**:
  ```sql
  INDEX idx_session_user_completed (user_id, completed_at)
  INDEX idx_set_exercise_session (exercise_id, workout_session_id)
  ```

#### 3.1 종목별 볼륨 추이

**계산 공식:**
```sql
SELECT
  DATE(ws.completed_at) as date,
  SUM(wset.weight * wset.reps) as totalVolume
FROM workout_sessions ws
JOIN workout_sets wset ON ws.id = wset.workout_session_id
WHERE ws.user_id = :userId
  AND wset.exercise_id = :exerciseId
  AND ws.completed_at BETWEEN :from AND :to
  AND ws.completed_at IS NOT NULL
GROUP BY DATE(ws.completed_at)
ORDER BY date ASC
```

---

#### 3.2 종목별 최고 중량 추이

**계산 공식:**
```sql
SELECT
  DATE(ws.completed_at) as date,
  MAX(wset.weight) as maxWeight
FROM workout_sessions ws
JOIN workout_sets wset ON ws.id = wset.workout_session_id
WHERE ws.user_id = :userId
  AND wset.exercise_id = :exerciseId
  AND ws.completed_at BETWEEN :from AND :to
  AND ws.completed_at IS NOT NULL
GROUP BY DATE(ws.completed_at)
ORDER BY date ASC
```

---

#### 3.3 루틴별 회차 비교

**응답 예시:**
```json
{
  "routineId": 1,
  "routineTitle": "상체 루틴 A",
  "sessions": [
    {
      "sessionId": 10,
      "index": 1,
      "completedAt": "2026-01-15T19:30:00",
      "totalVolume": 5200,
      "exercises": [
        {
          "exerciseName": "벤치프레스",
          "totalVolume": 3600
        }
      ]
    }
  ]
}
```

---

### 4. 커뮤니티 정책 (Phase 3)

#### 4.1 루틴 공유

**동작:**
1. 루틴 구조를 JSON으로 스냅샷:
```json
{
  "title": "상체 루틴 A",
  "description": "가슴, 어깨 집중",
  "items": [
    {
      "exerciseName": "벤치프레스",
      "bodyPart": "CHEST",
      "orderInRoutine": 1,
      "sets": 5,
      "restSeconds": 90
    }
  ]
}
```

2. 가장 최근 세션 기록을 JSON으로 스냅샷
3. `shared_routines` 테이블에 저장

**스냅샷 이유:**
- 원본 루틴 수정/삭제와 무관하게 공유 내용 유지

---

#### 4.2 루틴 가져오기

**동작:**
1. `routine_snapshot_json` 파싱
2. 현재 사용자 소유의 새 루틴 생성
3. `import_count` 증가

**제약:**
- 세션 기록은 복사하지 않음 (루틴 구조만)

---

#### 4.3 댓글 좋아요

**동작:**
- `comment_likes` 테이블에 추가/삭제
- `comments.like_count` 증감
- UNIQUE 제약으로 중복 방지

---

### 5. 엔티티 비즈니스 규칙

#### User (사용자)
- username/email/nickname 중복 시 409 Conflict
- gender 기본값: UNKNOWN
- 탈퇴 시 cascade 삭제:
  - routines
  - workout_sessions
  - workout_sets
  - custom exercises

#### Exercise (운동 종목)
- 공식 종목: `custom=false`, `createdBy=null`
- 커스텀 종목: `custom=true`, `createdBy=user_id`
- 동일 사용자 내 이름 중복 불가
- 관리자가 공식 종목 추가 시, 동일 이름 커스텀 존재하면 마이그레이션

#### Routine (루틴)
- 루틴 수정 시 `routine_items` 전체 삭제 후 재생성
- 삭제된 루틴도 과거 세션 기록에는 영향 없음 (스냅샷)

#### RoutineItem (루틴 항목)
- `orderInRoutine`은 루틴 내에서 유일
- 루틴 수정 시 전체 교체

#### WorkoutSession (운동 세션)
- `routine_id = null` → 자유 운동
- `completedAt = null` → 진행 중
- 사용자당 동시 진행 세션 1개 제한
- 완료 시 4가지 액션 중 1개 선택

#### WorkoutSet (세트 기록)
- 스냅샷 패턴: 운동 종목 수정/삭제해도 기록 불변
- `(workout_session_id, exercise_id, set_number)` 유일
- 세트는 일괄 저장 (완료 시점에 전체 배열 전송)

---

## 관련 문서

- [README.md](./README.md) - 프로젝트 개요, 진행 상황, 환경 설정
- [API.md](./API.md) - API 명세서 (39개 엔드포인트)
