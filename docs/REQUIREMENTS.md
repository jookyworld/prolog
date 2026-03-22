# PROLOG - 기능 요구사항 명세서

**버전:** v1.0.0
**최종 업데이트:** 2026-03-19

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

### 앱 이름
**ProLog: 상급노하우**

### 한 줄 소개
점진적 과부하 추적과 성장 분석을 통해 꾸준한 운동 습관 형성을 돕는 모바일 앱

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
- 종목은 스냅샷(`exercise_name`, `body_part_snapshot`) 저장 → `workout_session_exercises`
  - 루틴/종목 수정·삭제 이후에도 과거 기록 불변

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

1. **스냅샷 저장** — `workout_session_exercises` 테이블
   - `exercise_name` — 종목명 스냅샷
   - `body_part_snapshot` — 운동 부위 스냅샷
   - 운동 종목 수정/삭제 시에도 과거 기록 불변

2. **종목-세트 분리 구조**
   - `workout_session_exercises.exercise_id` — 원본 종목 FK (참조용)
   - `workout_sets`는 `workout_session_exercise_id`만 참조 (세트 데이터에 종목 정보 없음)

3. **루틴 독립성**
   - 루틴 수정/삭제해도 `workout_sessions` 데이터 유지
   - `session.routine_id` ON DELETE SET NULL, `routine_title_snapshot`으로 제목 보존

---

## 핵심 기능

### v1.0.0: 정식 출시 기준 ✅ (완료, TestFlight 배포 준비 완료)

#### Phase 1: MVP Core ✅
- [x] 회원가입 (3단계 플로우 + 이메일 인증 + 중복 사전 확인)
- [x] 로그인 (JWT)
- [x] 비밀번호 재설정 (이메일 인증 코드)
- [x] 프로필 관리 (닉네임, 신체 정보)
- [x] 회원 탈퇴 (cascade 삭제)
- [x] 기본 운동 종목 제공
- [x] 커스텀 운동 종목 추가
- [x] 루틴 CRUD (생성, 수정, 삭제, 활성화/보관)
- [x] 운동 세션 시작/완료/취소/삭제
- [x] 실시간 세트 기록
- [x] 4가지 완료 액션 정책
- [x] 운동 기록 목록/상세 조회
- [x] 관리자 운동 종목 관리

#### Phase 2-1: 홈 통계 ✅
- [x] 홈 화면 통계 (이번 주/달, 평균 운동 시간, 주간 활동, 부위별 대표 종목 성장 추세)

#### Phase 3-1: 커뮤니티 기본 ✅
- [x] 루틴 공유 (스냅샷 저장, title/description 커스터마이징)
- [x] 공유 루틴 조회 (목록/상세)
- [x] 루틴 가져오기
- [x] 댓글 작성/삭제
- [x] 조회수, 가져오기 횟수 추적

---

### 정식 배포 후 추가 예정 (v1.x~)

> 긴급 버그/수정을 제외하고, 이하 기능은 정식 배포 이후 순차적으로 추가

#### 세트 기록 고도화
- [ ] **세트별 메모** — 세트마다 짧은 텍스트 메모 기록 (workout_sets.note 컬럼 추가)

#### Phase 2-2: 성장 통계
- [ ] 종목별 볼륨 추이
- [ ] 종목별 최고 중량 추이
- [ ] 루틴별 회차 비교
- [ ] 운동 요약 대시보드
- [ ] 개인 최고 기록 (PR)
- [ ] 부위별 통계
- [ ] 월간/연간 통계

#### Phase 3-2: 소셜 기능
- [ ] 댓글 좋아요 (comment_likes 테이블)
- [ ] 공유 루틴 좋아요 (shared_routine_likes 테이블)
- [ ] 루틴 추천 알고리즘

#### Phase 4: Advanced Features
- [ ] OAuth 로그인 (Google, Kakao)
- [ ] 운동 추천 기능
- [ ] 목표 설정 및 관리
- [ ] 알림 기능 (운동 리마인더)
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

#### 4단계: 운동 기록 종목 (WorkoutSessionExercise)
- 세션 내 수행한 종목 단위
- 구성 요소:
  - exercise_id (원본 FK)
  - exercise_name (스냅샷)
  - body_part_snapshot (스냅샷)
  - order_in_session

