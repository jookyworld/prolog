# 루틴 삭제 기능 개선

**작성일:** 2026-03-07
**버전:** v1.0.0
**작업자:** AI Assistant + User

> 루틴 삭제 시 운동 기록 보존 및 UX 개선 작업 종합 문서

---

## 📋 목차

1. [개요](#개요)
2. [배경 및 문제점](#배경-및-문제점)
3. [해결 방법](#해결-방법)
4. [상세 변경사항](#상세-변경사항)
5. [동작 방식](#동작-방식)
6. [데이터베이스 마이그레이션](#데이터베이스-마이그레이션)
7. [테스트 가이드](#테스트-가이드)
8. [관련 파일 목록](#관련-파일-목록)

---

## 개요

### 🎯 목표

1. **루틴 삭제 가능**: 외래 키 제약으로 인한 삭제 불가 문제 해결
2. **운동 기록 보존**: 루틴 삭제 후에도 과거 운동 기록의 맥락 유지
3. **안전한 삭제 플로우**: 활성 루틴 → 보관 → 삭제의 2단계 프로세스
4. **깔끔한 UX**: 삭제 여부를 과도하게 강조하지 않는 자연스러운 표시

### ✅ 달성한 결과

- ✅ 루틴 물리적 삭제 가능
- ✅ 과거 운동 기록의 루틴 제목 보존 (스냅샷)
- ✅ 실수 방지를 위한 2단계 삭제 플로우
- ✅ 깔끔하고 자연스러운 UI/UX

---

## 배경 및 문제점

### 🚨 초기 문제

#### 1. **루틴 삭제 불가**

```
ERROR: Cannot delete or update a parent row:
a foreign key constraint fails (`prolog`.`workout_sessions`,
CONSTRAINT `FK4q6pnw9nar0dxwb0qsofyefea`
FOREIGN KEY (`routine_id`) REFERENCES `routines` (`id`))
```

**원인:**
- `WorkoutSession`이 `Routine`을 외래 키로 참조
- JPA 기본값: `ON DELETE RESTRICT`
- 루틴을 참조하는 세션이 있으면 삭제 불가

#### 2. **운동 기록 맥락 손실 우려**

루틴을 삭제하면 과거 운동 기록에서:
- "어떤 루틴으로 운동했는지" 정보 손실
- 모두 "자유 운동"으로 표시될 가능성

#### 3. **실수로 삭제 위험**

- 활성 루틴을 바로 삭제 가능
- 복구 불가능한 물리적 삭제

---

## 해결 방법

### 🎯 핵심 전략

#### 1. **스냅샷 패턴 도입**

```java
// WorkoutSession.java
@Column(name = "routine_title_snapshot", length = 100)
private String routineTitleSnapshot;
```

- 세션 시작 시 루틴 제목을 스냅샷으로 저장
- 루틴 삭제 후에도 제목 보존
- 기존 스냅샷 패턴(`exercise_name`, `body_part_snapshot`)과 일관성

#### 2. **ON DELETE SET NULL**

```sql
ALTER TABLE workout_sessions
ADD CONSTRAINT fk_workout_sessions_routines
FOREIGN KEY (routine_id) REFERENCES routines(id)
ON DELETE SET NULL;
```

- 루틴 삭제 시 `routine_id`만 `NULL`로 변경
- `WorkoutSession` 자체는 보존
- 스냅샷으로 제목은 유지

#### 3. **2단계 삭제 플로우**

```
활성 루틴 → [보관하기] → 보관 루틴 → [삭제] → 삭제 완료
```

- 활성 루틴: 보관만 가능
- 보관 루틴: 활성화 또는 삭제 가능
- 실수 방지 및 명확한 의도 확인

#### 4. **자연스러운 UI**

- 삭제된 루틴: 제목 그대로 표시
- "(삭제됨)" 같은 부정적 표현 제거
- 깔끔하고 과거 기록에 집중하는 UX

---

## 상세 변경사항

### 📦 백엔드 (Backend)

#### 1. **엔티티 변경**

##### `WorkoutSession.java`

```java
// 스냅샷 필드 추가
@Column(name = "routine_title_snapshot", length = 100)
private String routineTitleSnapshot;

// 외래 키 제약 변경
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "routine_id",
    foreignKey = @ForeignKey(
        name = "fk_workout_sessions_routines",
        foreignKeyDefinition = "FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE SET NULL"
    )
)
private Routine routine;

// 생성자에서 스냅샷 자동 저장
private WorkoutSession(User user, Routine routine, LocalDateTime startedAt) {
    this.user = user;
    this.routine = routine;
    this.routineTitleSnapshot = routine != null ? routine.getTitle() : null;
    this.startedAt = startedAt;
}
```

#### 2. **서비스 레이어**

##### `RoutineService.java`

```java
// 의존성 추가
private final WorkoutSessionRepository workoutSessionRepository;

@Transactional
public void deleteRoutine(Long userId, Long routineId) {
    Routine routine = getRoutineAndValidateOwner(userId, routineId);

    // 1. RoutineItem 삭제
    routineItemRepository.deleteAll(
        routineItemRepository.findByRoutineIdOrderByOrderInRoutineAsc(routineId)
    );

    // 2. Routine 삭제 (물리적)
    // WorkoutSession.routineTitleSnapshot이 있으므로
    // routine_id가 null이 되어도 과거 기록에 제목은 보존됨
    routineRepository.delete(routine);
}
```

#### 3. **Repository**

##### `WorkoutSessionRepository.java`

```java
// 루틴 삭제 시 사용 (현재는 미사용, 향후 확장 대비)
List<WorkoutSession> findByRoutine_Id(Long routineId);
```

#### 4. **Response DTO**

모든 DTO에서 스냅샷 우선 반환:

```java
private static String getRoutineTitle(WorkoutSession session) {
    // 1순위: 스냅샷 (루틴 삭제되어도 보존됨)
    if (session.getRoutineTitleSnapshot() != null) {
        return session.getRoutineTitleSnapshot();
    }
    // 2순위: 현재 루틴 (하위 호환)
    if (session.getRoutine() != null) {
        return session.getRoutine().getTitle();
    }
    // 3순위: 자유 운동
    return null;
}
```

**수정된 DTO:**
- `WorkoutSessionResponse.java`
- `WorkoutSessionListItemResponse.java`
- `WorkoutSessionDetailResponse.java`
- `WorkoutSessionCompleteResponse.java`

---

### 📱 프론트엔드 (Frontend)

#### 1. **타입 정의**

##### `lib/types/workout.ts`

```typescript
// 간결하고 명확한 변환 로직
export function toWorkoutSession(
  res: WorkoutSessionListItemRes,
): WorkoutSession {
  // 제목: routineTitle이 있으면 사용, 없으면 "자유 운동"
  const title = res.routineTitle ?? "자유 운동";

  // 타입: routineTitle이 있으면 루틴 기반 (삭제되었어도)
  const type = res.routineTitle ? "routine" : "free";

  return {
    id: String(res.sessionId),
    title,
    type,
    completedAt: res.completedAt,
  };
}

// toWorkoutSessionDetail도 동일한 로직
```

**핵심 로직:**
- `routineTitle`이 있으면 → 그대로 사용
- `routineTitle`이 없으면 → "자유 운동"
- 삭제 여부는 표시하지 않음 (깔끔한 UX)

#### 2. **루틴 목록 화면**

##### `app/(tabs)/routine/index.tsx`

```typescript
const handleLongPress = (routine: RoutineListItem) => {
  if (routine.active) {
    // 활성 루틴: 보관만 가능
    Alert.alert(routine.title, "루틴을 보관하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "보관하기", onPress: () => handleArchive(routine) },
    ]);
  } else {
    // 보관 루틴: 활성화 또는 삭제
    Alert.alert(routine.title, undefined, [
      { text: "취소", style: "cancel" },
      { text: "다시 활성화", onPress: () => handleActivate(routine) },
      { text: "삭제", style: "destructive", onPress: () => handleDelete(routine) },
    ]);
  }
};
```

#### 3. **루틴 상세 화면**

##### `app/(tabs)/routine/[id].tsx`

```typescript
const handleSettingsMenu = () => {
  if (!routine) return;

  const buttons = [{ text: "취소", style: "cancel" }];

  buttons.push({ text: "커뮤니티에 공유", onPress: handleShare });

  if (routine.active) {
    // 활성 루틴: 보관만 가능 (삭제 불가)
    buttons.push({ text: "보관하기", onPress: handleArchive });
  } else {
    // 보관 루틴: 활성화 또는 삭제 가능
    buttons.push({ text: "다시 활성화", onPress: handleActivate });
    buttons.push({
      text: "루틴 삭제",
      style: "destructive",
      onPress: handleDelete,
    });
  }

  buttons.push({
    text: "루틴 수정",
    onPress: () => router.push(`/(tabs)/routine/new?routineId=${id}`),
  });

  Alert.alert(undefined, undefined, buttons);
};
```

---

### 🗄️ 데이터베이스 변경

#### 1. **스키마 변경**

```sql
-- routine_title_snapshot 컬럼 추가
ALTER TABLE workout_sessions
ADD COLUMN routine_title_snapshot VARCHAR(100) NULL
COMMENT '세션 시작 시점의 루틴 제목 스냅샷';

-- 외래 키 재설정
ALTER TABLE workout_sessions DROP FOREIGN KEY FK4q6pnw9nar0dxwb0qsofyefea;
ALTER TABLE workout_sessions
ADD CONSTRAINT fk_workout_sessions_routines
FOREIGN KEY (routine_id) REFERENCES routines(id)
ON DELETE SET NULL;
```

#### 2. **기존 데이터 마이그레이션**

```sql
-- 기존 세션의 스냅샷 채우기
UPDATE workout_sessions ws
INNER JOIN routines r ON ws.routine_id = r.id
SET ws.routine_title_snapshot = r.title
WHERE ws.routine_title_snapshot IS NULL
  AND ws.routine_id IS NOT NULL;
```

---

## 동작 방식

### 📊 데이터 흐름

#### 1. **세션 시작 시**

```
User → Start Session
  ↓
WorkoutSession 생성
  ├─ routine_id = 1
  ├─ routine_title_snapshot = "상체 루틴 A"  ← 스냅샷 저장
  └─ started_at = now()
  ↓
DB 저장
```

#### 2. **루틴 삭제 시**

```
User → Delete Routine
  ↓
RoutineService.deleteRoutine()
  ├─ 1. RoutineItems 삭제
  └─ 2. Routine 삭제 (물리적)
  ↓
DB: ON DELETE SET NULL 트리거
  ↓
WorkoutSession 자동 업데이트
  ├─ routine_id = NULL  ← 외래 키 제거
  └─ routine_title_snapshot = "상체 루틴 A"  ← 보존됨!
```

#### 3. **운동 기록 조회 시**

```
User → View History
  ↓
WorkoutSessionResponse 생성
  ↓
getRoutineTitle() 호출
  ├─ 1순위: routine_title_snapshot → "상체 루틴 A" ✅
  ├─ 2순위: routine.getTitle()
  └─ 3순위: null → "자유 운동"
  ↓
화면 표시: "상체 루틴 A" [루틴]
```

---

### 🎨 사용자 경험

#### **시나리오 1: 활성 루틴 삭제 시도**

```
1. 루틴 목록에서 "상체 루틴 A" 롱프레스
2. Alert: [취소] [보관하기]  ← 삭제 버튼 없음
3. "보관하기" 선택
4. 루틴이 보관함으로 이동
```

#### **시나리오 2: 보관 루틴 삭제**

```
1. 보관함에서 "상체 루틴 A" 롱프레스
2. Alert: [취소] [다시 활성화] [삭제]
3. "삭제" 선택
4. 확인 Alert: "이 루틴을 삭제하시겠습니까?"
5. "삭제" 확인
6. 루틴 삭제 완료
```

#### **시나리오 3: 삭제 후 운동 기록 조회**

```
운동 기록 목록:
┌──────────────────────────┐
│ 오늘                    │
│ 하체 루틴 B       [루틴]│  ← 루틴 존재
└──────────────────────────┘

┌──────────────────────────┐
│ 어제                    │
│ 상체 루틴 A       [루틴]│  ← 루틴 삭제됨 (깔끔하게 표시)
└──────────────────────────┘

┌──────────────────────────┐
│ 2일 전                  │
│ 자유 운동         [자유]│  ← 원래 자유 운동
└──────────────────────────┘
```

**특징:**
- ✅ 제목 보존: "상체 루틴 A"
- ✅ 타입 유지: [루틴] 뱃지
- ✅ 필터 정상: "루틴" 필터에 포함
- ✅ 차이 없음: 삭제 여부 표시 안 함 (깔끔)

---

## 데이터베이스 마이그레이션

### 🚀 Flyway 자동 마이그레이션 (권장)

#### 1. **의존성 추가**

##### `build.gradle.kts`

```kotlin
dependencies {
    // ...
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-mysql")
}
```

#### 2. **설정 추가**

##### `application-local.yml`

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate  # update → validate로 변경

  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration
```

#### 3. **마이그레이션 파일**

##### `backend/src/main/resources/db/migration/V2__add_routine_snapshot.sql`

```sql
-- 루틴 제목 스냅샷 기능 추가

-- 1. routine_title_snapshot 컬럼 추가
ALTER TABLE workout_sessions
ADD COLUMN IF NOT EXISTS routine_title_snapshot VARCHAR(100) NULL
COMMENT '세션 시작 시점의 루틴 제목 스냅샷';

-- 2. 기존 데이터의 스냅샷 채우기
UPDATE workout_sessions ws
INNER JOIN routines r ON ws.routine_id = r.id
SET ws.routine_title_snapshot = r.title
WHERE ws.routine_title_snapshot IS NULL
  AND ws.routine_id IS NOT NULL;

-- 3. 기존 외래 키 삭제
ALTER TABLE workout_sessions
DROP FOREIGN KEY IF EXISTS FK4q6pnw9nar0dxwb0qsofyefea;

-- 4. 새로운 외래 키 추가 (ON DELETE SET NULL)
ALTER TABLE workout_sessions
ADD CONSTRAINT fk_workout_sessions_routines
FOREIGN KEY (routine_id) REFERENCES routines(id)
ON DELETE SET NULL
ON UPDATE RESTRICT;
```

#### 4. **실행**

```bash
cd backend
./gradlew bootRun
```

Flyway가 자동으로 마이그레이션을 실행합니다.

---

### 🔧 수동 마이그레이션 (대안)

MySQL에 직접 접속하여 실행:

```sql
USE prolog;

-- 1. 스냅샷 컬럼 추가
ALTER TABLE workout_sessions
ADD COLUMN routine_title_snapshot VARCHAR(100) NULL;

-- 2. 기존 데이터 마이그레이션
UPDATE workout_sessions ws
INNER JOIN routines r ON ws.routine_id = r.id
SET ws.routine_title_snapshot = r.title
WHERE ws.routine_title_snapshot IS NULL;

-- 3. 외래 키 재설정
ALTER TABLE workout_sessions DROP FOREIGN KEY FK4q6pnw9nar0dxwb0qsofyefea;
ALTER TABLE workout_sessions
ADD CONSTRAINT fk_workout_sessions_routines
FOREIGN KEY (routine_id) REFERENCES routines(id)
ON DELETE SET NULL;

-- 4. 확인
SHOW CREATE TABLE workout_sessions\G
```

---

## 테스트 가이드

### ✅ 테스트 시나리오

#### 1. **루틴 생성 및 운동**

```bash
# 1. 루틴 생성
POST /api/routines
{
  "title": "테스트 루틴",
  "description": "테스트용 루틴",
  "items": [
    { "exerciseId": 1, "sets": 5, "restSeconds": 90 }
  ]
}
# 응답: { "id": 1, "title": "테스트 루틴", ... }

# 2. 세션 시작
POST /api/workouts/sessions
{ "routineId": 1 }
# DB 확인: routine_title_snapshot = "테스트 루틴"

# 3. 세션 완료
PATCH /api/workouts/sessions/{id}/complete
{
  "action": "RECORD_ONLY",
  "sets": [
    { "exerciseId": 1, "setNumber": 1, "weight": 60, "reps": 10 }
  ]
}
```

#### 2. **루틴 삭제 전 조회**

```bash
# 운동 기록 조회
GET /api/workouts/sessions/{id}

# 응답:
{
  "sessionId": 100,
  "routineId": 1,
  "routineTitle": "테스트 루틴",  ← 루틴 존재
  ...
}
```

#### 3. **활성 루틴 삭제 시도 (프론트엔드)**

```
1. 루틴 목록에서 "테스트 루틴" 롱프레스
2. 팝업: [취소] [보관하기]  ← "삭제" 없음 ✅
3. "보관하기" 선택
4. 루틴 상태: active = false
```

#### 4. **보관 루틴 삭제**

```bash
# 1. 루틴 목록에서 보관함 진입
# 2. "테스트 루틴" 롱프레스 → "삭제" 선택

# 백엔드
DELETE /api/routines/1

# DB 확인
SELECT * FROM routines WHERE id = 1;  -- 결과 없음 ✅
SELECT routine_id, routine_title_snapshot FROM workout_sessions WHERE id = 100;
-- routine_id: NULL
-- routine_title_snapshot: "테스트 루틴"  ✅
```

#### 5. **루틴 삭제 후 조회**

```bash
# 운동 기록 조회
GET /api/workouts/sessions/{id}

# 응답:
{
  "sessionId": 100,
  "routineId": null,               ← 루틴 삭제됨
  "routineTitle": "테스트 루틴",  ← 스냅샷으로 보존! ✅
  ...
}
```

#### 6. **프론트엔드 화면 확인**

```
운동 기록 목록:
- 제목: "테스트 루틴"  ← 동일하게 표시
- 뱃지: [루틴]         ← 타입 유지
- 차이: 없음           ← 깔끔한 UX ✅
```

---

### 🔍 검증 포인트

#### **백엔드:**
- [ ] `routine_title_snapshot` 컬럼 존재
- [ ] 세션 시작 시 스냅샷 자동 저장
- [ ] 루틴 삭제 가능 (에러 없음)
- [ ] Response DTO에서 스냅샷 우선 반환

#### **데이터베이스:**
- [ ] 외래 키: `ON DELETE SET NULL`
- [ ] 루틴 삭제 시 `routine_id` → `NULL`
- [ ] `routine_title_snapshot` 보존

#### **프론트엔드:**
- [ ] 활성 루틴: "보관" 버튼만 표시
- [ ] 보관 루틴: "삭제" 버튼 표시
- [ ] 삭제된 루틴: 제목 그대로 표시 (깔끔)
- [ ] 타입 필터: "루틴" 필터에 포함

---

## 관련 파일 목록

### 📦 백엔드 (Backend)

#### **엔티티:**
- `backend/src/main/java/com/back/domain/workout/session/entity/WorkoutSession.java`
- `backend/src/main/java/com/back/domain/routine/routine/entity/Routine.java`

#### **Repository:**
- `backend/src/main/java/com/back/domain/workout/session/repository/WorkoutSessionRepository.java`
- `backend/src/main/java/com/back/domain/routine/routine/repository/RoutineRepository.java`

#### **Service:**
- `backend/src/main/java/com/back/domain/routine/routine/service/RoutineService.java`

#### **DTO:**
- `backend/src/main/java/com/back/domain/workout/session/dto/WorkoutSessionResponse.java`
- `backend/src/main/java/com/back/domain/workout/session/dto/WorkoutSessionListItemResponse.java`
- `backend/src/main/java/com/back/domain/workout/session/dto/WorkoutSessionDetailResponse.java`
- `backend/src/main/java/com/back/domain/workout/session/dto/WorkoutSessionCompleteResponse.java`

#### **설정:**
- `backend/build.gradle.kts`
- `backend/src/main/resources/application-local.yml`
- `backend/src/main/resources/db/migration/V2__add_routine_snapshot.sql`

---

### 📱 프론트엔드 (Frontend)

#### **타입:**
- `app/lib/types/workout.ts`

#### **화면:**
- `app/app/(tabs)/routine/index.tsx` (루틴 목록)
- `app/app/(tabs)/routine/[id].tsx` (루틴 상세)
- `app/app/(tabs)/profile/history/index.tsx` (운동 기록 목록)
- `app/app/(tabs)/profile/history/[id].tsx` (운동 기록 상세)

---

## 부록

### 🎯 설계 철학

#### 1. **스냅샷 패턴 일관성**

기존 패턴:
```java
workout_sets.exercise_name       // 스냅샷
workout_sets.body_part_snapshot  // 스냅샷
```

새로운 패턴:
```java
workout_sessions.routine_title_snapshot  // 스냅샷 ✅
```

#### 2. **깔끔한 UX 원칙**

**"과거는 과거일 뿐"**
- 사용자는 "언제 무엇을 했는지"만 중요
- 루틴 삭제 여부는 덜 중요
- 부정적 표현 제거 → 자연스러운 경험

#### 3. **안전한 삭제 플로우**

```
활성 → 보관 → 삭제
  ↓      ↓      ↓
 사용중  대기  영구삭제
```

- 2단계 프로세스로 실수 방지
- 명확한 의도 확인
- 복구 가능성 (보관 단계)

---

### 📊 영향 분석

#### **데이터베이스:**
- 컬럼 추가: 1개 (`routine_title_snapshot`)
- 외래 키 변경: 1개 (ON DELETE SET NULL)
- 기존 데이터: 자동 마이그레이션

#### **API:**
- 변경 없음 (응답만 수정)
- 하위 호환성 유지

#### **사용자 경험:**
- 개선: 루틴 삭제 가능
- 개선: 안전한 삭제 플로우
- 개선: 깔끔한 UI/UX

---

### ✅ 체크리스트

#### **배포 전:**
- [ ] 데이터베이스 백업
- [ ] Flyway 마이그레이션 테스트
- [ ] 기존 세션 데이터 스냅샷 채우기 확인
- [ ] 외래 키 제약 변경 확인

#### **배포 후:**
- [ ] 루틴 삭제 동작 확인
- [ ] 운동 기록 조회 정상 동작
- [ ] 필터링 정상 동작
- [ ] 성능 모니터링

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-03-07 | v1.0.0 | 초기 작성 (루틴 삭제 기능 개선 완료) |

---

**작성자:** AI Assistant & User
**최종 업데이트:** 2026-03-07
