# PROLOG - API 명세서

**버전:** v1.0.0
**최종 업데이트:** 2026-02-26

> 본 문서는 ProLog 서비스의 모든 API 엔드포인트를 정의합니다.
> 프론트엔드, 백엔드 개발자는 본 문서를 기준으로 API를 구현하고 연동합니다.

---

## 📋 목차

1. [기본 정보](#기본-정보)
2. [인증 방식](#인증-방식)
3. [에러 코드](#에러-코드)
4. [API 목록](#api-목록)
   - [Auth (인증)](#auth-인증)
   - [Users (사용자)](#users-사용자)
   - [Exercises (운동 종목)](#exercises-운동-종목)
   - [Routines (루틴)](#routines-루틴)
   - [Workout Sessions (운동 세션)](#workout-sessions-운동-세션)
   - [Stats (통계)](#stats-통계)
   - [Community (커뮤니티)](#community-커뮤니티)
   - [Admin (관리자)](#admin-관리자)

---

## 기본 정보

### Base URL
```
로컬 개발: http://localhost:8080/api
프로덕션: https://api.prolog.com/api (TBD)
```

### Content-Type
```
application/json
```

### 인증 헤더
```
Authorization: Bearer {access_token}
```

---

## 인증 방식

### JWT 기반 인증

**Access Token:**
- 유효기간: 1시간
- 헤더에 포함: `Authorization: Bearer {token}`

**Refresh Token:**
- 유효기간: 7일
- Redis에 저장
- `/auth/refresh` 엔드포인트로 갱신

### 인증 필요 여부
각 API 설명에 🔒 표시로 인증 필요 여부 명시

---

## 에러 코드

### HTTP 상태 코드

| 코드 | 의미 | 설명 |
|------|------|------|
| 200 | OK | 요청 성공 |
| 201 | Created | 리소스 생성 성공 |
| 204 | No Content | 성공했으나 응답 본문 없음 |
| 400 | Bad Request | 잘못된 요청 (검증 실패) |
| 401 | Unauthorized | 인증 필요 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 409 | Conflict | 중복 (username, email 등) |
| 500 | Internal Server Error | 서버 오류 |

### 에러 응답 형식

```json
{
  "timestamp": "2026-02-26T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "세트 기록이 없습니다.",
  "path": "/api/workouts/sessions/1/complete"
}
```

---

## API 목록

### 총 39개 API

| 도메인 | 개수 | 상태 |
|--------|------|------|
| Auth (인증) | 6개 | ✅ Phase 1 |
| Users (사용자) | 1개 | ✅ Phase 1 |
| Exercises (운동 종목) | 2개 | ✅ Phase 1 |
| Routines (루틴) | 7개 | ✅ Phase 1 |
| Workout Sessions (운동 세션) | 8개 | ✅ Phase 1 |
| Stats (통계) | 5개 | 🚧 Phase 2 (1개 완료) |
| Community (커뮤니티) | 8개 | 📋 Phase 3 (6개 Phase 3-1, 2개 Phase 3-2) |
| Admin (관리자) | 2개 | ✅ Phase 1 |

---

## Auth (인증)

### 1. 회원가입

```http
POST /auth/signup
```

**인증:** ❌ 불필요

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123!",
  "email": "john@example.com",
  "nickname": "존도우"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "nickname": "존도우",
  "role": "USER",
  "createdAt": "2026-02-26T10:00:00"
}
```

**에러:**
- `409 Conflict` - username, email, nickname 중복

---

### 2. 로그인

```http
POST /auth/login
```

**인증:** ❌ 불필요

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123!"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

**에러:**
- `401 Unauthorized` - 잘못된 인증 정보

---

### 3. 내 정보 조회

```http
GET /auth/me
```

**인증:** 🔒 필요

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "nickname": "존도우",
  "gender": "MALE",
  "height": 175,
  "weight": 70,
  "role": "USER"
}
```

---

### 4. 로그아웃

```http
POST /auth/logout
```

**인증:** 🔒 필요

**Response:** `204 No Content`

---

### 5. 토큰 갱신

```http
POST /auth/refresh
```

**인증:** 🔒 필요 (Refresh Token)

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

---

### 6. 회원 탈퇴

```http
DELETE /auth/deleteMe
```

**인증:** 🔒 필요

**Response:** `204 No Content`

**주의:**
- 모든 관련 데이터 cascade 삭제 (루틴, 세션, 세트, 커스텀 종목)
- 복구 불가능

---

## Users (사용자)

### 1. 프로필 수정

```http
PATCH /users/me
```

**인증:** 🔒 필요

**Request Body:**
```json
{
  "nickname": "새로운닉네임",
  "gender": "MALE",
  "height": 180,
  "weight": 75
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "nickname": "새로운닉네임",
  "gender": "MALE",
  "height": 180,
  "weight": 75
}
```

**에러:**
- `409 Conflict` - nickname 중복

---

## Exercises (운동 종목)

### 1. 운동 종목 목록 조회

```http
GET /exercises?bodyPart=CHEST
```

**인증:** 🔒 필요

**Query Parameters:**
- `bodyPart` (optional): CHEST, SHOULDER, BACK, ARM, LOWER_BODY, CORE, CARDIO, OTHER

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "벤치프레스",
    "bodyPart": "CHEST",
    "partDetail": "중부 가슴",
    "custom": false
  },
  {
    "id": 101,
    "name": "내가만든종목",
    "bodyPart": "CHEST",
    "partDetail": null,
    "custom": true
  }
]
```

---

### 2. 커스텀 운동 종목 추가

```http
POST /exercises/custom
```

**인증:** 🔒 필요

**Request Body:**
```json
{
  "name": "내가만든종목",
  "bodyPart": "CHEST",
  "partDetail": "상부 가슴"
}
```

**Response:** `201 Created`
```json
{
  "id": 101,
  "name": "내가만든종목",
  "bodyPart": "CHEST",
  "partDetail": "상부 가슴",
  "custom": true,
  "createdBy": 1
}
```

**에러:**
- `409 Conflict` - 동일 이름 종목이 이미 존재

---

## Routines (루틴)

### 1. 루틴 생성

```http
POST /routines
```

**인증:** 🔒 필요

**Request Body:**
```json
{
  "title": "상체 루틴 A",
  "description": "가슴과 어깨 집중 루틴",
  "items": [
    {
      "exerciseId": 1,
      "sets": 5,
      "restSeconds": 90
    },
    {
      "exerciseId": 2,
      "sets": 4,
      "restSeconds": 60
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "title": "상체 루틴 A",
  "description": "가슴과 어깨 집중 루틴",
  "active": true,
  "items": [
    {
      "id": 1,
      "exerciseId": 1,
      "exerciseName": "벤치프레스",
      "bodyPart": "CHEST",
      "orderInRoutine": 1,
      "sets": 5,
      "restSeconds": 90
    },
    {
      "id": 2,
      "exerciseId": 2,
      "exerciseName": "오버헤드 프레스",
      "bodyPart": "SHOULDER",
      "orderInRoutine": 2,
      "sets": 4,
      "restSeconds": 60
    }
  ],
  "createdAt": "2026-02-26T10:00:00"
}
```

---

### 2. 내 루틴 목록 조회

```http
GET /routines?active=true
```

**인증:** 🔒 필요

**Query Parameters:**
- `active` (optional): true (활성), false (보관됨)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "상체 루틴 A",
    "description": "가슴과 어깨 집중 루틴",
    "active": true,
    "itemCount": 5,
    "createdAt": "2026-02-26T10:00:00"
  }
]
```

---

### 3. 루틴 상세 조회

```http
GET /routines/{id}
```

**인증:** 🔒 필요

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "상체 루틴 A",
  "description": "가슴과 어깨 집중 루틴",
  "active": true,
  "items": [
    {
      "id": 1,
      "exerciseId": 1,
      "exerciseName": "벤치프레스",
      "bodyPart": "CHEST",
      "orderInRoutine": 1,
      "sets": 5,
      "restSeconds": 90
    }
  ],
  "createdAt": "2026-02-26T10:00:00",
  "updatedAt": "2026-02-26T10:00:00"
}
```

**에러:**
- `404 Not Found` - 루틴 없음
- `403 Forbidden` - 권한 없음

---

### 4. 루틴 수정

```http
PUT /routines/{id}
```

**인증:** 🔒 필요

**Request Body:**
```json
{
  "title": "수정된 루틴 이름",
  "description": "수정된 설명",
  "items": [
    {
      "exerciseId": 1,
      "sets": 5,
      "restSeconds": 90
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "수정된 루틴 이름",
  "description": "수정된 설명",
  "active": true,
  "items": [...],
  "updatedAt": "2026-02-26T11:00:00"
}
```

**주의:**
- 기존 `routine_items` 전체 삭제 후 재생성
- 과거 세션 기록은 영향 없음 (스냅샷)

---

### 5. 루틴 활성화

```http
PATCH /routines/{id}/activate
```

**인증:** 🔒 필요

**Response:** `200 OK`

---

### 6. 루틴 비활성화

```http
PATCH /routines/{id}/archive
```

**인증:** 🔒 필요

**Response:** `200 OK`

---

### 7. 루틴 삭제

```http
DELETE /routines/{id}
```

**인증:** 🔒 필요

**Response:** `204 No Content`

**주의:**
- 과거 세션 기록은 영향 없음 (스냅샷)

---

## Workout Sessions (운동 세션)

### 1. 세션 시작

```http
POST /workouts/sessions
```

**인증:** 🔒 필요

**Request Body:**
```json
{
  "routineId": 1
}
```

**주의:**
- `routineId`가 `null`이면 자유 운동
- 이미 진행 중인 세션이 있으면 400 에러

**Response:** `200 OK`
```json
{
  "id": 100,
  "routineId": 1,
  "routineTitle": "상체 루틴 A",
  "startedAt": "2026-02-26T18:00:00",
  "completedAt": null
}
```

---

### 2. 진행 중인 세션 조회

```http
GET /workouts/sessions/active
```

**인증:** 🔒 필요

**Response:** `200 OK`
```json
{
  "id": 100,
  "routineId": 1,
  "routineTitle": "상체 루틴 A",
  "startedAt": "2026-02-26T18:00:00",
  "completedAt": null
}
```

**Response (진행 중인 세션 없음):** `204 No Content`

---

### 3. 세션 완료

```http
PATCH /workouts/sessions/{id}/complete
```

**인증:** 🔒 필요

**Request Body:**
```json
{
  "action": "RECORD_ONLY",
  "sets": [
    {
      "exerciseId": 1,
      "setNumber": 1,
      "weight": 60,
      "reps": 12
    },
    {
      "exerciseId": 1,
      "setNumber": 2,
      "weight": 70,
      "reps": 10
    },
    {
      "exerciseId": 2,
      "setNumber": 1,
      "weight": 40,
      "reps": 12
    }
  ],
  "routineTitle": "새 루틴 이름"
}
```

**action 타입:**
- `RECORD_ONLY` - 기록만 저장
- `CREATE_ROUTINE_AND_RECORD` - 자유 운동 → 새 루틴 생성 (routineTitle 필수)
- `DETACH_AND_RECORD` - 루틴 기반 → 자유 운동 전환
- `UPDATE_ROUTINE_AND_RECORD` - 루틴 업데이트

**Response:** `200 OK`
```json
{
  "id": 100,
  "routineId": 1,
  "routineTitle": "상체 루틴 A",
  "startedAt": "2026-02-26T18:00:00",
  "completedAt": "2026-02-26T19:30:00"
}
```

**에러:**
- `400 Bad Request` - sets 배열 비어있음
- `400 Bad Request` - action 정책 위반

---

### 4. 세션 취소

```http
DELETE /workouts/sessions/{id}/cancel
```

**인증:** 🔒 필요

**Response:** `204 No Content`

**주의:**
- 진행 중인 세션만 취소 가능
- 완료된 세션은 삭제 API 사용

---

### 5. 세션 삭제

```http
DELETE /workouts/sessions/{id}
```

**인증:** 🔒 필요

**Response:** `204 No Content`

**주의:**
- 완료된 세션만 삭제 가능
- 진행 중인 세션은 취소 API 사용

---

### 6. 세션 목록 조회

```http
GET /workouts/sessions?page=0&size=20
```

**인증:** 🔒 필요

**Query Parameters:**
- `page` (default: 0): 페이지 번호
- `size` (default: 20): 페이지 크기

**Response:** `200 OK`
```json
{
  "content": [
    {
      "id": 100,
      "routineId": 1,
      "routineTitle": "상체 루틴 A",
      "startedAt": "2026-02-26T18:00:00",
      "completedAt": "2026-02-26T19:30:00",
      "exerciseCount": 5,
      "setCount": 25
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 50,
  "totalPages": 3
}
```

---

### 7. 세션 상세 조회

```http
GET /workouts/sessions/{id}
```

**인증:** 🔒 필요

**Response:** `200 OK`
```json
{
  "id": 100,
  "routineId": 1,
  "routineTitle": "상체 루틴 A",
  "startedAt": "2026-02-26T18:00:00",
  "completedAt": "2026-02-26T19:30:00",
  "exercises": [
    {
      "exerciseId": 1,
      "exerciseName": "벤치프레스",
      "sets": [
        {
          "setNumber": 1,
          "weight": 60,
          "reps": 12
        },
        {
          "setNumber": 2,
          "weight": 70,
          "reps": 10
        }
      ]
    }
  ]
}
```

---

### 8. 루틴의 최근 세션 조회

```http
GET /workouts/sessions/routines/{routineId}/last
```

**인증:** 🔒 필요

**Response:** `200 OK`
```json
{
  "id": 95,
  "routineId": 1,
  "routineTitle": "상체 루틴 A",
  "startedAt": "2026-02-25T18:00:00",
  "completedAt": "2026-02-25T19:30:00",
  "exercises": [...]
}
```

**Response (기록 없음):** `204 No Content`

**용도:**
- 점진적 과부하 추적
- 직전 회차 기록 참고

---

## Stats (통계)

### 1. 홈 화면 통계 ✅

```http
GET /stats/home
```

**인증:** 🔒 필요

**Response:** `200 OK`
```json
{
  "thisWeek": {
    "workouts": 3,
    "goal": 5
  },
  "thisMonth": {
    "workouts": 12
  },
  "avgWorkoutDuration": 5400,
  "weeklyActivity": [
    {
      "date": "2026-02-20",
      "dayOfWeek": "월",
      "formattedDate": "2/20",
      "workoutCount": 1,
      "bodyParts": ["CHEST", "SHOULDER"]
    }
  ],
  "exerciseProgress": [
    {
      "exerciseId": 1,
      "exerciseName": "벤치프레스",
      "bodyPart": "CHEST",
      "frequency": 12
    }
  ],
  "recentWorkouts": [
    {
      "sessionId": 100,
      "routineTitle": "상체 루틴 A",
      "completedAt": "2026-02-26T19:30:00",
      "exerciseNames": ["벤치프레스", "오버헤드 프레스"]
    }
  ]
}
```

---

### 2. 종목별 볼륨 추이 🚧

```http
GET /stats/exercises/{exerciseId}/volume?from=2026-01-01&to=2026-02-28
```

**인증:** 🔒 필요
**상태:** 📋 Phase 2

**Query Parameters:**
- `from` (required): 시작 날짜 (YYYY-MM-DD)
- `to` (required): 종료 날짜 (YYYY-MM-DD)

**Response:** `200 OK`
```json
{
  "exerciseId": 1,
  "exerciseName": "벤치프레스",
  "data": [
    {
      "date": "2026-01-15",
      "totalVolume": 3600
    },
    {
      "date": "2026-01-22",
      "totalVolume": 3750
    }
  ]
}
```

---

### 3. 종목별 최고 중량 추이 🚧

```http
GET /stats/exercises/{exerciseId}/max-weight?from=2026-01-01&to=2026-02-28
```

**인증:** 🔒 필요
**상태:** 📋 Phase 2

**Response:** `200 OK`
```json
{
  "exerciseId": 1,
  "exerciseName": "벤치프레스",
  "data": [
    {
      "date": "2026-01-15",
      "maxWeight": 80
    },
    {
      "date": "2026-01-22",
      "maxWeight": 85
    }
  ]
}
```

---

### 4. 루틴별 회차 비교 🚧

```http
GET /stats/routines/{routineId}/progress?limit=10
```

**인증:** 🔒 필요
**상태:** 📋 Phase 2

**Query Parameters:**
- `limit` (default: 10): 최대 회차 수

**Response:** `200 OK`
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
    },
    {
      "sessionId": 25,
      "index": 2,
      "completedAt": "2026-02-01T18:45:00",
      "totalVolume": 5450,
      "exercises": [...]
    }
  ]
}
```

---

### 5. 운동 요약 대시보드 🚧

```http
GET /stats/dashboard
```

**인증:** 🔒 필요
**상태:** 📋 Phase 2

**Response:** `200 OK`
```json
{
  "thisWeek": {
    "workoutCount": 3,
    "totalVolume": 15400
  },
  "thisMonth": {
    "workoutCount": 12,
    "totalVolume": 62300
  },
  "topExercises": [
    {
      "exerciseId": 1,
      "exerciseName": "벤치프레스",
      "frequency": 12,
      "totalVolume": 24500
    }
  ]
}
```

---

## Community (커뮤니티)

**상태:** 📋 Phase 3 (전체)

### 1. 루틴 공유

```http
POST /community/routines
```

**인증:** 🔒 필요

**Request Body:**
```json
{
  "routineId": 5,
  "title": "3개월 만에 벤치 100kg 달성한 상체 루틴",
  "description": "초보자도 따라하기 쉽게 구성했습니다. 주 2-3회 추천!"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "userId": 1,
  "username": "johndoe",
  "title": "3개월 만에 벤치 100kg 달성한 상체 루틴",
  "description": "초보자도 따라하기 쉽게 구성했습니다. 주 2-3회 추천!",
  "routineSnapshot": {
    "items": [...]
  },
  "lastSessionSnapshot": {
    "exercises": [...]
  },
  "viewCount": 0,
  "importCount": 0,
  "createdAt": "2026-02-26T10:00:00"
}
```

**참고:**
- `title`, `description`: 공유 시 작성하는 제목/설명 (원본 루틴과 별도)
- `routineSnapshot`: 루틴 구조만 포함 (items 배열)
- `lastSessionSnapshot`: 최근 수행 기록 (선택사항)

---

### 2. 공유 루틴 목록

```http
GET /community/routines?page=0&size=20&sort=popular
```

**인증:** 🔒 필요

**Query Parameters:**
- `page` (default: 0)
- `size` (default: 20)
- `sort` (default: recent): recent, popular, imported

**Response:** `200 OK`
```json
{
  "content": [
    {
      "id": 1,
      "username": "johndoe",
      "title": "상체 루틴 A",
      "viewCount": 150,
      "importCount": 30,
      "createdAt": "2026-02-26T10:00:00"
    }
  ],
  "totalElements": 100
}
```

---

### 3. 공유 루틴 상세

```http
GET /community/routines/{id}
```

**인증:** 🔒 필요

**Response:** `200 OK`
```json
{
  "id": 1,
  "userId": 1,
  "username": "johndoe",
  "title": "3개월 만에 벤치 100kg 달성한 상체 루틴",
  "description": "초보자도 따라하기 쉽게 구성했습니다. 주 2-3회 추천!",
  "routineSnapshot": {
    "items": [
      {
        "exerciseName": "벤치프레스",
        "bodyPart": "CHEST",
        "orderInRoutine": 1,
        "sets": 5,
        "restSeconds": 90
      }
    ]
  },
  "lastSessionSnapshot": {
    "exercises": [
      {
        "exerciseName": "벤치프레스",
        "sets": [
          { "setNumber": 1, "weight": 60.0, "reps": 12 },
          { "setNumber": 2, "weight": 70.0, "reps": 10 }
        ]
      }
    ]
  },
  "viewCount": 151,
  "importCount": 30,
  "comments": [...],
  "createdAt": "2026-02-26T10:00:00"
}
```

---

### 4. 루틴 가져오기

```http
POST /community/routines/{id}/import
```

**인증:** 🔒 필요

**Response:** `201 Created`
```json
{
  "id": 10,
  "title": "상체 루틴 A",
  "description": "가슴, 어깨 집중",
  "items": [...]
}
```

---

### 5. 댓글 작성

```http
POST /community/routines/{id}/comments
```

**인증:** 🔒 필요

**Request Body:**
```json
{
  "content": "좋은 루틴이네요!"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "userId": 1,
  "username": "johndoe",
  "content": "좋은 루틴이네요!",
  "createdAt": "2026-02-26T10:00:00"
}
```

**참고:**
- `likeCount` 필드는 Phase 3 후반에 추가 예정

---

### 6. 댓글 삭제

```http
DELETE /community/comments/{id}
```

**인증:** 🔒 필요

**Response:** `204 No Content`

---

### 7. 댓글 좋아요 🚧

```http
POST /community/comments/{id}/like
```

**인증:** 🔒 필요
**상태:** 📋 Phase 3 후반

**Response:** `200 OK`

---

### 8. 댓글 좋아요 취소 🚧

```http
DELETE /community/comments/{id}/like
```

**인증:** 🔒 필요
**상태:** 📋 Phase 3 후반

**Response:** `204 No Content`

---

## Admin (관리자)

### 1. 전체 운동 종목 조회

```http
GET /admin/exercises
```

**인증:** 🔒 필요 (ADMIN 권한)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "벤치프레스",
    "bodyPart": "CHEST",
    "custom": false,
    "createdBy": null
  }
]
```

---

### 2. 기본 운동 종목 추가

```http
POST /admin/exercises
```

**인증:** 🔒 필요 (ADMIN 권한)

**Request Body:**
```json
{
  "name": "인클라인 벤치프레스",
  "bodyPart": "CHEST",
  "partDetail": "상부 가슴"
}
```

**Response:** `201 Created`
```json
{
  "id": 50,
  "name": "인클라인 벤치프레스",
  "bodyPart": "CHEST",
  "partDetail": "상부 가슴",
  "custom": false
}
```

**주의:**
- 동일 이름 커스텀 종목이 있으면 자동 마이그레이션

---

## Swagger UI

### 개발 환경
```
http://localhost:8080/swagger-ui.html
```

모든 API는 Swagger에서 실시간으로 테스트 가능

---

## 관련 문서

- [README.md](./README.md) - 프로젝트 개요, 진행 상황, 변경 이력
- [REQUIREMENTS.md](./REQUIREMENTS.md) - 비즈니스 로직, 데이터 모델