#### 5단계: 세트 (WorkoutSet)
- 최소 기록 단위
- 구성 요소:
  - set_number
  - weight (kg, 맨몸 운동은 0)
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
┌────────────┐      │WorkoutSession│      ┌──────────┐
│  Exercise  │      └──────┬───────┘      │ Exercise │
└────────────┘             │ 1:N          └──────────┘
                           │
                           ▼
                  ┌──────────────────────┐
                  │WorkoutSessionExercise│ ← exercise_name, body_part_snapshot 스냅샷
                  └──────────┬───────────┘
                             │ 1:N
                             ▼
                      ┌─────────────┐
                      │ WorkoutSet  │ ← set_number, weight, reps
                      └─────────────┘
```

### Phase 3 추가 테이블 (✅ Phase 3-1 완료)

```
┌─────────┐         ┌──────────────────┐
│  User   │◄────────│ SharedRoutine    │
└─────────┘         │ (스냅샷, 읽기전용) │
     ▲              └────────┬─────────┘
     │                       │ 1:N
     │              ┌────────┴─────────┐
     │              │    Comment       │
     │              └──────────────────┘

* CommentLike: Phase 3-2 예정
* SharedRoutine ↔ Routine: FK 없음 (스냅샷 독립성)
```

---

### 주요 엔티티

#### User (사용자)

**테이블:** `users`

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK | 사용자 ID |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 사용자명 (5~20자) |
| password | VARCHAR(255) | NOT NULL | BCrypt 해시 |
| email | VARCHAR(100) | UNIQUE, NOT NULL | 이메일 |
| nickname | VARCHAR(50) | UNIQUE, NOT NULL | 닉네임 (4~30자) |
| gender | ENUM | NOT NULL | MALE, FEMALE, UNKNOWN |
| height | DOUBLE | NOT NULL | 신장 (cm, > 0) |
| weight | DOUBLE | NOT NULL | 체중 (kg, > 0) |
| birth_year | INT | NULLABLE | 출생 연도 |
| marketing_consented_at | DATETIME | NULLABLE | 마케팅 동의 일시 (null이면 미동의) |
| role | ENUM | NOT NULL | USER, ADMIN |

**비즈니스 규칙:**
- 가입 Step1 제출 시 username/email/nickname 중복 사전 확인 (`POST /api/auth/check-duplicates`)
- 가입 전 이메일 인증 필수 — Redis에 인증 완료 상태 저장 (30분 TTL)
- 최종 가입 시 서버에서도 이메일 인증 완료 여부 재확인
- `birth_year`: 가입 시 선택 입력
- `marketing_consented_at`: null이면 미동의, 동의 시 동의 시각 저장 (`PATCH /api/users/me/marketing-consent`)
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
| routine_id | BIGINT | FK (routines), NULLABLE, ON DELETE SET NULL | 루틴 ID (null이면 자유 운동) |
| routine_title_snapshot | VARCHAR(100) | NULLABLE | 세션 시작 시점의 루틴 제목 스냅샷 |
| started_at | TIMESTAMP | NOT NULL | 시작 시간 |
| completed_at | TIMESTAMP | NULLABLE | 완료 시간 (null이면 진행 중) |

**비즈니스 규칙:**
- `routine_id = null` → 자유 운동
- `completedAt = null` → 진행 중
- 사용자당 동시 진행 세션 1개 제한
- 루틴 삭제 시 `routine_id`는 NULL로 처리 (ON DELETE SET NULL), `routine_title_snapshot`으로 제목 보존

---

#### WorkoutSessionExercise (운동 기록 종목)

**테이블:** `workout_session_exercises`

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK | 운동 기록 종목 ID |
| workout_session_id | BIGINT | FK (workout_sessions), NOT NULL | 세션 ID |
| exercise_id | BIGINT | FK (exercises), NOT NULL | 운동 종목 ID (참조용) |
| exercise_name | VARCHAR | NOT NULL | 종목명 스냅샷 |
| body_part_snapshot | ENUM | NOT NULL | 부위 스냅샷 |
| order_in_session | INT | NOT NULL | 세션 내 순서 (1부터) |

**비즈니스 규칙:**
- 스냅샷 패턴: `exercise_name`, `body_part_snapshot`으로 과거 기록 불변 보장
- 세션 삭제 시 CASCADE 삭제

---

#### WorkoutSet (세트 기록)

**테이블:** `workout_sets`

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK | 세트 ID |
| workout_session_exercise_id | BIGINT | FK (workout_session_exercises), NOT NULL | 운동 기록 종목 ID |
| set_number | INT | NOT NULL | 세트 번호 (1부터) |
| weight | DECIMAL(5,2) | NOT NULL | 무게 (kg, 맨몸 운동은 0) |
| reps | INT | NOT NULL | 반복 횟수 |
| note | VARCHAR(500) | NULLABLE | 세트별 메모 (v1.x 추가 예정) |

**비즈니스 규칙:**
- weight = 0: 맨몸 운동 (풀업, 푸시업 등)
- note: 선택 입력, 세트마다 짧은 메모 기록 가능 (v1.x 구현 예정)
- 세트는 일괄 저장 (완료 시점에 전체 배열 전송)
- 운동 기록 종목 삭제 시 CASCADE 삭제

---

#### SharedRoutine (공유 루틴) ✅ Phase 3-1

**테이블:** `shared_routines`

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK | 공유 루틴 ID |
| user_id | BIGINT | FK (users), NOT NULL | 작성자 |
| title | VARCHAR(100) | NOT NULL | 공유 루틴 제목 (사용자 작성) |
| description | TEXT | NULLABLE | 공유 루틴 설명 (사용자 작성) |
| routine_snapshot | JSON | NOT NULL | 루틴 구조 스냅샷 (items 배열, exerciseId 포함) |
| view_count | INT | NOT NULL | 조회수 (기본값: 0) |
| import_count | INT | NOT NULL | 가져오기 횟수 (기본값: 0) |
| created_at | DATETIME | NOT NULL | 생성일시 |
| updated_at | DATETIME | NOT NULL | 수정일시 |

**비즈니스 규칙:**
- 원본 루틴(routines)과 FK 관계 없음 (스냅샷 독립성)
- title, description은 공유 시 사용자가 커스터마이징 가능
- 원본 루틴 삭제/수정과 무관하게 공유 루틴 유지
- 운동이 없는 루틴은 공유 불가

**routine_snapshot 구조:**
```json
{
  "items": [
    {
      "exerciseId": 1,
      "exerciseName": "벤치프레스",
      "bodyPart": "CHEST",
      "orderInRoutine": 1,
      "sets": 5,
      "restSeconds": 90
    }
  ]
}
```

---

#### Comment (댓글) ✅ Phase 3-1

**테이블:** `comments`

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK | 댓글 ID |
| shared_routine_id | BIGINT | FK (shared_routines), NOT NULL | 공유 루틴 ID |
| user_id | BIGINT | FK (users), NOT NULL | 작성자 |
| content | TEXT | NOT NULL | 댓글 내용 |
| created_at | DATETIME | NOT NULL | 생성일시 |
| updated_at | DATETIME | NOT NULL | 수정일시 |

**비즈니스 규칙:**
- 공유 루틴 삭제 시 댓글도 CASCADE 삭제
- 작성자만 삭제 가능
- like_count는 Phase 3 후반에 추가 예정

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

### 2. 회원가입 플로우

#### 3단계 가입 절차

```
Step 1: 계정 정보 입력
  → username (5~20자), password (8~30자), email, nickname (4~30자) 입력
  → "다음" 클릭 시 중복 확인 API 호출 (POST /api/auth/check-duplicates)
  → username/email/nickname 중복 시 해당 필드에 에러 표시, 진행 불가

Step 2: 이메일 인증
  → 인증 코드 발송 (POST /api/auth/email-verification/send)
  → 6자리 코드 입력 후 확인 (POST /api/auth/email-verification/confirm)
  → 인증 완료 상태 Redis에 저장 (TTL 30분)

Step 3: 신체 정보 입력
  → gender (MALE/FEMALE), height (cm), weight (kg) 입력
  → 최종 가입 요청 (POST /api/auth/signup)
  → 서버에서 이메일 인증 완료 여부 재확인 후 계정 생성
```

#### 이메일 인증 보안 정책

| 항목 | 정책 |
|------|------|
| 코드 길이 | 6자리 숫자 |
| 코드 생성 | SecureRandom |
| 코드 TTL | 10분 |
| 발송 횟수 제한 | 10분에 최대 3회 (429 응답) |
| 코드 입력 실패 제한 | 5회 초과 시 코드 무효화, 재발송 필요 |
| 인증 완료 상태 TTL | 30분 |

---

### 3. 세트 저장 규칙

#### 일괄 저장 방식
```json
PATCH /api/workouts/sessions/{id}/complete
{
  "action": "RECORD_ONLY",
  "exercises": [
    {
      "exerciseId": 1,
      "sets": [
        { "setNumber": 1, "weight": 60, "reps": 12 },
        { "setNumber": 2, "weight": 70, "reps": 10 }
      ]
    },
    {
      "exerciseId": 2,
      "sets": [
        { "setNumber": 1, "weight": 0, "reps": 15 }
      ]
    }
  ]
}
```

#### 검증 규칙
1. `exercises` 배열이 비어있으면 400 Bad Request
2. `exerciseId` 중복 검증 (같은 종목 2개 불가)
3. 같은 종목 내 `setNumber` 중복 검증
4. 모든 `exerciseId`가 존재하는지 확인
5. N+1 방지: exercise 일괄 조회

#### 스냅샷 저장 흐름
```java
// 1. WorkoutSessionExercise 먼저 저장 (스냅샷 포함)
WorkoutSessionExercise sessionExercise = WorkoutSessionExercise.builder()
    .workoutSession(session)
    .exercise(exercise)
    .exerciseName(exercise.getName())           // 스냅샷
    .bodyPartSnapshot(exercise.getBodyPart())   // 스냅샷
    .orderInSession(i + 1)
    .build();

// 2. WorkoutSet은 sessionExercise 참조
WorkoutSet set = WorkoutSet.builder()
    .workoutSessionExercise(sessionExercise)
    .setNumber(s.setNumber())
    .weight(s.weight())
    .reps(s.reps())
    .build();
```

---

### 4. 통계 계산 정책 (Phase 2)

#### 공통 규칙
- **데이터 소스**: `workout_sessions` + `workout_session_exercises` + `workout_sets`
- **필터**: `completed_at IS NOT NULL`
- **필수 인덱스**:
  ```sql
  INDEX idx_session_user_completed (user_id, completed_at)
  INDEX idx_session_exercise_session (workout_session_id)
  ```

---

#### 4.1 홈 통계 API (`GET /api/stats/home`) ✅

홈 화면에 표시되는 5가지 통계를 한 번에 반환합니다.

##### 기본 통계 3종
| 항목 | 기준 | 계산 방식 |
|------|------|---------|
| 이번 주 운동 횟수 | 월~일 | `completed_at` 기준 세션 수 |
| 이번 달 운동 횟수 | 1일~오늘 | `completed_at` 기준 세션 수 |
| 평균 운동 시간 | 이번 달 | `AVG(TIMESTAMPDIFF(SECOND, started_at, completed_at))` |

##### 주간 활동 (최근 7일)
- 오늘 포함 과거 7일, 날짜별로 운동 횟수 + 수행한 부위 목록 반환
- 부위는 `body_part_snapshot` 기준, 중복 제거

---

##### 부위별 성장 추세 — 선정 및 계산 정책

**핵심 가치:** 점진적 과부하 — 세트마다 무게 1kg 또는 횟수 1회 증가를 목표로 하는 성장 추적

**1단계: 표시 부위 선정**
- 대상 부위: `CHEST` / `SHOULDER` / `BACK` / `ARM` / `LOWER_BODY` / `CORE` (유산소·기타 제외)
- 최근 30일 내 세션 수 기준 상위 4개 부위 선택
- 이번 달 가장 많이 훈련한 부위가 자동으로 표시됨

**2단계: 부위별 대표 종목 선정**
- 각 부위에서 최근 30일 내 가장 많이 수행한 종목 1개
- 동률이면 가장 최근에 수행한 종목 우선

**3단계: 세션 데이터 수집**
- 대표 종목의 최근 5세션 (오래된 순으로 정렬하여 그래프 표시)

**4단계: 세션별 대표 세트 계산 — 추정 1RM (e1RM)**

볼륨(weight × reps × 세트 수) 대신 **추정 1RM**을 지표로 사용합니다.

볼륨은 세트 수가 늘면 자동으로 증가하고, 무게를 올리고 횟수를 줄이면 감소하는 왜곡이 발생합니다. e1RM은 세트당 무게와 횟수를 하나의 수치로 정규화하므로 "진짜 강해졌는가"를 정확히 반영합니다.

```
e1RM 공식 (Epley):
  e1RM = weight × (1 + min(reps, 20) / 30)

세션 대표값:
  해당 세션의 모든 세트 중 e1RM이 가장 높은 세트 1개
  → 백오프 세트, 펌핑 세트는 자연히 무시됨

맨몸 운동 (weight = 0):
  e1RM 계산 불가 → 최고 reps 세트를 대표값으로 사용
```

**예시:**
```
[벤치프레스 세션]
  세트1: 80kg × 8회  → e1RM = 80 × 1.267 = 101.3kg  ← 대표값
  세트2: 85kg × 5회  → e1RM = 85 × 1.167 = 99.2kg
  세트3: 60kg × 15회 → e1RM = 60 × 1.5   = 90kg  (백오프, 무시)

[성장 계산]
  첫 세션 e1RM: 84kg → 마지막 세션 e1RM: 101.3kg → +20.6%
```

**세션 수에 따른 표시 방식:**
| 세션 수 | 표시 |
|--------|------|
| 3회 이상 | 꺾은선 그래프 + 성장률 |
| 1~2회 | "기록 쌓는 중" — 현재 최고 세트 표시, 그래프 미표시 |
| 0회 | 미표시 |

---

#### 4.2 Phase 2-2 통계 (정식 배포 후 추가 예정)
- [ ] 종목별 e1RM 추이 (기간 선택: 1주/1달/3개월)
- [ ] 루틴별 회차 비교
- [ ] 운동 요약 대시보드
- [ ] 개인 최고 기록 (PR)

---

### 5. 커뮤니티 정책 (Phase 3-1 ✅)

#### 4.1 루틴 공유

**동작:**
1. 사용자가 공유 시 입력:
   - `title`: 공유 루틴 제목 (원본과 별도로 작성 가능)
   - `description`: 공유 루틴 설명 (원본과 별도로 작성 가능)

2. 원본 루틴 구조를 JSON으로 스냅샷 (`routine_snapshot`):
```json
{
  "items": [
    {
      "exerciseId": 1,
      "exerciseName": "벤치프레스",
      "bodyPart": "CHEST",
      "orderInRoutine": 1,
      "sets": 5,
      "restSeconds": 90
    }
  ]
}
```

3. `shared_routines` 테이블에 저장

**설계 특징:**
- 원본 루틴(routines)과 FK 관계 없음 (스냅샷 독립성)
- title, description 별도 컬럼으로 커스터마이징 가능
- 원본 루틴 수정/삭제와 무관하게 공유 내용 유지
- 커뮤니티에서 매력적인 제목/설명 작성 가능
- 운동이 없는 루틴은 공유 불가 (빈 items 배열 거부)

---

#### 4.2 루틴 가져오기

**동작:**
1. `routine_snapshot` 파싱
2. 현재 사용자 소유의 새 루틴 생성 (공유 루틴의 title, description 복사)
3. 운동 종목 매칭 (우선순위):
   - ① `exerciseId`로 공식 종목 조회
   - ② 동일 이름+부위의 본인 커스텀 종목 조회
   - ③ 새 커스텀 종목 자동 생성
4. `import_count` 증가

**제약:**
- 세션 기록은 복사하지 않음 (루틴 구조만)

---

#### 4.3 댓글 좋아요 (Phase 3-2)

**상태:** 📋 Phase 3 후반 예정

**동작:**
- `comment_likes` 테이블에 추가/삭제
- `comments.like_count` 증감
- UNIQUE 제약으로 중복 방지

**참고:**
- Phase 3-1에서는 구현하지 않음
- Phase 3-2에서 comment_likes, shared_routine_likes 테이블 함께 추가

---

### 6. 엔티티 비즈니스 규칙

#### User (사용자)
- username/email/nickname 중복 시 409 Conflict
- gender 기본값: UNKNOWN
- 탈퇴 시 삭제 순서:
  1. workout_sets
  2. workout_session_exercises
  3. workout_sessions
  4. routine_items
  5. routines
  6. custom exercises
  7. shared_routines 및 comments (Phase 3)

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

#### WorkoutSessionExercise (운동 기록 종목)
- 스냅샷 패턴: `exercise_name`, `body_part_snapshot`으로 과거 기록 불변
- 세션 삭제 시 CASCADE 삭제

#### WorkoutSet (세트 기록)
- weight = 0으로 맨몸 운동 표현 (nullable 아님)
- note: 선택 입력, nullable (v1.x 추가 예정)
- 세트는 일괄 저장 (완료 시점에 exercises 배열로 전송)

#### SharedRoutine (공유 루틴) - Phase 3-1 ✅
- 원본 routines와 FK 관계 없음 (스냅샷 독립성)
- title, description은 공유 시 사용자가 커스터마이징
- 원본 루틴 삭제/수정과 무관하게 유지
- 운동이 없는 루틴은 공유 불가

#### Comment (댓글) - Phase 3-1 ✅
- 공유 루틴 삭제 시 CASCADE 삭제
- 작성자만 삭제 가능

---

## 관련 문서

- [README.md](./README.md) - 프로젝트 개요, 진행 상황, 환경 설정
- Swagger UI - API 명세 (http://localhost:8080/swagger-ui)
